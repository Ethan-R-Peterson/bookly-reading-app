import type { SupabaseClient } from "@supabase/supabase-js";
import type { Book } from "@/types";
import {
  searchGoogleBooks,
  getRelatedVolumes,
  type GoogleBookVolume,
} from "@/lib/google-books";

interface ScoredBook extends Book {
  score: number;
}

/**
 * Normalize a title for fuzzy comparison.
 * Strips subtitles, edition markers, parentheticals, punctuation, and lowercases.
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\(.*?\)/g, "")           // remove parentheticals
    .replace(/[:–—-].*/g, "")          // remove subtitles after : or dashes
    .replace(/\b(edition|ed|vol|volume|book)\b.*$/i, "") // remove edition/vol markers
    .replace(/[^a-z0-9\s]/g, "")       // remove punctuation
    .replace(/\s+/g, " ")              // collapse whitespace
    .trim();
}

/**
 * Check if two titles are fuzzy-similar (same book, different edition/format).
 */
function isSimilarTitle(a: string, b: string): boolean {
  const na = normalizeTitle(a);
  const nb = normalizeTitle(b);
  if (na === nb) return true;
  if (na.length > 3 && nb.length > 3) {
    if (na.includes(nb) || nb.includes(na)) return true;
  }
  return false;
}

/**
 * Compute a recency weight for a book based on when the user started it.
 * Books started in the last 7 days get weight 1.0, decaying to 0.2 for
 * books started 90+ days ago. This makes recent reading tastes matter more.
 */
function recencyWeight(startedAt: string): number {
  const daysAgo =
    (Date.now() - new Date(startedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysAgo <= 7) return 1.0;
  if (daysAgo <= 30) return 0.7;
  if (daysAgo <= 90) return 0.4;
  return 0.2;
}

/**
 * Recommendation scoring weights:
 *
 * genre_match       (5x) - weighted by recency of when user read that genre
 * author_match      (2x) - same author, weighted by recency
 * related_volume    (3x) - Google Books says this is related to a user's book
 * rating            (2x) - Google Books average rating / 5
 * group_popularity  (2x) - how many group members are reading this
 * similar_length    (1x) - page count within 30% of user's average
 * ratings_count     (1x) - log-scaled review count
 * global_popularity (1x) - how many total users are reading this
 */
export async function getRecommendations(
  supabase: SupabaseClient,
  userId: string
): Promise<ScoredBook[]> {
  // 1. Get user's books with timing info
  const { data: userBooks } = await supabase
    .from("user_books")
    .select(
      "book_id, started_at, book:books(google_books_id, genre, page_count, author, title)"
    )
    .eq("user_id", userId)
    .order("started_at", { ascending: false });

  const readBookIds = new Set(userBooks?.map((ub) => ub.book_id) ?? []);
  const readTitles: string[] = [];

  // Build recency-weighted genre and author maps
  // Key = genre/author, Value = highest recency weight seen
  const genreWeights = new Map<string, number>();
  const authorWeights = new Map<string, number>();
  const userAuthors = new Set<string>();
  let totalPages = 0;
  let pageCountBooks = 0;

  // Track recently read google_books_ids for related volume lookups
  const recentGoogleIds: { id: string; categories?: string[] }[] = [];

  for (const ub of userBooks ?? []) {
    const book = ub.book as unknown as {
      google_books_id: string;
      genre: string | null;
      page_count: number | null;
      author: string | null;
      title: string;
    } | null;
    if (!book) continue;

    readTitles.push(book.title);
    const weight = recencyWeight(ub.started_at);

    if (book.genre) {
      const existing = genreWeights.get(book.genre) ?? 0;
      genreWeights.set(book.genre, Math.max(existing, weight));
    }

    if (book.author) {
      for (const a of book.author.split(",")) {
        const name = a.trim().toLowerCase();
        userAuthors.add(name);
        const existing = authorWeights.get(name) ?? 0;
        authorWeights.set(name, Math.max(existing, weight));
      }
    }

    if (book.page_count) {
      totalPages += book.page_count;
      pageCountBooks++;
    }

    // Only fetch related volumes for the 3 most recent books
    if (recentGoogleIds.length < 3) {
      recentGoogleIds.push({
        id: book.google_books_id,
        categories: book.genre ? [book.genre] : undefined,
      });
    }
  }

  const avgPageCount = pageCountBooks > 0 ? totalPages / pageCountBooks : 300;

  // 2. Get group member data
  const { data: myMemberships } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", userId);

  const groupIds = myMemberships?.map((m) => m.group_id) ?? [];

  let groupMemberIds: string[] = [];
  if (groupIds.length > 0) {
    const { data: groupMembers } = await supabase
      .from("group_members")
      .select("user_id")
      .in("group_id", groupIds);

    groupMemberIds = [
      ...new Set(
        (groupMembers ?? [])
          .map((gm) => gm.user_id)
          .filter((id) => id !== userId)
      ),
    ];
  }

  // 3. Group popularity + group authors
  const groupBookCounts: Record<string, number> = {};
  if (groupMemberIds.length > 0) {
    const { data: groupUserBooks } = await supabase
      .from("user_books")
      .select("book_id, book:books(author)")
      .in("user_id", groupMemberIds);

    for (const gub of groupUserBooks ?? []) {
      groupBookCounts[gub.book_id] =
        (groupBookCounts[gub.book_id] ?? 0) + 1;
      const book = gub.book as unknown as { author: string | null } | null;
      if (book?.author) {
        for (const a of book.author.split(",")) {
          const name = a.trim().toLowerCase();
          if (!authorWeights.has(name)) {
            authorWeights.set(name, 0.3); // group authors get a baseline weight
          }
        }
      }
    }
  }

  // 4. Global popularity
  const { data: allUserBooks } = await supabase
    .from("user_books")
    .select("book_id");

  const globalBookCounts: Record<string, number> = {};
  for (const aub of allUserBooks ?? []) {
    globalBookCounts[aub.book_id] =
      (globalBookCounts[aub.book_id] ?? 0) + 1;
  }

  // 5. Get candidate books from DB
  const { data: dbBooks } = await supabase
    .from("books")
    .select("*")
    .limit(200);

  let candidateBooks = (dbBooks ?? []).filter(
    (b) =>
      !readBookIds.has(b.id) &&
      b.page_count &&
      !readTitles.some((t) => isSimilarTitle(t, b.title))
  );

  // 6. Fetch related volumes from Google Books for the user's recent reads
  // This is the key improvement — we ask Google directly "what's similar?"
  const relatedGoogleIds = new Set<string>();

  const existingGoogleIds = new Set(
    (dbBooks ?? []).map((b) => b.google_books_id)
  );
  const fetchedBooks: typeof candidateBooks = [];

  for (const recent of recentGoogleIds) {
    try {
      const related = await getRelatedVolumes(recent.id, recent.categories);
      for (const v of related) {
        if (!v.volumeInfo.title || !v.volumeInfo.pageCount) continue;

        relatedGoogleIds.add(v.id);

        if (existingGoogleIds.has(v.id)) continue;
        if (fetchedBooks.some((b) => b.google_books_id === v.id)) continue;

        const bookData = {
          google_books_id: v.id,
          title: v.volumeInfo.title,
          author: v.volumeInfo.authors?.join(", ") ?? null,
          cover_url: v.volumeInfo.imageLinks?.thumbnail ?? null,
          page_count: v.volumeInfo.pageCount ?? null,
          genre: v.volumeInfo.categories?.[0] ?? null,
          description: v.volumeInfo.description ?? null,
          rating: v.volumeInfo.averageRating ?? null,
          ratings_count: v.volumeInfo.ratingsCount ?? null,
        };

        const { data: inserted } = await supabase
          .from("books")
          .upsert(bookData, { onConflict: "google_books_id" })
          .select()
          .single();

        if (inserted) {
          existingGoogleIds.add(v.id);
          fetchedBooks.push(inserted);
        }
      }
    } catch {
      // Continue
    }
  }

  // 7. If still not enough candidates, do genre-based searches
  if (candidateBooks.length + fetchedBooks.length < 10) {
    const searchQueries: string[] = [];

    // Sort genres by recency weight (most recent first)
    const sortedGenres = [...genreWeights.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([genre]) => genre);

    for (const genre of sortedGenres) {
      searchQueries.push(`subject:${genre}`);
    }

    // Author searches for recent authors only
    const sortedAuthors = [...authorWeights.entries()]
      .filter(([, w]) => w >= 0.7) // only recent authors
      .sort((a, b) => b[1] - a[1])
      .map(([author]) => author);

    for (const author of sortedAuthors.slice(0, 2)) {
      searchQueries.push(`inauthor:"${author}"`);
    }

    if (searchQueries.length === 0) {
      searchQueries.push("subject:fiction bestseller");
    }

    for (const query of searchQueries.slice(0, 3)) {
      try {
        const volumes = await searchGoogleBooks(query);
        for (const v of volumes) {
          if (!v.volumeInfo.title || !v.volumeInfo.pageCount) continue;
          if (existingGoogleIds.has(v.id)) continue;
          if (fetchedBooks.some((b) => b.google_books_id === v.id)) continue;

          const bookData = {
            google_books_id: v.id,
            title: v.volumeInfo.title,
            author: v.volumeInfo.authors?.join(", ") ?? null,
            cover_url: v.volumeInfo.imageLinks?.thumbnail ?? null,
            page_count: v.volumeInfo.pageCount ?? null,
            genre: v.volumeInfo.categories?.[0] ?? null,
            description: v.volumeInfo.description ?? null,
            rating: v.volumeInfo.averageRating ?? null,
            ratings_count: v.volumeInfo.ratingsCount ?? null,
          };

          const { data: inserted } = await supabase
            .from("books")
            .upsert(bookData, { onConflict: "google_books_id" })
            .select()
            .single();

          if (inserted) {
            existingGoogleIds.add(v.id);
            fetchedBooks.push(inserted);
          }
        }
      } catch {
        // Continue
      }
    }
  }

  candidateBooks = [...candidateBooks, ...fetchedBooks].filter(
    (b) =>
      !readBookIds.has(b.id) &&
      b.page_count &&
      !readTitles.some((t) => isSimilarTitle(t, b.title))
  );

  if (candidateBooks.length === 0) return [];

  // Normalization values
  const maxGroupPop = Math.max(1, ...Object.values(groupBookCounts));
  const maxGlobalPop = Math.max(1, ...Object.values(globalBookCounts));
  const maxRatingsCount = Math.max(
    1,
    ...candidateBooks.map((b) => b.ratings_count ?? 0)
  );
  const logMaxRatings = Math.log(maxRatingsCount + 1);

  // 8. Score candidates
  const scored: ScoredBook[] = candidateBooks.map((book) => {
    // Genre match — weighted by how recently user read that genre
    const genreScore = book.genre ? (genreWeights.get(book.genre) ?? 0) : 0;

    // Author match — weighted by recency
    let authorScore = 0;
    if (book.author) {
      const bookAuthors = book.author
        .split(",")
        .map((a: string) => a.trim().toLowerCase());
      for (const a of bookAuthors) {
        const w = authorWeights.get(a) ?? 0;
        authorScore = Math.max(authorScore, w);
      }
    }

    // Related volume bonus — Google says it's related to a recent read
    const isRelated = relatedGoogleIds.has(book.google_books_id) ? 1 : 0;

    // Similar length (0 or 1)
    const similarLength =
      book.page_count &&
      Math.abs(book.page_count - avgPageCount) / avgPageCount <= 0.3
        ? 1
        : 0;

    // Group popularity (0-1)
    const groupPop = (groupBookCounts[book.id] ?? 0) / maxGroupPop;

    // Global popularity (0-1)
    const globalPop = (globalBookCounts[book.id] ?? 0) / maxGlobalPop;

    // Rating (0-1)
    const ratingScore = book.rating != null ? book.rating / 5 : 0;

    // Ratings count (0-1, log-normalized)
    const ratingsCountScore =
      book.ratings_count != null && book.ratings_count > 0
        ? Math.log(book.ratings_count + 1) / logMaxRatings
        : 0;

    const score =
      5 * genreScore +
      3 * isRelated +
      2 * authorScore +
      2 * ratingScore +
      2 * groupPop +
      1 * similarLength +
      1 * ratingsCountScore +
      1 * globalPop;

    return { ...book, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 10);
}

export interface GoogleBookVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
}

export interface GoogleBooksResponse {
  totalItems: number;
  items?: GoogleBookVolume[];
}

export async function searchGoogleBooks(
  query: string
): Promise<GoogleBookVolume[]> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20&langRestrict=en&key=${apiKey}`
  );

  if (!res.ok) {
    throw new Error("Google Books API request failed");
  }

  const data: GoogleBooksResponse = await res.json();
  return data.items ?? [];
}

/**
 * Fetch volumes associated/related to a specific volume.
 * Falls back to a subject-based search using the book's categories
 * if the associated endpoint returns nothing.
 */
export async function getRelatedVolumes(
  volumeId: string,
  categories?: string[]
): Promise<GoogleBookVolume[]> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  // Try the associated volumes endpoint first
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${volumeId}/associated?maxResults=10&langRestrict=en&key=${apiKey}`
    );
    if (res.ok) {
      const data: GoogleBooksResponse = await res.json();
      if (data.items && data.items.length > 0) {
        return data.items;
      }
    }
  } catch {
    // Fall through to category-based search
  }

  // Fallback: search by the book's specific categories
  if (categories && categories.length > 0) {
    // Use the most specific category (often last in the list)
    const category = categories[categories.length - 1];
    return searchGoogleBooks(`subject:"${category}"`);
  }

  return [];
}

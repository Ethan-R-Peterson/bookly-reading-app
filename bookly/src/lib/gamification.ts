import { SupabaseClient } from "@supabase/supabase-js";

const RANKS = [
  { title: "Bookworm", minPoints: 0 },
  { title: "Page Turner", minPoints: 100 },
  { title: "Chapter Chaser", minPoints: 300 },
  { title: "Story Seeker", minPoints: 600 },
  { title: "Novel Knight", minPoints: 1000 },
  { title: "Lore Master", minPoints: 2000 },
  { title: "Tome Titan", minPoints: 3500 },
  { title: "Library Legend", minPoints: 5000 },
];

export function getRankInfo(totalPoints: number) {
  let current = RANKS[0];
  let next = RANKS[1] ?? null;

  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (totalPoints >= RANKS[i].minPoints) {
      current = RANKS[i];
      next = RANKS[i + 1] ?? null;
      break;
    }
  }

  const pointsToNext = next ? next.minPoints - totalPoints : 0;
  const rangeStart = current.minPoints;
  const rangeEnd = next?.minPoints ?? current.minPoints;
  const progress =
    rangeEnd > rangeStart
      ? Math.min(1, (totalPoints - rangeStart) / (rangeEnd - rangeStart))
      : 1;

  return {
    title: current.title,
    nextTitle: next?.title ?? null,
    pointsToNext,
    progress,
  };
}

// Badge checking — call after relevant actions
export async function checkAndAwardBadges(
  supabase: SupabaseClient,
  userId: string
) {
  // Fetch badge definitions and user's existing badges
  const [{ data: allBadges }, { data: userBadges }] = await Promise.all([
    supabase.from("badge_definitions").select("*"),
    supabase.from("user_badges").select("badge_id").eq("user_id", userId),
  ]);

  if (!allBadges) return [];

  const earnedIds = new Set((userBadges ?? []).map((ub) => ub.badge_id));

  // Fetch user stats
  const [
    { data: points },
    { data: finishedBooks },
    { data: reviews },
    { data: user },
    { data: groupCount },
  ] = await Promise.all([
    supabase.from("points").select("amount").eq("user_id", userId),
    supabase
      .from("user_books")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "finished"),
    supabase.from("reviews").select("id").eq("user_id", userId),
    supabase
      .from("users")
      .select("current_streak, longest_streak")
      .eq("id", userId)
      .single(),
    supabase
      .from("group_members")
      .select("id")
      .eq("user_id", userId),
  ]);

  const totalPoints = (points ?? []).reduce((s, p) => s + p.amount, 0);
  const booksRead = finishedBooks?.length ?? 0;
  const reviewCount = reviews?.length ?? 0;
  const streak = Math.max(
    user?.current_streak ?? 0,
    user?.longest_streak ?? 0
  );
  const groups = groupCount?.length ?? 0;

  const categoryValues: Record<string, number> = {
    reading: booksRead,
    streak: streak,
    social: category_social(reviewCount, groups),
    points: totalPoints,
  };

  const newBadges: string[] = [];

  for (const badge of allBadges) {
    if (earnedIds.has(badge.id)) continue;
    if (badge.threshold === null) continue;

    let value: number;
    if (badge.category === "social") {
      // Social badges: check specific conditions
      if (badge.name.toLowerCase().includes("review")) {
        value = reviewCount;
      } else if (badge.name.toLowerCase().includes("group") || badge.name.toLowerCase().includes("social")) {
        value = groups;
      } else {
        value = categoryValues[badge.category] ?? 0;
      }
    } else {
      value = categoryValues[badge.category] ?? 0;
    }

    if (value >= badge.threshold) {
      newBadges.push(badge.id);
    }
  }

  if (newBadges.length === 0) return [];

  // Insert new badges
  const inserts = newBadges.map((badge_id) => ({
    user_id: userId,
    badge_id,
  }));

  await supabase.from("user_badges").insert(inserts);

  // Fetch badge names for feed events
  const awarded = allBadges.filter((b) => newBadges.includes(b.id));
  return awarded;
}

function category_social(reviewCount: number, groups: number): number {
  // Return the higher of the two for generic social threshold
  return Math.max(reviewCount, groups);
}

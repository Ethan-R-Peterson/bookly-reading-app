import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getRankInfo } from "@/lib/gamification";

// GET /api/leaderboard?period=weekly|monthly|all
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "all";

  // Build points query with optional time filter
  let pointsQuery = supabase.from("points").select("user_id, amount");

  if (period === "weekly") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    pointsQuery = pointsQuery.gte("created_at", weekAgo.toISOString());
  } else if (period === "monthly") {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    pointsQuery = pointsQuery.gte("created_at", monthAgo.toISOString());
  }

  const { data: points, error: pointsError } = await pointsQuery;
  if (pointsError)
    return NextResponse.json({ error: pointsError.message }, { status: 500 });

  // Aggregate points per user
  const pointsByUser: Record<string, number> = {};
  for (const p of points ?? []) {
    pointsByUser[p.user_id] = (pointsByUser[p.user_id] ?? 0) + p.amount;
  }

  const userIds = Object.keys(pointsByUser);
  if (userIds.length === 0) return NextResponse.json([]);

  // Get all-time points for rank calculation if period isn't "all"
  let allTimePoints = pointsByUser;
  if (period !== "all") {
    const { data: allPts } = await supabase
      .from("points")
      .select("user_id, amount")
      .in("user_id", userIds);
    const allPtsByUser: Record<string, number> = {};
    for (const p of allPts ?? []) {
      allPtsByUser[p.user_id] = (allPtsByUser[p.user_id] ?? 0) + p.amount;
    }
    allTimePoints = allPtsByUser;
  }

  // Get user profiles
  const { data: users } = await supabase
    .from("users")
    .select("id, username, avatar_url")
    .in("id", userIds);

  const leaderboard = (users ?? [])
    .map((u) => ({
      id: u.id,
      username: u.username,
      avatar_url: u.avatar_url,
      total_points: pointsByUser[u.id] ?? 0,
      rank_title: getRankInfo(allTimePoints[u.id] ?? 0).title,
    }))
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 50);

  return NextResponse.json(leaderboard);
}

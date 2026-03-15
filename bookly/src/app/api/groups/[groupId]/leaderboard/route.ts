import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getRankInfo } from "@/lib/gamification";

// GET /api/groups/[groupId]/leaderboard?period=weekly|monthly|all
export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params;
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "all";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get group members
  const { data: members, error: membersError } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId);

  if (membersError) return NextResponse.json({ error: membersError.message }, { status: 500 });

  const memberIds = members?.map((m) => m.user_id) ?? [];
  if (memberIds.length === 0) return NextResponse.json([]);

  // Get points for all members (with optional time filter)
  let pointsQuery = supabase
    .from("points")
    .select("user_id, amount")
    .in("user_id", memberIds);

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

  if (pointsError) return NextResponse.json({ error: pointsError.message }, { status: 500 });

  // Get user profiles
  const { data: users } = await supabase
    .from("users")
    .select("id, username, avatar_url")
    .in("id", memberIds);

  // Aggregate points per user
  const pointsByUser: Record<string, number> = {};
  for (const p of points ?? []) {
    pointsByUser[p.user_id] = (pointsByUser[p.user_id] ?? 0) + p.amount;
  }

  // Also get all-time points for rank calculation
  let allTimePoints = pointsByUser;
  if (period !== "all") {
    const { data: allPts } = await supabase
      .from("points")
      .select("user_id, amount")
      .in("user_id", memberIds);
    const allPointsByUser: Record<string, number> = {};
    for (const p of allPts ?? []) {
      allPointsByUser[p.user_id] = (allPointsByUser[p.user_id] ?? 0) + p.amount;
    }
    allTimePoints = allPointsByUser;
  }

  const leaderboard = (users ?? [])
    .map((u) => ({
      id: u.id,
      username: u.username,
      avatar_url: u.avatar_url,
      total_points: pointsByUser[u.id] ?? 0,
      rank_title: getRankInfo(allTimePoints[u.id] ?? 0).title,
    }))
    .sort((a, b) => b.total_points - a.total_points);

  return NextResponse.json(leaderboard);
}

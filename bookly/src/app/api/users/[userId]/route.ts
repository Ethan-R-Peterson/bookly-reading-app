import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const supabase = await createServerClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch user profile
  const { data: profile, error: profileErr } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileErr || !profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // If profile is private and not the owner, return limited info
  if (!profile.is_public && userId !== authUser.id) {
    return NextResponse.json({
      profile: {
        id: profile.id,
        username: profile.username,
        avatar_url: profile.avatar_url,
        is_public: false,
      },
      stats: null,
      recentBooks: [],
      badges: [],
    });
  }

  // Fetch stats in parallel
  const [pointsRes, booksRes, reviewsRes, badgesRes] = await Promise.all([
    supabase
      .from("points")
      .select("amount")
      .eq("user_id", userId),
    supabase
      .from("user_books")
      .select("*, book:books(*)")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(6),
    supabase
      .from("reviews")
      .select("id")
      .eq("user_id", userId),
    supabase
      .from("user_badges")
      .select("*, badge:badge_definitions(*)")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false }),
  ]);

  const totalPoints = (pointsRes.data ?? []).reduce(
    (sum, p) => sum + p.amount,
    0
  );
  const booksRead = (booksRes.data ?? []).filter(
    (b) => b.status === "finished"
  ).length;

  return NextResponse.json({
    profile,
    stats: {
      totalPoints,
      booksRead,
      booksInProgress: (booksRes.data ?? []).filter(
        (b) => b.status === "reading"
      ).length,
      reviewCount: reviewsRes.data?.length ?? 0,
      currentStreak: profile.current_streak,
      longestStreak: profile.longest_streak,
    },
    recentBooks: booksRes.data ?? [],
    badges: badgesRes.data ?? [],
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const supabase = await createServerClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser || authUser.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (typeof body.bio === "string") {
    updates.bio = body.bio.slice(0, 200);
  }
  if (typeof body.is_public === "boolean") {
    updates.is_public = body.is_public;
  }
  if (typeof body.username === "string" && body.username.trim()) {
    updates.username = body.username.trim().slice(0, 30);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

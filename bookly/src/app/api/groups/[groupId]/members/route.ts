import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/groups/[groupId]/members — members with their currently reading books
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get group members
  const { data: members, error } = await supabase
    .from("group_members")
    .select("user_id, users(id, username, avatar_url, current_streak)")
    .eq("group_id", groupId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const memberIds = members?.map((m) => m.user_id) ?? [];
  if (memberIds.length === 0) return NextResponse.json([]);

  // Get currently reading books for all members
  const { data: readingBooks } = await supabase
    .from("user_books")
    .select("user_id, current_page, book:books(title, author, cover_url, page_count)")
    .in("user_id", memberIds)
    .eq("status", "reading");

  // Build member data with their reading info
  const booksByUser: Record<string, typeof readingBooks> = {};
  for (const rb of readingBooks ?? []) {
    if (!booksByUser[rb.user_id]) booksByUser[rb.user_id] = [];
    booksByUser[rb.user_id]!.push(rb);
  }

  const result = (members ?? []).map((m) => {
    const user = m.users as unknown as {
      id: string;
      username: string;
      avatar_url: string | null;
      current_streak: number;
    };
    return {
      ...user,
      currentlyReading: booksByUser[m.user_id] ?? [],
    };
  });

  return NextResponse.json(result);
}

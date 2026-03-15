import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/users/search?q=username
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, username, avatar_url, bio, is_public")
    .ilike("username", `%${query}%`)
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

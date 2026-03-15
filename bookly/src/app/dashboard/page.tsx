import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getRankInfo } from "@/lib/gamification";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: userBooks } = await supabase
    .from("user_books")
    .select("*, book:books(*)")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });

  const { data: pointsData } = await supabase
    .from("points")
    .select("amount, reason")
    .eq("user_id", user.id);

  const { data: groups } = await supabase
    .from("group_members")
    .select("group_id, groups(id, name)")
    .eq("user_id", user.id);

  const totalPoints =
    pointsData?.reduce((sum, p) => sum + p.amount, 0) ?? 0;

  const rankInfo = getRankInfo(totalPoints);

  const readingBooks = userBooks?.filter((ub) => ub.status === "reading") ?? [];
  const finishedBooks = userBooks?.filter((ub) => ub.status === "finished") ?? [];

  const totalPagesRead =
    userBooks?.reduce((sum, ub) => sum + ub.current_page, 0) ?? 0;

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {profile?.username ?? "Reader"}
          </h1>
          <p className="text-indigo-100 mt-1">
            <span className="font-medium text-white">{rankInfo.title}</span>
            {rankInfo.nextTitle && (
              <span className="text-indigo-200">
                {" "}{"\u00B7"} {rankInfo.pointsToNext} pts to {rankInfo.nextTitle}
              </span>
            )}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="bg-indigo-50/50 rounded-xl border-l-4 border-l-indigo-500 shadow-sm p-5">
            <p className="text-sm text-gray-500">{"\u{2B50}"} Total Points</p>
            <p className="text-3xl font-bold text-indigo-600">{totalPoints}</p>
          </div>
          <div className="bg-orange-50/50 rounded-xl border-l-4 border-l-orange-500 shadow-sm p-5">
            <p className="text-sm text-gray-500">{"\u{1F525}"} Current Streak</p>
            <p className="text-3xl font-bold text-orange-500">
              {profile?.current_streak ?? 0}
              <span className="text-lg font-normal text-gray-400"> days</span>
            </p>
            {(profile?.longest_streak ?? 0) > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Best: {profile?.longest_streak} days
              </p>
            )}
          </div>
          <div className="bg-emerald-50/50 rounded-xl border-l-4 border-l-emerald-500 shadow-sm p-5">
            <p className="text-sm text-gray-500">{"\u{1F4D6}"} Pages Read</p>
            <p className="text-3xl font-bold text-emerald-600">
              {totalPagesRead}
            </p>
          </div>
          <div className="bg-purple-50/50 rounded-xl border-l-4 border-l-purple-500 shadow-sm p-5">
            <p className="text-sm text-gray-500">{"\u{1F3C6}"} Books Finished</p>
            <p className="text-3xl font-bold text-purple-600">
              {finishedBooks.length}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            href="/log"
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all duration-200"
          >
            Log Pages
          </Link>
          <Link
            href="/books"
            className="px-4 py-2 text-sm border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
          >
            Find Books
          </Link>
          <Link
            href="/recommendations"
            className="px-4 py-2 text-sm border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
          >
            Recommendations
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Currently Reading */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
                Currently Reading ({readingBooks.length})
              </h2>
              <Link
                href="/my-books"
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                View all
              </Link>
            </div>
            {readingBooks.length > 0 ? (
              <div className="space-y-3">
                {readingBooks.slice(0, 4).map((ub) => (
                  <div
                    key={ub.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 flex gap-4"
                  >
                    {ub.book?.cover_url ? (
                      <img
                        src={ub.book.cover_url}
                        alt={ub.book.title}
                        className="w-14 h-20 object-cover rounded-lg shadow-md shrink-0 hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-14 h-20 bg-gray-100 rounded-lg shadow-md flex items-center justify-center text-gray-400 text-xs shrink-0">
                        No cover
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate">
                        {ub.book?.title}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {ub.book?.author}
                      </p>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>
                            Page {ub.current_page}/
                            {ub.book?.page_count ?? "?"}
                          </span>
                          <span>
                            {ub.book?.page_count
                              ? Math.round(
                                  (ub.current_page / ub.book.page_count) * 100
                                )
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${ub.book?.page_count ? Math.min(100, (ub.current_page / ub.book.page_count) * 100) : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50/50 rounded-xl border border-dashed border-gray-200 p-10 text-center">
                <p className="text-4xl mb-3">{"\u{1F4DA}"}</p>
                <p className="text-gray-500">
                  No books yet.{" "}
                  <Link
                    href="/books"
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    Search for a book to start reading!
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* My Groups sidebar */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">My Groups</h2>
              <Link
                href="/groups"
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                View all
              </Link>
            </div>
            {groups && groups.length > 0 ? (
              <div className="space-y-2">
                {groups.map((gm) => {
                  const g = gm.groups as unknown as {
                    id: string;
                    name: string;
                  };
                  return (
                    <Link
                      key={gm.group_id}
                      href={`/groups/${g.id}`}
                      className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md hover:scale-[1.02] transition-all duration-200"
                    >
                      <p className="font-medium text-sm text-gray-900">
                        {g.name}
                      </p>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-50/50 rounded-xl border border-dashed border-gray-200 p-8 text-center">
                <p className="text-3xl mb-2">{"\u{1F465}"}</p>
                <p className="text-sm text-gray-500">
                  No groups yet.{" "}
                  <Link
                    href="/groups"
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    Create or join one!
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

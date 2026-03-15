"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import FeedItem from "@/components/FeedItem";
import LeaderboardRow from "@/components/LeaderboardRow";
import Spinner from "@/components/Spinner";
import { useFeed } from "@/hooks/useFeed";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useQuery } from "@tanstack/react-query";
import type { Group } from "@/types";

interface MemberWithReading {
  id: string;
  username: string;
  avatar_url: string | null;
  current_streak: number;
  currentlyReading: {
    current_page: number;
    book: {
      title: string;
      author: string | null;
      cover_url: string | null;
      page_count: number | null;
    };
  }[];
}

export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();

  const { data: groups } = useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: async () => {
      const res = await fetch("/api/groups");
      if (!res.ok) throw new Error("Failed to fetch groups");
      return res.json();
    },
  });

  const group = groups?.find((g) => g.id === groupId);
  const {
    data: feedPages,
    isLoading: feedLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useFeed(groupId);
  const { data: leaderboard, isLoading: lbLoading } = useLeaderboard(groupId);

  const { data: members } = useQuery<MemberWithReading[]>({
    queryKey: ["groupMembers", groupId],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}/members`);
      if (!res.ok) throw new Error("Failed to fetch members");
      return res.json();
    },
  });

  const feedEvents = feedPages?.pages.flat() ?? [];
  const activeReaders =
    members?.filter((m) => m.currentlyReading.length > 0) ?? [];

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {group?.name ?? "Group"}
          </h1>
          {group?.description && (
            <p className="text-gray-500 mt-1">{group.description}</p>
          )}
          {group?.invite_code && (
            <p className="text-sm text-gray-400 mt-1">
              Invite code:{" "}
              <span className="font-mono font-medium text-indigo-600">
                {group.invite_code}
              </span>
            </p>
          )}
        </div>

        {/* Active Readers — scrollable row */}
        {activeReaders.length > 0 && (
          <div className="mb-8">
            <h2 className="font-semibold text-gray-900 tracking-tight mb-3">
              Currently Reading
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {activeReaders.map((member) => (
                <Link
                  key={member.id}
                  href={`/profile/${member.id}`}
                  className="flex-shrink-0 w-48 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                      {member.username[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.username}
                      </p>
                      {member.current_streak > 0 && (
                        <p className="text-xs text-orange-500">
                          {"\u{1F525}"} {member.current_streak}d streak
                        </p>
                      )}
                    </div>
                  </div>
                  {member.currentlyReading.slice(0, 1).map((rb, i) => (
                    <div key={i} className="flex gap-2">
                      {rb.book.cover_url ? (
                        <img
                          src={rb.book.cover_url}
                          alt={rb.book.title}
                          className="w-10 h-14 object-cover rounded shadow-sm shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-14 bg-gray-100 rounded shadow-sm shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-700 line-clamp-2">
                          {rb.book.title}
                        </p>
                        {rb.book.page_count && (
                          <div className="mt-1">
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full"
                                style={{
                                  width: `${Math.min(100, (rb.current_page / rb.book.page_count) * 100)}%`,
                                }}
                              />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {Math.round(
                                (rb.current_page / rb.book.page_count) * 100
                              )}
                              %
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900 tracking-tight">
                  Leaderboard
                </h2>
                <Link
                  href={`/groups/${groupId}/leaderboard`}
                  className="text-xs text-indigo-600 hover:text-indigo-700"
                >
                  View full
                </Link>
              </div>
              {lbLoading ? (
                <Spinner className="py-4" />
              ) : leaderboard && leaderboard.length > 0 ? (
                leaderboard
                  .slice(0, 5)
                  .map((entry, i) => (
                    <LeaderboardRow
                      key={entry.id}
                      entry={entry}
                      rank={i + 1}
                    />
                  ))
              ) : (
                <p className="text-sm text-gray-400">
                  No points yet. Start reading!
                </p>
              )}
            </div>

            {/* All Members */}
            {members && members.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-5 mt-4">
                <h2 className="font-semibold text-gray-900 tracking-tight mb-3">
                  Members ({members.length})
                </h2>
                <div className="space-y-2">
                  {members.map((m) => (
                    <Link
                      key={m.id}
                      href={`/profile/${m.id}`}
                      className="flex items-center gap-2 py-1.5 hover:bg-gray-50 rounded-lg px-1 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600 shrink-0">
                        {m.username[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-700">
                        {m.username}
                      </span>
                      {m.current_streak > 0 && (
                        <span className="text-xs text-orange-400 ml-auto">
                          {m.current_streak}d
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 tracking-tight mb-3">
                Activity Feed
              </h2>
              {feedLoading ? (
                <Spinner className="py-4" />
              ) : feedEvents.length > 0 ? (
                <>
                  {feedEvents.map((event) => (
                    <FeedItem key={event.id} event={event} />
                  ))}
                  {hasNextPage && (
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="mt-4 w-full py-2 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 disabled:opacity-50"
                    >
                      {isFetchingNextPage ? "Loading..." : "Load more"}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400">
                  No activity yet. Be the first to log some pages!
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

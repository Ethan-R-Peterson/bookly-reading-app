"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import LeaderboardRow from "@/components/LeaderboardRow";
import Spinner from "@/components/Spinner";
import { useGlobalLeaderboard } from "@/hooks/useGlobalLeaderboard";

const PERIODS = [
  { value: "weekly", label: "This Week" },
  { value: "monthly", label: "This Month" },
  { value: "all", label: "All Time" },
];

export default function GlobalLeaderboardPage() {
  const [period, setPeriod] = useState("all");
  const { data: leaderboard, isLoading } = useGlobalLeaderboard(period);

  const topThree = leaderboard?.slice(0, 3) ?? [];
  const rest = leaderboard?.slice(3) ?? [];

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">
          Global Leaderboard
        </h1>

        {/* Period toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                period === p.value
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <Spinner className="py-12" />
        ) : leaderboard && leaderboard.length > 0 ? (
          <>
            {/* Podium for top 3 */}
            {topThree.length > 0 && (
              <div className="flex items-end justify-center gap-3 mb-8 px-4">
                {/* 2nd place */}
                {topThree[1] && (
                  <div className="flex-1 text-center">
                    <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center text-lg font-bold text-gray-500 mb-2">
                      {topThree[1].username[0]?.toUpperCase()}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {topThree[1].username}
                    </p>
                    <p className="text-xs text-gray-400">
                      {topThree[1].total_points} pts
                    </p>
                    <div className="mt-2 bg-gray-200 rounded-t-lg h-16 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-400">2</span>
                    </div>
                  </div>
                )}
                {/* 1st place */}
                {topThree[0] && (
                  <div className="flex-1 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-xl font-bold text-amber-600 mb-2">
                      {topThree[0].username[0]?.toUpperCase()}
                    </div>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {topThree[0].username}
                    </p>
                    <p className="text-xs text-indigo-600 font-medium">
                      {topThree[0].total_points} pts
                    </p>
                    <div className="mt-2 bg-gradient-to-t from-amber-300 to-amber-200 rounded-t-lg h-24 flex items-center justify-center">
                      <span className="text-2xl font-bold text-amber-600">
                        1
                      </span>
                    </div>
                  </div>
                )}
                {/* 3rd place */}
                {topThree[2] && (
                  <div className="flex-1 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-orange-50 border-2 border-amber-600 flex items-center justify-center text-base font-bold text-amber-700 mb-2">
                      {topThree[2].username[0]?.toUpperCase()}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {topThree[2].username}
                    </p>
                    <p className="text-xs text-gray-400">
                      {topThree[2].total_points} pts
                    </p>
                    <div className="mt-2 bg-amber-100 rounded-t-lg h-12 flex items-center justify-center">
                      <span className="text-lg font-bold text-amber-600">3</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rest of leaderboard */}
            {rest.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-5">
                {rest.map((entry, i) => (
                  <LeaderboardRow
                    key={entry.id}
                    entry={entry}
                    rank={i + 4}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-gray-50/50 rounded-xl border border-dashed border-gray-200 p-10 text-center">
            <p className="text-4xl mb-3">{"\u{1F3C6}"}</p>
            <p className="text-gray-500">No points earned yet. Start reading!</p>
          </div>
        )}
      </main>
    </>
  );
}

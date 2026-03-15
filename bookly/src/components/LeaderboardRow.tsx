"use client";

import Link from "next/link";
import type { LeaderboardEntry } from "@/types";

export default function LeaderboardRow({
  entry,
  rank,
}: {
  entry: LeaderboardEntry;
  rank: number;
}) {
  const medalColors: Record<number, string> = {
    1: "text-yellow-500",
    2: "text-gray-400",
    3: "text-amber-600",
  };

  return (
    <div className="flex items-center gap-3 py-3 px-2 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors rounded-lg">
      <span
        className={`w-6 text-center font-bold text-sm ${medalColors[rank] ?? "text-gray-400"}`}
      >
        {rank}
      </span>
      <Link
        href={`/profile/${entry.id}`}
        className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-medium text-indigo-600 shrink-0 hover:bg-indigo-200 transition-colors"
      >
        {entry.username[0]?.toUpperCase() ?? "?"}
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          href={`/profile/${entry.id}`}
          className="font-medium text-sm text-gray-900 hover:text-indigo-600 transition-colors"
        >
          {entry.username}
        </Link>
        {entry.rank_title && (
          <p className="text-xs text-gray-400">{entry.rank_title}</p>
        )}
      </div>
      <span className="text-sm font-semibold text-indigo-600">
        {entry.total_points} pts
      </span>
    </div>
  );
}

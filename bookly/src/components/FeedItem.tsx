"use client";

import Link from "next/link";
import type { FeedEvent } from "@/types";

function formatEvent(event: FeedEvent): string {
  const meta = event.metadata as Record<string, unknown>;
  switch (event.event_type) {
    case "started_book":
      return `started reading "${meta.bookTitle}"`;
    case "logged_pages":
      return `logged ${meta.pages} pages in "${meta.bookTitle}" (+${meta.points} pts)`;
    case "finished_book":
      return `finished "${meta.bookTitle}" (+50 pts)`;
    case "streak":
      return `hit a ${meta.streakDays}-day streak! (+${meta.points} pts)`;
    case "reviewed_book": {
      const stars = "\u2605".repeat(meta.rating as number) +
        "\u2606".repeat(5 - (meta.rating as number));
      return `rated "${meta.bookTitle}" ${stars}`;
    }
    case "earned_badge":
      return `earned the "${meta.badgeName}" badge!`;
    default:
      return "did something";
  }
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const eventColors: Record<string, string> = {
  started_book: "border-l-blue-400",
  logged_pages: "border-l-indigo-400",
  finished_book: "border-l-emerald-400",
  streak: "border-l-orange-400",
  reviewed_book: "border-l-amber-400",
  earned_badge: "border-l-purple-400",
};

export default function FeedItem({ event }: { event: FeedEvent }) {
  const accentColor = eventColors[event.event_type] ?? "border-l-gray-300";

  return (
    <div className={`flex items-start gap-3 py-4 px-3 border-b border-gray-100 last:border-0 border-l-2 ${accentColor} hover:bg-gray-50/50 transition-colors`}>
      <Link
        href={`/profile/${event.user_id}`}
        className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-medium text-indigo-600 shrink-0 hover:bg-indigo-200 transition-colors"
      >
        {event.user?.username?.[0]?.toUpperCase() ?? "?"}
      </Link>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          <Link
            href={`/profile/${event.user_id}`}
            className="font-medium hover:text-indigo-600 transition-colors"
          >
            {event.user?.username ?? "User"}
          </Link>{" "}
          {formatEvent(event)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {timeAgo(event.created_at)}
        </p>
      </div>
    </div>
  );
}

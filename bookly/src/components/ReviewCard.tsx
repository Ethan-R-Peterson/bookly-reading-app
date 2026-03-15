"use client";

import { useState } from "react";
import Link from "next/link";
import type { Review } from "@/types";

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

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewCard({ review }: { review: Review }) {
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);

  return (
    <div className="py-4 px-1 border-b border-gray-100 last:border-0 hover:bg-gray-50/30 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        {review.user && (
          <Link
            href={`/profile/${review.user.id}`}
            className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">
              {review.user.username?.[0]?.toUpperCase() ?? "?"}
            </div>
            <span className="text-sm font-medium text-gray-900">
              {review.user.username}
            </span>
          </Link>
        )}
        {review.book && (
          <span className="text-sm text-gray-500 truncate">
            on{" "}
            <span className="font-medium text-gray-700">
              {review.book.title}
            </span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-1">
        <Stars rating={review.rating} />
        <span className="text-xs text-gray-400">
          {timeAgo(review.created_at)}
        </span>
      </div>

      {review.review_text && (
        <div className="mt-1">
          {review.has_spoilers && !spoilerRevealed ? (
            <button
              onClick={() => setSpoilerRevealed(true)}
              className="text-sm text-gray-400 italic hover:text-gray-600 transition-colors"
            >
              This review contains spoilers. Tap to reveal.
            </button>
          ) : (
            <p className="text-sm text-gray-700">{review.review_text}</p>
          )}
        </div>
      )}
    </div>
  );
}

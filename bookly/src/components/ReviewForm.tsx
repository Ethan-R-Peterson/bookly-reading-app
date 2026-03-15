"use client";

import { useState } from "react";
import StarRatingInput from "./StarRatingInput";
import { useSubmitReview } from "@/hooks/useReviews";

export default function ReviewForm({
  bookId,
  bookTitle,
  onClose,
  onSuccess,
}: {
  bookId: string;
  bookTitle: string;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [hasSpoilers, setHasSpoilers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitReview = useSubmitReview();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    setError(null);
    try {
      await submitReview.mutateAsync({
        bookId,
        rating,
        reviewText: text || undefined,
        hasSpoilers,
      });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Rate &amp; Review
        </h2>
        <p className="text-sm text-gray-500 mb-4 truncate">{bookTitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating
            </label>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quick Take
              <span className="text-gray-400 font-normal"> (optional)</span>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="What did you think?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-sm"
            />
            <p className="text-xs text-gray-400 text-right">
              {text.length}/500
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={hasSpoilers}
              onChange={(e) => setHasSpoilers(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Contains spoilers
          </label>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={submitReview.isPending || rating === 0}
              className="flex-1 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {submitReview.isPending ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

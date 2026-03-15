"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Review } from "@/types";

export function useBookReviews(bookId: string) {
  return useQuery<Review[]>({
    queryKey: ["reviews", "book", bookId],
    queryFn: async () => {
      const res = await fetch(`/api/reviews?bookId=${bookId}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    enabled: !!bookId,
  });
}

export function useUserReviews(userId: string) {
  return useQuery<Review[]>({
    queryKey: ["reviews", "user", userId],
    queryFn: async () => {
      const res = await fetch(`/api/reviews?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    enabled: !!userId,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      bookId: string;
      rating: number;
      reviewText?: string;
      hasSpoilers?: boolean;
    }) => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit review");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["userBooks"] });
    },
  });
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User, UserBook, UserBadge } from "@/types";

interface ProfileData {
  profile: User;
  stats: {
    totalPoints: number;
    booksRead: number;
    booksInProgress: number;
    reviewCount: number;
    currentStreak: number;
    longestStreak: number;
  } | null;
  recentBooks: UserBook[];
  badges: UserBadge[];
}

export function useProfile(userId: string) {
  return useQuery<ProfileData>({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      ...data
    }: {
      userId: string;
      bio?: string;
      is_public?: boolean;
      username?: string;
    }) => {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update profile");
      }
      return res.json();
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["profile", vars.userId] });
    },
  });
}

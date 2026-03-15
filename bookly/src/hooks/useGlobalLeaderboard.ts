"use client";

import { useQuery } from "@tanstack/react-query";
import type { LeaderboardEntry } from "@/types";

export function useGlobalLeaderboard(period: string = "all") {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["globalLeaderboard", period],
    queryFn: async () => {
      const res = await fetch(`/api/leaderboard?period=${period}`);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
  });
}

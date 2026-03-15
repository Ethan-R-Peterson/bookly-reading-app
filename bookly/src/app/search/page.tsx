"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Spinner from "@/components/Spinner";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@/types";

export default function SearchUsersPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  function handleChange(value: string) {
    setQuery(value);
    if (timer) clearTimeout(timer);
    const t = setTimeout(() => setDebouncedQuery(value), 300);
    setTimer(t);
  }

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["userSearch", debouncedQuery],
    queryFn: async () => {
      const res = await fetch(
        `/api/users/search?q=${encodeURIComponent(debouncedQuery)}`
      );
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: debouncedQuery.length >= 1,
  });

  return (
    <>
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">
          Find Readers
        </h1>

        <div className="relative mb-6">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search by username..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
          />
        </div>

        {isLoading && debouncedQuery && <Spinner className="py-8" />}

        {users && users.length > 0 && (
          <div className="space-y-2">
            {users.map((u) => (
              <Link
                key={u.id}
                href={`/profile/${u.id}`}
                className="flex items-center gap-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">
                  {u.username?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">
                    {u.username}
                  </p>
                  {u.bio && (
                    <p className="text-xs text-gray-400 truncate">{u.bio}</p>
                  )}
                </div>
                {!u.is_public && (
                  <span className="text-xs text-gray-400">
                    {"\u{1F512}"}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}

        {users && users.length === 0 && debouncedQuery && (
          <div className="bg-gray-50/50 rounded-xl border border-dashed border-gray-200 p-10 text-center">
            <p className="text-4xl mb-3">{"\u{1F50D}"}</p>
            <p className="text-gray-500">
              No readers found matching &ldquo;{debouncedQuery}&rdquo;
            </p>
          </div>
        )}

        {!debouncedQuery && (
          <div className="bg-gray-50/50 rounded-xl border border-dashed border-gray-200 p-10 text-center">
            <p className="text-4xl mb-3">{"\u{1F4E2}"}</p>
            <p className="text-gray-500">
              Search for other readers by username
            </p>
          </div>
        )}
      </main>
    </>
  );
}

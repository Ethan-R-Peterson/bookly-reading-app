"use client";

import Link from "next/link";
import type { Group } from "@/types";

export default function GroupCard({ group }: { group: Group }) {
  return (
    <Link
      href={`/groups/${group.id}`}
      className="block bg-white rounded-xl shadow-sm p-5 hover:shadow-md hover:scale-[1.02] transition-all duration-200"
    >
      <h3 className="font-semibold text-gray-900">{group.name}</h3>
      {group.description && (
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {group.description}
        </p>
      )}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium shadow-sm">
          Code: {group.invite_code}
        </span>
      </div>
    </Link>
  );
}

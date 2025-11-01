// src/components/RepoList.tsx
"use client";

import RepoCard from "./RepoCard";
import { Repo } from "@/lib/types";

export default function RepoList({ repos }: { repos: Repo[] }) {
  return (
    <div
      className="
        grid gap-6
        sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
        [--cell-h:15rem] lg:[--cell-h:11rem]
        auto-rows-[var(--cell-h)]
        overflow-visible          /* <-- important */
        isolate                   /* create new stacking context */
      "
    >
      {repos.map((r) => (
        <div
          key={r.id}
          className="
            group relative w-full h-[var(--cell-h)]
            overflow-visible       
          "
        >
          <RepoCard repo={r} />
        </div>
      ))}
    </div>
  );
}

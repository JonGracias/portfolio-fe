// src/components/RepoList.tsx
"use client";

import RepoCard from "./RepoCard";
import { Repo } from "@/lib/types";

export default function RepoList({ repos }: { repos: Repo[] }) {
  return (
    <section className="w-full mx-auto sm:max-w-[27.6rem] lg:max-w-[41.1rem] xl:max-w-[54.75rem] px-4">
      <div
        className="
          grid gap-6
          grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
          auto-rows-[12rem]
          overflow-visible isolate
          justify-center
        "
      >
        {repos.map((r) => (
          <div
            key={r.id}
            className="group relative
                       w-full sm:w-[12rem] h-[12rem]
                       overflow-visible"
          >
            <RepoCard repo={r} />
          </div>
        ))}
      </div>
    </section>
  );
}

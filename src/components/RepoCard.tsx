// src/components/RepoCard.tsx
"use client";
import { Repo } from "@/lib/types";

export default function RepoCard({ repo }: { repo: Repo }) {
  const updated = new Date(repo.updated_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noreferrer"
      className={[
        "block h-full w-full rounded-xl border shadow-sm",
        "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700",

        // Mobile: no scaling (keep it simple)
        "[--s:1]",
        "transform-gpu origin-center transition-transform duration-200 ease-out",
        "scale-[var(--s)] sm:group-hover:scale-125 sm:group-focus-within:scale-1",

        // Allow it to paint above neighbors while expanded
        "relative z-0 sm:group-hover:z-20 sm:group-focus-within:z-20",

        // Optional: subtle lift effect
        "hover:shadow-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500",

        
      ].join(" ")}
    >
      {/* Keep rows fixed so they never layer on each other */}
      <div className="grid h-full grid-rows-[auto,auto,auto,auto] gap-2 p-5">
        {/* Row 1: Title (stays on its own line) */}
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400 truncate z-10">
          {repo.name}
        </h3>

        {/* Row 2: Description (animate its own height, not the grid) */}
        <div className="overflow-hidden">
          <div
            className="
              text-sm text-gray-600 dark:text-gray-300 leading-5 break-words
              max-h-0 opacity-0
              transition-[max-height,opacity] duration-200 ease-out

              /* expand on hover/focus; adjust max-h to allow more/less lines */
              group-hover:max-h-40 group-hover:opacity-100
              group-focus-within:max-h-40 group-focus-within:opacity-100
            "
          >
            {repo.description && <p className="line-clamp-none">{repo.description}</p>}
          </div>
        </div>

        {/* Row 3: Language */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="truncate">{repo.language ?? "n/a"}</span>
          
        </div>

        {/* Row 4: Updated */}
        <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Updated {updated}
        </div>
      </div>
    </a>
  );
}

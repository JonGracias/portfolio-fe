// src/components/RepoCard.tsx
"use client";
import { useState, useEffect } from "react";
import { Repo } from "@/lib/types";

export default function RepoCard({ repo }: { repo: Repo }) {
  const [count, setCount] = useState<number>(repo.stargazers_count);
  const [starring, setStarring] = useState(false);
  const [starred, setStarred] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const updated = new Date(repo.updated_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  useEffect(() => {
    async function checkStarred() {
      console.log("Checking if starred for", repo.owner, repo.name);
      const res = await fetch(`/api/github/starred?owner=${repo.owner}&repo=${repo.name}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.authed && data.starred) setStarred(true);
    }
    checkStarred();
  }, [repo.owner, repo.name]);

  async function handleStar() {
    setStarring(true);
    try {
      const res = await fetch("/api/github/star", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: repo.owner, repo: repo.name }),
      });
      const data = await res.json();

      if (res.status === 401) {
        window.location.href = "/api/github/login";
        return;
      }

      if (data.ok) {
        setStarred(true);
        if (typeof data.count === "number") setCount(data.count);
      }
    } finally {
      setStarring(false);
    }
  }

  async function handleUnStar() {
    // show the confirmation popup
    setShowConfirm(true);
  }

  function confirmUnstar(choice: "yes" | "no") {
    if (choice === "yes") {
      setMessage("😆 Not allowed!");
    }
    setShowConfirm(false);

    // clear the message after 3 seconds
    if (choice === "yes") {
      setTimeout(() => setMessage(null), 3000);
    }
  }


  return (
    <div
      className={[
        "group block w-full rounded-xl border shadow-sm",
        "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700",

        // BLUE BORDER: works on hover (desktop) + focus/press (mobile)
        "hover:border-blue-400 focus-within:border-blue-400 active:border-blue-400",

        // ANIMATION + SCALE
        "transform-gpu origin-center transition-transform duration-200 ease-out",

        // Mobile: scale a little on press/focus
        "group-active:scale-105 focus-within:scale-105",

        // Desktop+: bigger hover growth
        "md:group-hover:scale-125 md:group-focus-within:scale-110",

        // stacking + polish
        "relative z-0 md:group-hover:z-20 md:group-focus-within:z-20",
        "hover:shadow-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500",
        "min-h-[12rem]",
      ].join(" ")}
    >
      {!showConfirm && !message && (
        <a
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
          className="h-full block"
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
                  max-h-[1rem] opacity-70
                  transition-[max-height,opacity] duration-200 ease-out

                  /* expand on hover/focus; adjust max-h to allow more/less lines */
                  group-hover:max-h-40 group-hover:opacity-100
                  group-focus-within:max-h-40 group-focus-within:opacity-100
                "
              >
                {repo.description ?? "No description"}
              </div>
            </div>
            <div>
              <div>{count} ⭐ Stars</div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{repo.language ?? "Unknown"}</span>

              {/* Star button */}
              {!starred && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleStar();
                  }}
                  disabled={starring || starred}
                  className="text-yellow-600 hover:text-yellow-700 font-semibold transition-colors"
                >
                  {starring ? "Starring..." : "☆ Star"}
                </button>
              )}

              {/* Unstar button */}
              {starred &&(
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUnStar();
                  }}
                  disabled={starring}
                  className="ml-3 text-yellow-600 hover:text-yellow-700 font-semibold transition-colors"
                >
                  ⭐
                </button>
              )}

            </div>

            {/* Row 4: Updated */}
            <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Updated {updated}
            </div>
          </div>
        </a>
      )}

      {/* Pop-up confirm */}
      {showConfirm && !message &&(
        <div>
            <div className="grid h-full min-h-[12rem] place-items-center p-5 text-center">
              <p>Would you like to unstar this?</p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); confirmUnstar("yes")}}
                  className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                >
                  Yes
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); confirmUnstar("no")}}
                  className="px-2 py-1 rounded bg-gray-500 hover:bg-gray-600"
                >
                  No
                </button>
              </div>
            </div>
        </div>
      )}

      {/* Funny message */}
      {message && (
        <div className="grid h-full min-h-[12rem] place-items-center p-5">
            <div className="mt-3 text-red-600 font-medium transition-opacity duration-300 ease-out">
              {message}
            </div>
        </div>
      )}
    </div>
  );
}

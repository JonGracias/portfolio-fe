// src/components/RepoCard.tsx
"use client";
import { useState, useEffect, useRef, JSX } from "react";
import { useRepoContext } from "@/context/RepoContext";
import { Repo } from "@/lib/types";
import  LanguageDisplay  from "./LanguageDisplay"
import  StarButton  from "./StarButton"
import  PlayButton  from "./PlayButton"

export default function RepoList({ repo }: { repo: Repo }) {
  const updated = new Date(repo.updated_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const cardRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const scrollInterval = useRef<NodeJS.Timeout | null>(null);

  function startAutoScroll() {
    if (!descRef.current) return;

    stopAutoScroll(); // prevent double intervals

    scrollInterval.current = setInterval(() => {
      const el = descRef.current;
      if (!el) return;

      // Stop if we've hit the bottom
      if (el.scrollTop + el.clientHeight >= el.scrollHeight) return;

      el.scrollTop += 1; // scroll speed (px per tick)
    }, 80); // scroll speed interval
  }

  function stopAutoScroll() {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
  }


  return (
    <section
      ref={cardRef}
      onMouseEnter={startAutoScroll}
      onMouseLeave={() => {
        stopAutoScroll();
        if (descRef.current) descRef.current.scrollTop = 0; // reset if desired
      }}
      className={[
        "group block w-full rounded-xl border shadow-sm",
        "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700",
        "hover:border-blue-400 hover:shadow-xl",
        "transition-transform duration-200 ease-out",
        "min-h-[12rem] p-4",
      ].join(" ")}
    >
      {/* CLICKABLE INFORMATION BOX */}
      <a
        href={repo.html_url}
        target="_blank"
        rel="noreferrer"
        className="
          group/info
          block w-full rounded-lg 
          border border-gray-200 dark:border-neutral-700 
          p-3 relative 
          hover:border-blue-400 dark:hover:border-orange-400 /hover:bg-blue-50/40">
        <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-400 truncate">
          {repo.name}
        </h3>

        <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mt-1">
          Updated {updated}
        </div>

        <p
          ref={descRef}
          className="
            relative
            text-sm text-gray-600 dark:text-gray-300 leading-5 break-words
            max-h-[2.5rem] min-h-[2.5rem]
            overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            opacity-70 mt-2
            transition-all duration-200 ease-out
            group-hover:opacity-100
            before:absolute before:bottom-0 before:left-0 before:w-full before:h-4
            before:bg-gradient-to-t before:from-gray-100 dark:before:from-neutral-900 before:to-transparent
          "
        >
          {repo.description ?? "No description"}
        </p>



        {/* "More..." cue */}
        <span className="
        absolute bottom-0 right-2 text-[10px]
        text-blue-300
        opacity-0
        transition-opacity duration-300 ease-out
        group-hover/info:opacity-70
        pointer-events-none">
          (more…)
        </span>
      </a>

      {/* BUTTON ROW (NOT CLICKABLE LINK AREA) */}
      <div className="flex items-center justify-between mt-3 px-1">
        <PlayButton repo={repo} />
        <StarButton repo={repo} />
      </div>

      {/* LANGUAGES DISPLAY */}
      <div className="flex items-center justify-center mt-2">
        <LanguageDisplay repo={repo} />
      </div>
    </section>
  );
}


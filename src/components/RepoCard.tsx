"use client";

import { useEffect, useRef, memo } from "react";
import { Repo } from "@/lib/types";
import LanguageDisplay from "./LanguageDisplay";
import StarButton from "./StarButton";
import PlayButton from "./GitHubButton";

export default memo(function RepoCard({ repo }: { repo: Repo }) {
  const updated = new Date(repo.updated_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);

  const buttonClass = [
    "h-[4rem] w-[4rem]",
    "flex items-center justify-center",
    "rounded-lg m-1",
    "border border-white dark:border-neutral-900",
    "hover:border-blue-400 dark:hover:border-orange-400",
  ].join(" ");

  //
  // ────────────────────────────────────────────────────────────────
  // Popup wheel scroll forwarding (NO document.getElementById)
  // ────────────────────────────────────────────────────────────────
  //
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const forwardWheel = (e: WheelEvent) => {
      e.preventDefault();
      const container = document.querySelector(".scroll-container");
      if (container) {
        container.scrollBy({ top: e.deltaY, behavior: "smooth" });
      }
    };

    // Only enable when card is inside popup container
    if (card.closest("#popup-card")) {
      card.addEventListener("wheel", forwardWheel, { passive: false });
      return () => card.removeEventListener("wheel", forwardWheel);
    }
  }, []);

  //
  // ────────────────────────────────────────────────────────────────
  // Auto-scroll description
  // ────────────────────────────────────────────────────────────────
  //
  function startAutoScroll() {
    const el = descRef.current;
    if (!el) return;

    stopAutoScroll();
    autoScrollInterval.current = setInterval(() => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight) return;
      el.scrollTop += 1;
    }, 80);
  }

  function stopAutoScroll() {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
  }

  //
  // ────────────────────────────────────────────────────────────────
  // Component
  // ────────────────────────────────────────────────────────────────
  //
  return (
    <section
      ref={cardRef}
      onMouseEnter={startAutoScroll}
      onMouseLeave={() => {
        stopAutoScroll();
        if (descRef.current) descRef.current.scrollTop = 0;
      }}
      className={[
        "group block rounded-xl border shadow-sm",
        "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700",
        "hover:border-blue-400 hover:shadow-xl",
        "transition-transform duration-200 ease-out",
        "h-[14rem] w-[14rem] p-4",
      ].join(" ")}
    >
      {/* CLICKABLE INFO PANEL */}
      <a
        href={repo.html_url}
        target="_blank"
        rel="noreferrer"
        className="
          group/info block w-full rounded-lg 
          border border-white dark:border-neutral-900
          p-3 relative 
          hover:border-blue-400 dark:hover:border-orange-400
        "
      >
        <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-400 truncate">
          {repo.name}
        </h3>

        <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mt-1">
          Updated {updated}
        </div>

        <p
          ref={descRef}
          className="
            text-sm text-gray-600 dark:text-gray-300 leading-5
            h-[2.5rem] overflow-y-auto overflow-x-hidden
            [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            opacity-70 mt-2
            transition-opacity duration-200 ease-out
            group-hover:opacity-100
          "
        >
          {repo.description ?? "No description"}
        </p>

        <span
          className="
            absolute bottom-0 right-2 text-[10px]
            text-blue-300 opacity-0
            transition-opacity duration-300 ease-out
            group-hover/info:opacity-70
            pointer-events-none
          "
        >
          (more…)
        </span>
      </a>

      {/* BUTTON ROW */}
      <div className="grid grid-cols-3 items-center justify-between h-[4rem]  gap-2">
        <section className={buttonClass}>
          <PlayButton repo={repo} />
        </section>

        <section className={buttonClass}>
          <LanguageDisplay repo={repo} />
        </section>

        <section className={buttonClass}>
          <StarButton repo={repo} />
        </section>
      </div>
    </section>
  );
});

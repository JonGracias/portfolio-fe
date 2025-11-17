"use client";
import { useRef, useEffect, useState, useMemo } from "react";
import { useRepoContext } from "@/context/RepoContext";
import RepoCard from "./RepoCard";
import { Repo } from "@/lib/types";

export default function RepoList() {
  const [hoverPos, setHoverPos] = useState<{ top: number; left: number; height: number; width: number }>({ top: 0, left: 0, height: 0, width: 0 });
  const [scrolling, setScrolling] = useState(false);
  const hoveredRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scale = 1.2;

  const {
    hoveredRepo,
    setHoveredRepo,
    repos,
    filters,
    setFilters,
    languages,
    visibleRepos,
  } = useRepoContext();

  // Hover
  function handleMouseEnter(el: HTMLDivElement, repo: Repo) {
    hoveredRef.current = el;
    setHoveredRepo(repo);

    const rect = el.getBoundingClientRect();
    const containerRect = scrollContainerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const containerTop = containerRect.top;
    const containerBottom = containerRect.bottom;
    const popupHeight = rect.height * scale;

    // Default: position popup where card sits
    let topPos = rect.top;

    //
    // 1. Clamp to top boundary
    //
    const minTop = containerTop + 10;
    if (topPos < minTop) {
      topPos = minTop;
    }

    //
    // 2. Clamp bottom boundary: popupBottom ≤ containerBottom + 20
    //
    const popupBottom = topPos + popupHeight;
    const maxBottom = containerBottom + 20;

    if (popupBottom > maxBottom) {
      topPos = maxBottom - popupHeight;
    }

    //
    // Final position set
    //
    setHoverPos({
      top: topPos,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }


  function handleMouseLeave() {
    hoveredRef.current = null;
    setHoveredRepo(null);
  }

  // Scroll Listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      setScrolling(true);
      clearTimeout(scrollTimeout);
      setHoveredRepo(null);
      scrollTimeout = setTimeout(() => setScrolling(false), 150);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Resize
  useEffect(() => {
    const handleResize = () => {};
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section
      ref={scrollContainerRef}
      className="
        scroll-container
        w-full mx-auto
        overflow-y-auto overflow-x-hidden
        custom-scrollbar
        bg-gray-100 dark:bg-gray-800
        border border-gray-300 dark:border-gray-700
        max-w-[20.6rem] sm:max-w-[28rem] md:max-w-[41.1rem] xl:max-w-[54.75rem]
        [height:calc(100dvh-24rem)] sm:[height:calc(100dvh-20rem)]
        shadow-md
        rounded-2xl">

      {/* Filter bar */}
      <div className="
            sticky top-0 z-10 
            bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur 
            border-b border-gray-300 dark:border-gray-700 
            px-4 py-3 rounded-t-2xl 
            flex flex-nowrap items-center gap-3">

        {/* Filter */}
        <label className="text-sm font-medium">Language:</label>
        <select
          value={filters.language}
          onChange={(e) => setFilters((f) => ({ ...f, language: e.target.value }))}
          className="
            px-2 py-1 rounded-lg 
            border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-900
            min-w-[4rem]
            text-sm">

          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>

          ))}
      </select>

        {/* Sort */}
        <label className="ml-2 text-sm font-medium">Sort:</label>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value }))}
          className="px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-900 min-w-[4rem]">

          <option value="stars">Most Stars</option>
          <option value="created">Date Created</option>
          <option value="activity">Most Activity</option>
          <option value="updated">Last Updated</option>

        </select>
      </div>

      {/* Pop-up Card */}
        {!scrolling && hoveredRepo && (
          <div
            className="fixed z-[20] transition-transform duration-200 ease-out hidden sm:block"
            style={{
              top: `${hoverPos.top}px`,
              left: `${hoverPos.left - 16}px`,
              width: hoverPos.width,
              height: hoverPos.height,
              transform: `scale(${scale})`,
              }}>

            <div className="w-full sm:w-[12rem] h-auto" id="popup-card" onMouseLeave={handleMouseLeave}>
              <RepoCard repo={hoveredRepo}/>
            </div>
          </div>
        )}
      {/* Display Card */}
      {/* Grid */}
      <div
        className="
          grid gap-10
          grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4
          auto-rows-[12rem]
          isolate
          p-5 pt-2.5">
        {visibleRepos.map((repo) => (
          <div key={repo.id} onMouseEnter={(e) => handleMouseEnter(e.currentTarget, repo)} className="relative w-full hover:z-[99] sm:w-[12rem] h-auto">
            <div className="sm:pointer-events-none">
              <RepoCard repo={repo}/>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

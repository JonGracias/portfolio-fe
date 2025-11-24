"use client";

import { useRef, useEffect } from "react";
import RepoCard from "./RepoCard";
import RepoFilters from "./RepoFilters";
import { Repo } from "@/lib/types";
import { useRepoContext } from "@/context/RepoContext";
import { useUIContext } from "@/context/UIContext";

export default function RepoList() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scale = 1.1;

  //
  // Repo Context
  //
  const { visibleRepos } = useRepoContext();

  //
  // UI Context
  //
  const {
    hoveredRepo,
    setHoveredRepo,
    hoverPos,
    setHoverPos,
    scrolling,
    setScrolling,
    overlay,
    overlayPos,
    setOverlayPos,
    clearOverlay,
  } = useUIContext();

  //
  // Hover Handler
  //
  function handleMouseEnter(el: HTMLDivElement, repo: Repo) {
    setHoveredRepo(repo);

    const rect = el.getBoundingClientRect();
    const containerRect = scrollContainerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const containerTop = containerRect.top;
    const containerBottom = containerRect.bottom;

    // Popup sizing
    const popupHeight = rect.height;
    const popupWidth = rect.width;

    // Positioning
    let popupTop = rect.top;
    const minTop = containerTop + 10;
    if (popupTop < minTop) popupTop = minTop;

    const maxBottom = containerBottom - 20;
    const popupBottom = popupTop + popupHeight;
    if (popupBottom > maxBottom) popupTop = maxBottom - popupHeight;

    const popupLeft = rect.left - 15;

    // Hover popup
    setHoverPos({
      top: popupTop,
      left: popupLeft,
      width: popupWidth,
      height: popupHeight,
    });

    // Overlay popup
    setOverlayPos({
      top: popupTop,
      left: popupLeft,
      width: popupWidth + 35,
      height: popupHeight + 35,
    });
  }

  function handleMouseLeave() {
    setHoveredRepo(null);
    clearOverlay();
  }

  //
  // Scroll → hide popup
  //
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      setScrolling(true);
      setHoveredRepo(null);
      clearOverlay();
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => setScrolling(false), 150);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  //
  // Render
  //
  return (
    <div>
      <div onMouseLeave={handleMouseLeave}>
        {/* Hover Popup */}
        {!scrolling && hoveredRepo && (
          <div
            className="fixed z-[20] transition-transform duration-200 ease-out hidden sm:block"
            style={{ ...hoverPos, transform: `scale(${scale})` }}
          >
            <div id="popup-card">
              <RepoCard repo={hoveredRepo} />
            </div>
          </div>
        )}

        {/* Overlay */}
        {overlay && hoveredRepo && overlay.repoName === hoveredRepo.name && (

          <div
            className="
              fixed bg-white dark:bg-neutral-900 
              z-[200] border rounded-md shadow-lg p-2
               overflow-y-auto overflow-x-hidden custom-scrollbar
            "
            style={{ ...overlayPos }}>

            {/* X Button */}
            <div className="w-full flex justify-end">
              <button
                className="
                px-3 py-1 text-sm
                bg-neutral-300 dark:bg-neutral-700
                rounded-md
                hover:bg-neutral-400 dark:hover:bg-neutral-600
                "
                onClick={clearOverlay}
                >
                X
              </button>
            </div>
            
            {/* Content */}
            <div className="">
              {overlay.content}
            </div>

          </div>

        )}
      </div>

      {/* Main Dispay Grid */}

      <div
        ref={scrollContainerRef}
        className="
          scroll-container mx-auto
          overflow-y-auto overflow-x-hidden
          custom-scrollbar
          bg-gray-100 dark:bg-gray-800
          border border-gray-300 dark:border-gray-700
          max-w-[70rem] xl:max-w-[170rem]
          [height:calc(100dvh-24rem)]
          min-h-[20rem]
          shadow-md rounded-2xl">
        {/* Filters */}
        <RepoFilters />


        {/* Grid */}
        <div
          className="
            grid gap-16
            grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4
            auto-rows-[12rem]
            isolate
            p-5 pt-2.5">
          {visibleRepos.map((repo) => (
            <div
              key={repo.id}
              onMouseEnter={(e) => handleMouseEnter(e.currentTarget, repo)}
              className="relative h-full w-full hover:z-[99]"
            >
              <div className="sm:pointer-events-none">
                <RepoCard repo={repo} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

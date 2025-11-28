"use client";

import { useRef, useEffect, useState } from "react";
import RepoCard from "./RepoCard";
import RepoFilters from "./RepoFilters";
import Popup from "./Popup";
import { Repo } from "@/lib/types";
import { useRepoContext } from "@/context/RepoContext";
import { useUIContext } from "@/context/UIContext";

interface Position {
  top: number;
  left: number;
  scale: number;
}

export default function RepoList() {
  const defaultPos: Position = { top: 0, left: 0, scale: 1 };
  const [hoverPos, setHoverPos] = useState<Position>(defaultPos);
  const [messagePos, setMessagePos] = useState<Position>(defaultPos);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    scrolling,
    setScrolling,
    message,
    clearMessage,
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
      scale: 1.1,
    });

    // Message popup
    setMessagePos({
      top: popupTop,
      left: popupLeft,
      scale: 1,
    });
  }

  function handleMouseLeave() {
    setHoveredRepo(null);
    clearMessage();
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
      clearMessage();
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
    
      <div
        ref={scrollContainerRef}
        className="
        scroll-container
        overflow-y-auto overflow-x-hidden
        custom-scrollbar
        bg-gray-100 dark:bg-gray-800
        border border-gray-300 dark:border-gray-700
        [height:calc(100dvh-24rem)]
        max-w-[65rem]
        min-h-[20rem]
        shadow-md rounded-2xl">
        <div onMouseLeave={handleMouseLeave}>
          {/* Hover Popup */} 
          {!scrolling && hoveredRepo && (
            <Popup object={<RepoCard repo={hoveredRepo}/>} position={hoverPos} />
          )}
          {/* Message */}
          {message && hoveredRepo && message.repoName === hoveredRepo.name && (
            <Popup object = {message.content} position={messagePos}/>
          )}
        </div>
        {/* Filters */}
        <RepoFilters />
        {/* Grid */}
        <div
          className="
            grid gap-16
            grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4
            auto-rows-[12rem]
            isolate
            p-5 mr-5 pt-2.5">
          {visibleRepos.map((repo) => (
            <div
              key={repo.id}
              onMouseEnter={(e) => handleMouseEnter(e.currentTarget, repo)}
              className="relative h-full w-full hover:z-[99]">
              <div className="sm:pointer-events-none">
                <RepoCard repo={repo}/>
              </div>
            </div>
          ))}
        </div>
      </div>
   
  );
}

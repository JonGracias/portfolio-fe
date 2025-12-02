"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import RepoCard from "./RepoCard";
import RepoFilters from "./RepoFilters";
import Popup from "./Popup";
import { useRepoContext } from "@/context/RepoContext";
import { useUIContext } from "@/context/UIContext";
import { Repo } from "@/lib/types";

interface Position {
  top: number;
  left: number;
  height: number;
  width: number;
  scale: number;
}

export default function RepoList() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const defaultPos: Position = { top: 0, left: 0, height: 0, width: 0, scale: 0, };
  const [hoverPos, setHoverPos] = useState<Position>(defaultPos);
  const [messagePos, setMessagePos] = useState<Position>(defaultPos);

  const { visibleRepos } = useRepoContext();

  const {
    hoveredRepo,
    setHoveredRepo,
    scrolling,
    setScrolling,
    message,
    clearMessage,
    clearHoveredRepo,
    isMobile
  } = useUIContext();
  
  // Reactive window width
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* -----------------------------------------------------------
   * Popup Position Calculation (Single Source of Truth)
   * ----------------------------------------------------------- */
  const computePopupPosition = useCallback(
    (rect: DOMRect) => {
      const scrollContainerRect =
        scrollContainerRef.current?.getBoundingClientRect();
      const mainContainerRect = 
        mainContainerRef.current?.getBoundingClientRect();
      if (!scrollContainerRect || !mainContainerRect) return defaultPos;

      const scrollContainerTop = scrollContainerRect.top;
      const scrollContainerBottom = scrollContainerRect.bottom;

      const mobileTop = mainContainerRect.top
      const mobileLeft = mainContainerRect.left
      const mobileHeight = mainContainerRect.height
      const mobileWidth = mainContainerRect.width
      
      // Desktop defaults
      let scale = 1.1;
      let height = parseFloat(getComputedStyle(document.documentElement).fontSize) * 14; ;
      let width = parseFloat(getComputedStyle(document.documentElement).fontSize) * 14; ;
      let left = rect.left - 15;
      let top = rect.top;
      
      
      // Clamp top inside container
      const minTop = scrollContainerTop;
      if (top < minTop) top = minTop;
      
      // Clamp bottom
      const maxBottom = scrollContainerBottom + 35;
      if (top + height > maxBottom) {
        top = maxBottom - ( height );
      }
      
      // scale is what changes
      if (isMobile) {
        scale = 1;
        top = mobileTop;
        left = mobileLeft;
        height = mobileHeight;
        width = mobileWidth;
      }
      return { top, left, height, width, scale };
    },
    [scrollContainerRef, windowWidth]
  );


  /* -----------------------------------------------------------
   * Hover Logic
   * ----------------------------------------------------------- */
  const handleMouseEnter = useCallback(
    (element: HTMLDivElement, repo: Repo) => {
      setHoveredRepo(repo);

      const rect = element.getBoundingClientRect();
      const pos = computePopupPosition(rect);

      setHoverPos(pos);
      setMessagePos({ ...pos });
    },
    [setHoveredRepo, computePopupPosition]
  );

  const handleMouseLeave = useCallback(() => {
    clearHoveredRepo();
    clearMessage();
  }, [clearHoveredRepo, clearMessage]);

  /* -----------------------------------------------------------
   * Scroll Behavior: Hide popups during scroll
   * ----------------------------------------------------------- */
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let timeout: NodeJS.Timeout;

    const onScroll = () => {
      setScrolling(true);
      clearHoveredRepo();
      clearMessage();

      clearTimeout(timeout);
      timeout = setTimeout(() => setScrolling(false), 150);
    };

    container.addEventListener("scroll", onScroll);
    return () => {
      container.removeEventListener("scroll", onScroll);
      clearTimeout(timeout);
    };
  }, [setScrolling, clearHoveredRepo, clearMessage]);


  /* -----------------------------------------------------------
   * RENDER
   * ----------------------------------------------------------- */
  return (
    <div onMouseLeave={handleMouseLeave} 
        ref={mainContainerRef}
        className="
          relative flex flex-col h-full shadow-md rounded-xl
          bg-gray-100 dark:bg-gray-800
          border border-gray-300 dark:border-gray-700
          w-[19.1rem] md:w-[32rem] lg:w-[50rem] xl:w-[65rem]
          [height:calc(100dvh-18rem)]
          min-h-[18rem]
          max-h-[90rem]"> 
      <div onMouseLeave={handleMouseLeave}>
        {/* Mobile Popup */}
        {isMobile && hoveredRepo && (
          <Popup object={<RepoCard repo={hoveredRepo} />} position={hoverPos} />
        )}
        {/* Hover Popup */}
        {!scrolling && hoveredRepo && (
          <div className="">
            <Popup object={<RepoCard repo={hoveredRepo} />} position={hoverPos} />
          </div>
        )}
        {/* Message */}
        {message && hoveredRepo && message.repoName === hoveredRepo.name && (
          <Popup object = {message.content} position={messagePos}/>
        )}
      </div>
      {/* Filters */}
        <RepoFilters />
      <div
        ref={scrollContainerRef}
        className="
          scroll-container
          flex-1
          overflow-y-auto overflow-x-hidden
          custom-scrollbar
          flex flex-col items-center justify-start">
        {/* Grid */}
        <div
        ref={gridContainerRef}
          className="
            grid gap-5
            grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4
            auto-rows-[14rem]
            [grid-template-columns:repeat(auto-fill,_14rem)]
            isolate
            px-5 py-10">
          {visibleRepos.map((repo) => (
            <div
              key={repo.id}
              onMouseEnter={(e) => handleMouseEnter(e.currentTarget, repo)}
              className="relative h-[14rem] w-[14rem]">
              <div className="pointer-events-none">
                <RepoCard repo={repo} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

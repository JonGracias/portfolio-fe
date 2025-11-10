// src/components/RepoList.tsx
"use client";
import { useRef, useEffect, useState } from "react";
import RepoCard from "./RepoCard";
import { Repo } from "@/lib/types";
import MobileDetect from 'mobile-detect'; 

export default function RepoList({ repos }: { repos: Repo[] }) {
  const [hoverPos, setHoverPos] = useState<{ top: number; left: number; height: number; width: number }>({ top: 0, left: 0, height: 0, width: 0 });
  const [hoveredRepo, setHoveredRepo] = useState<Repo | null>(null);
  const [scrolling, setScrolling] = useState(false);
  const hoveredRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [starred, setStarred] = useState<Record<string, boolean>>({});
  const [isLoaded, setIsLoaded] = useState<Record<string, boolean>>({});
  const [count, setCount] = useState<Record<string, number>>({});


  // Mouse Enter
  function handleMouseEnter(el: HTMLDivElement, repo: Repo) {
    hoveredRef.current = el;
    setHoveredRepo(repo);

  const rect = el.getBoundingClientRect();
  const containerRect = scrollContainerRef.current?.getBoundingClientRect();
  if (!containerRect) return;
  const containerRectBottm = containerRect.top + containerRect.height;
  const rectBottm = rect.top + rect.height;

  let topPos =
    rect.top < containerRect.top
      ? containerRect.top + 10
      : rect.top;

  topPos = 
    rectBottm > containerRectBottm
      ? (containerRectBottm + 20) - (rect.height)
      : topPos;

  setHoverPos({
    top: topPos,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  });

    console.log("Hovered:", repo.name, hoverPos);
  }

  // Mouse Leave
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

      // hide popup immediately
      setHoveredRepo(null);

      // wait 150ms after user stops scrolling
      scrollTimeout = setTimeout(() => {
        setScrolling(false);
      }, 150);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Resize Listener
  useEffect(() => {
    
    const handleResize = () => {
      console.log("Resize")
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // set initial

    return () => window.removeEventListener("resize", handleResize);
  }, []);


  return (
    <section ref={scrollContainerRef}
      className="
        scroll-container
        w-full mx-auto
        overflow-y-auto overflow-x-hidden
        custom-scrollbar
        bg-gray-100 dark:bg-gray-800
        border border-gray-300 dark:border-gray-700
        sm:max-w-[27.6rem] lg:max-w-[41.1rem] xl:max-w-[54.75rem] 
        sm:max-h-[27.6rem] lg:max-h-[41.1rem] xl:max-h-[54.75rem] 
        shadow-md
        rounded-2xl
      ">
      {!scrolling && hoveredRepo &&(
      <div className="
        fixed z-[20]         
        transition-transform duration-200 ease-out
        hidden sm:block"
        style={{
          top: `${hoverPos.top - 0}px`,
          left: `${hoverPos.left - 16}px`,
          width: hoverPos.width,
          height: hoverPos.height,
          transform: "scale(1.1)",
        }}
      >
        <div className="w-full sm:w-[12rem] h-auto"
          id="popup-card"
          onMouseLeave={handleMouseLeave}>
          <RepoCard
            repo={hoveredRepo}
            starred={starred[hoveredRepo.name] ?? false}
            setStarred={(value: boolean) =>
            setStarred(prev => ({ ...prev, [hoveredRepo.name]: value }))}
            count={count[hoveredRepo.name] ?? hoveredRepo.stargazers_count}
            setCount={(value) => 
            setCount(prev => ({ ...prev, [hoveredRepo.name]: value }))}
            isLoaded={isLoaded[hoveredRepo.name] ?? false}
            setIsLoaded={(value: boolean) =>
            setIsLoaded(prev => ({ ...prev, [hoveredRepo.name]: value }))
          }/>
        </div>
      </div>
      )} 

      <div className="
      grid gap-6
      grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
      auto-rows-[12rem] 
      overflow-hidden
      relative
      isolate
      p-4">
        {repos.map((repo) => (
          <div
            key={repo.id}
            className="relative w-full sm:w-[12rem] h-[12rem]">
            <div onMouseEnter={(e) => handleMouseEnter(e.currentTarget, repo)}>
              <RepoCard 
              repo={repo}
              starred={starred[repo.name] ?? false}
              setStarred={(value: boolean) =>
                setStarred(prev => ({ ...prev, [repo.name]: value }))}
                isLoaded={isLoaded[repo.name] ?? false}
                setIsLoaded={(value: boolean) =>
                setIsLoaded(prev => ({ ...prev, [repo.name]: value }))}
                count={count[repo.name] ?? repo.stargazers_count}
                setCount={(value) => 
                setCount(prev => ({ ...prev, [repo.name]: value }))}
              />
            </div>

          </div>

        ))}
      </div>
    </section>
  );
}
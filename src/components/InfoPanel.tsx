"use client";

import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  memo,
} from "react";
import { Repo } from "@/lib/types";

export interface RepoCardHandle {
  startAutoScroll: () => void;
  stopAutoScroll: () => void;
  getScrollElement: () => HTMLParagraphElement | null;
}

interface Props {
  repo: Repo;
}

const InfoPanel = forwardRef<RepoCardHandle, Props>(({ repo }, ref) => {
  const descRef = useRef<HTMLParagraphElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // -----------------------------------------------------
  // STOP AUTO SCROLL
  // -----------------------------------------------------
  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // -----------------------------------------------------
  // START AUTO SCROLL (with layout delay fix)
  // -----------------------------------------------------
  const startAutoScroll = () => {
    const el = descRef.current;
    if (!el) return;

    // Stop any previous interval
    stopAutoScroll();

    // Delay ensures layout is committed before measuring
    setTimeout(() => {
      const el = descRef.current;
      if (!el) return;

      // If not scrollable, do nothing
      if (el.scrollHeight <= el.clientHeight) return;

      intervalRef.current = setInterval(() => {
        if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
          stopAutoScroll(); // auto-stop on bottom reached
          return;
        }
        el.scrollTop += 1;
      }, 80);
    }, 20); // Text Speed
  };

  // -----------------------------------------------------
  // EXPOSE HANDLERS TO PARENT
  // -----------------------------------------------------
  useImperativeHandle(ref, () => ({
    startAutoScroll,
    stopAutoScroll,
    getScrollElement: () => descRef.current,
  }));

  // -----------------------------------------------------
  // CLEANUP ON UNMOUNT
  // -----------------------------------------------------
  useEffect(() => {
    return () => stopAutoScroll();
  }, []);

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  const formattedDate = new Date(repo.updated_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <button className="flex flex-col
    rounded-lg
    border border-white dark:border-neutral-900
    hover:border-blue-400 dark:hover:border-orange-400">

      <h1 className="text-2xl font-semibold text-blue-800 dark:text-blue-400 truncate">
        {repo.name}
      </h1>

      <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mt-1">
        Updated {formattedDate}
      </div>

      <p
        ref={descRef}
        className="
          text-sm text-gray-600 dark:text-gray-300 leading-5
          h-[3.5rem] overflow-y-auto overflow-x-hidden
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          opacity-70 my-2
          transition-opacity duration-200 ease-out
          group-hover:opacity-100">
        {repo.description ?? "No description"}
      </p>
    </button>
  );
});

export default memo(InfoPanel);

"use client";

import { useEffect, useRef, memo } from "react";
import LanguageDisplay from "./LanguageDisplay";
import StarButton from "./StarButton";
import GitHubButton from "./GitHubButton";
import { useUIContext } from "@/context/UIContext";
import InfoPanel, { RepoCardHandle } from "./InfoPanel";
import type { Position, RepoCardProps  } from "@/lib/repos";

const DEFAULT_POS: Position = {
  top: 0,
  left: 0,
  height: 0,
  width: 0,
  scale: 1,
};

export default memo(function RepoCard({
  repo,
  position = {},
}: RepoCardProps) {
  const finalPos: Position = { ...DEFAULT_POS, ...position };
  const infoRef = useRef<RepoCardHandle>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const {
    hoveredRepo,
  } = useUIContext();
  const isActive = hoveredRepo?.name === repo.name;

  function handleEnter() {
    const el = infoRef.current?.getScrollElement?.();

    if (el && el.scrollHeight > el.clientHeight) {
      infoRef.current?.startAutoScroll();
    }
  }

  function handleLeave() {
    const el = infoRef.current?.getScrollElement?.();

    if (el) {
      el.scrollTo({ top: 0, behavior: "smooth" });
    }

    infoRef.current?.stopAutoScroll();
  }

  //
  // ────────────────────────────────────────────────────────────────
  // Popup wheel scroll forwarding (NO document.getElementById)
  // ────────────────────────────────────────────────────────────────
  //
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Only forward wheel events when inside the popup
    if (!card.closest("#popup-card")) return;

    const forwardWheel = (e: WheelEvent) => {
      e.preventDefault();
      const container = document.querySelector(".scroll-container");
      if (container) {
        container.scrollBy({ top: e.deltaY });
      }
    };

    card.addEventListener("wheel", forwardWheel, { passive: false });
    return () => card.removeEventListener("wheel", forwardWheel);
  }, []);


  const buttonClass = [
    "h-[3.5rem] w-full",
    "flex items-center justify-center",
    "rounded-lg m-",
    "border border-white dark:border-neutral-900",
    "hover:border-blue-400 dark:hover:border-orange-400",
  ].join(" ");


  //
  // ────────────────────────────────────────────────────────────────
  // Component
  // ────────────────────────────────────────────────────────────────
  //
  return (
    <section
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      ref={cardRef}
      className={
        [
          "RepoCard",
          "group block rounded-xl",
          "bg-white dark:bg-neutral-900",

          // BASE BORDER
          "border border-gray-200 dark:border-neutral-700",

          // 🔵🟠 HOVER BORDER (theme-aware)
          "hover:border-blue-400",
          "dark:hover:border-orange-400",

          // OPTIONAL: active/focus consistency
          "focus-within:border-blue-400",
          "dark:focus-within:border-orange-400",

          // SHADOW STACK
          "shadow-[0_8px_24px_rgba(0,0,0,0.5),0_2px_6px_rgba(0,0,0,0.4)]",
          "dark:shadow-[0_8px_28px_rgba(0,0,0,0.7),0_2px_8px_rgba(0,0,0,0.6)]",

          // HOVER SHADOW
          "hover:shadow-[0_16px_40px_rgba(0,0,0,0.18),0_6px_12px_rgba(0,0,0,0.12)]",
          "dark:hover:shadow-[0_18px_48px_rgba(0,0,0,0.75),0_6px_14px_rgba(0,0,0,0.55)]",

          // TRANSITIONS
          "transition-[border-color,box-shadow,transform] duration-200 ease-out",

          "p-4 relative",
          "w-full h-full",
          "flex flex-col items-center justify-center",
        ].join(" ")

      }>
        
      {/* CLICKABLE INFO PANEL */}
      <InfoPanel
        ref={infoRef}
        repo={repo}
        isActive={isActive}
        isLarge={false}   
      />

      {/* BUTTON ROW */}
      <div className="grid grid-cols-3 items-center justify-center mt-2 gap-2">
        <section className={buttonClass}>
          <GitHubButton repo={repo} />
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

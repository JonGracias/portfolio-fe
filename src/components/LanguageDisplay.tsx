"use client";
import { useState, useEffect } from "react";
import { useRepoContext } from "@/context/RepoContext";
import { Repo } from "@/lib/types";

export default function LanguageDisplay({ repo }: { repo: Repo }) {
  const { filters, displayLanguage, setFilters } = useRepoContext();

  // The Primary Language
  const currentDisplayLanguage = displayLanguage[repo.name] ?? "Unknown";

  // For Hover Text
  const [message, setMessage] = useState<string>("");

  // Raw language map for percentages
  const langMap = repo.languages ?? {};
  const totalBytes = Object.values(langMap).reduce((a, b) => a + b, 0);

  const formatPercent = (bytes: number) => {
    if (!totalBytes) return "0%";
    return ((bytes / totalBytes) * 100).toFixed(1) + "%";
  };

  // Show ALL languages on hover
  // Make a list of buttons that change the current filter
  function handleMouseEnter() {
    if (!langMap || Object.keys(langMap).length === 0) {
      setMessage(currentDisplayLanguage);
      return;
    }

    const lines = Object.entries(langMap).map(([lang, bytes]) => {
      return `${lang}: ${formatPercent(bytes)}`;
    });

    setMessage(lines.join(" • "));
  }

  // Show the display language + percent on leave
  function handleMouseLeave() {
    if (!currentDisplayLanguage || !langMap[currentDisplayLanguage]) {
      setMessage(currentDisplayLanguage);
      return;
    }
    setMessage(
      `${currentDisplayLanguage}: ${formatPercent(
        langMap[currentDisplayLanguage]
      )}`
    );
  }

  // Clicking filters to the displayLanguage
  function handleFilterClick() {
    setFilters((f) => ({
      ...f,
      language: currentDisplayLanguage,
    }));
  }

  // Set initial message WHEN displayLanguage changes
  useEffect(() => {
    if (langMap[currentDisplayLanguage]) {
      setMessage(
        `${currentDisplayLanguage}: ${formatPercent(
          langMap[currentDisplayLanguage]
        )}`
      );
    } else {
      setMessage(currentDisplayLanguage);
    }
  }, [currentDisplayLanguage, repo.languages]);

  return (
    <button
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        handleFilterClick();
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={[
        "min-w-[7rem]",
        "block w-full rounded-xl border shadow-sm",
        "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700",
        "hover:border-blue-400 active:border-blue-400 hover:dark:border-orange-400 hover:dark:active-orange-400",
        "transform-gpu origin-center transition-transform duration-200 ease-out", "hover:scale-105",
        "hover:shadow-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500",
        "rounded-xl",
        "text-sm font-medium text-gray-700 dark:text-gray-300",
        filters.language === currentDisplayLanguage
          ? "border-blue-400 dark:border-red-400"
          : "",
      ].join(" ")}> 
      <span>{message}</span>
    </button>
  );
}

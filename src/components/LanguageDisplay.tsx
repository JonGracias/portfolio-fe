"use client";

import { useState, useEffect, useMemo, memo } from "react";
import { useRepoContext } from "@/context/RepoContext";
import { Repo } from "@/lib/types";
import { useUIContext } from "@/context/UIContext";
import  LangIcon  from "./LangIcon";
import { getLanguageIconUrl } from "@/utils/getLanguageIconUrl";
import { loadIcon } from "@/utils/iconCache";

export default function LanguageDisplay({ repo }: { repo: Repo }) {
  const { setFilters, displayLanguage } = useRepoContext();
  const { setMessageMessage, clearMessage, setHoveredRepo } = useUIContext();

  const langMap = repo.languages ?? {};
  const totalBytes = Object.values(langMap).reduce((a, b) => a + b, 0);

  const primaryLanguage = displayLanguage[repo.name] ?? "Unknown";

  /* ────────────────────────────────────────────────
     NORMALIZATION
  ───────────────────────────────────────────────── */

  function percent(bytes: number) {
    if (!totalBytes) return "0%";
    return ((bytes / totalBytes) * 100).toFixed(1) + "%";
  }


  /* ────────────────────────────────────────────────
     CLICK → OPEN OVERLAY WITH 3-COL GRID OF LANGS
  ───────────────────────────────────────────────── */
  function handleClick() {
    if (!langMap || Object.keys(langMap).length === 0) {
      clearMessage();
      return;
    }

    const entries = Object.entries(langMap).map(([lang, bytes]) => (
      <button
        key={lang}
        className="
          flex flex-col items-center justify-center
          hover:bg-blue-100 dark:hover:bg-neutral-700
          rounded-md p-2 text-sm h-[4rem]
        "
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          clearMessage();
          setHoveredRepo(null);
          setFilters((f) => ({ ...f, language: lang }));
        }}
      >
        <LangIcon key={lang} lang={lang} percentText={percent(bytes)} />
      </button>
    ));

    const message = (
      <section>
        {/* List of Languages */}
        <div className="grid grid-cols-2 gap-6 p-4">{entries}
        </div>
      </section>
    );

    setMessageMessage(
      repo.name,
      message
    );
  }

  /* ────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────── */
  return (
    <button
      onClick={handleClick}
      className="overflow-visible w-[4rem] h-[4rem] flex items-center justify-center cursor-pointer"
    >
      <LangIcon key={primaryLanguage} lang={primaryLanguage} percentText={percent(langMap[primaryLanguage])}/>
    </button>
  );
}

"use client";

import { useState, useEffect, useMemo, memo } from "react";
import { useRepoContext } from "@/context/RepoContext";
import { Repo } from "@/lib/types";
import { useUIContext } from "@/context/UIContext";
import { getLanguageIconUrl } from "@/utils/getLanguageIconUrl";
import { loadIcon } from "@/utils/iconCache";

export default function LanguageDisplay({ repo }: { repo: Repo }) {
  const { setFilters, displayLanguage } = useRepoContext();
  const { setOverlayMessage, clearOverlay, setHoveredRepo } = useUIContext();

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
     ICON COMPONENT WITH FALLBACK
  ───────────────────────────────────────────────── */
  const LangIcon = memo(function LangIcon({
    lang,
    percentText
  }: {
    lang: string;
    percentText: string;
  }) {
    
    const [iconUrl, setIconUrl] = useState<string | null>(null);
    const urls = useMemo(() => getLanguageIconUrl(lang), [lang]);
    const [idx, setIdx] = useState(0);

    useEffect(() => {
      setIdx(0);
    }, [lang]);

    const src = urls[idx];
      useEffect(() => {
        let active = true;
        setIconUrl(null); // reset ui to blank while loading

        if (!src) return;

        loadIcon(src)
          .then((blobUrl) => {
            if (active) setIconUrl(blobUrl);
          })
          .catch(() => setIdx((i) => i + 1));

        return () => {
          active = false;
        };
      }, [src]);

    return (
      <div className="relative w-14 h-14 flex items-center justify-center">
        <div className="
          w-14 h-14 flex items-center justify-center
          rounded-lg
          bg-icon
          backdrop-blur-sm
          pointer-events-none
        ">
          {iconUrl ? (
            <img src={iconUrl} className="w-12 h-12 rounded-lg" />
          ) : (
            <div className="w-12 h-12" />
          )}

        </div>

        <div className="absolute top-11 left-6 w-10 h-10 flex items-center justify-center">
          <span className="relative text-[10px] font-bold text-white">
            {percentText}
          </span>
        </div>
      </div>
    );
  });


  /* ────────────────────────────────────────────────
     CLICK → OPEN OVERLAY WITH 3-COL GRID OF LANGS
  ───────────────────────────────────────────────── */
  function handleClick() {
    if (!langMap || Object.keys(langMap).length === 0) {
      clearOverlay();
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
          clearOverlay();
          setHoveredRepo(null);
          setFilters((f) => ({ ...f, language: lang }));
        }}
      >
        <LangIcon key={lang} lang={lang} percentText={percent(bytes)} />
      </button>
    ));

    setOverlayMessage(
      repo.name,
      <div className="w-full flex flex-col gap-3 p-2">
        {/* close button row handled by UIContext — you said not to touch */}
        <div className="grid grid-cols-2 gap-10">{entries}</div>
      </div>
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

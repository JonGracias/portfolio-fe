"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { getLanguageIconUrl } from "@/utils/getLanguageIconUrl";
import { Repo } from "@/lib/types";

type IconCache = Record<string, string | null>;

interface LanguageIconContextType {
  getIcon: (lang: string) => string | null;
  loadIconsForRepos: (repos: any[]) => Promise<void>;
}

export const LanguageIconContext = createContext<LanguageIconContextType | null>(null);

// ---------------------------------------------------------
// Utility: find first working icon URL
// ---------------------------------------------------------
async function findFirstWorkingUrl(urls: (string | null)[]) {
  for (const url of urls) {
    if (!url) continue;
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok) return url; // confirmed working URL
    } catch {}
  }
  return null;
}

// ---------------------------------------------------------
// Provider
// ---------------------------------------------------------
export function LanguageIconProvider({
    repos,
    children,
    }: {
    repos: Repo[];
    children: React.ReactNode;
    }) {
    const [cache, setCache] = useState<IconCache>({});

    const loadIconsForRepos = useCallback(async (repos: Repo[]) => {
        const languages = new Set<string>();

        repos.forEach((r) => {
        if (!r.languages) return;
        Object.keys(r.languages).forEach((l) => languages.add(l));
        });

        const newCache: IconCache = {};

        for (const lang of languages) {
        const urls = getLanguageIconUrl(lang);
        const working = await findFirstWorkingUrl(urls);
        newCache[lang] = working;
        }

        setCache(newCache);
    }, []);

    // load icons when repos change
    useEffect(() => {
        if (repos.length > 0) {
        loadIconsForRepos(repos);
        }
    }, [repos, loadIconsForRepos]);

    const getIcon = useCallback(
        (lang: string) => cache[lang] ?? null,
        [cache]
    );

    const value = useMemo(
        () => ({
        getIcon,
        loadIconsForRepos,
        }),
        [getIcon, loadIconsForRepos]
    );

    return (
        <LanguageIconContext.Provider value={value}>
        {children}
        </LanguageIconContext.Provider>
    );
}



// Consumer hook
export function useLanguageIcons() {
  const ctx = useContext(LanguageIconContext);
  if (!ctx) {
    throw new Error("useLanguageIcons must be used within LanguageIconProvider");
  }
  return ctx;
}

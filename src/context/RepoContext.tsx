"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { Repo } from "@/lib/types";

interface RepoContextType {
  repos: Repo[];

  // Stars
  starred: Record<string, boolean>;
  setStarred: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  refreshStars: () => Promise<void>;

  // Star counts
  count: Record<string, number>;
  setCount: React.Dispatch<React.SetStateAction<Record<string, number>>>;

  // Filters
  filters: { language: string; sortBy: string };
  setFilters: React.Dispatch<
    React.SetStateAction<{ language: string; sortBy: string }>
  >;

  // Language controls
  languages: string[];
  visibleRepos: Repo[];
  displayLanguage: Record<string, string>;
  setDisplayLanguage: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const RepoContext = createContext<RepoContextType | undefined>(undefined);

export function RepoProvider({ repos, children }: { repos: Repo[]; children: ReactNode }) {
  //
  // ────────────────────────────────────────────────────────────────
  // Stars (user-level)
  // ────────────────────────────────────────────────────────────────
  //
  const [starred, setStarred] = useState<Record<string, boolean>>({});
  const merged: Record<string, boolean> = { ...starred };

  useEffect(() => {
    const cachedStars = localStorage.getItem("starredCache");
    if (cachedStars) {
      setStarred(JSON.parse(cachedStars));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("starredCache", JSON.stringify(starred));
  }, [starred]);

  async function refreshStars() {
    try {
      const res = await fetch("/api/github/starred-list", { cache: "no-store" });
      const data = await res.json();

      if (data.authed && Array.isArray(data.repos)) {
        const map: Record<string, boolean> = {};
        data.repos.forEach((r: any) => {
          if (r.name) map[r.name] = true;
        });
        data.repos.forEach((r: any) => {
          merged[r.name] = true;
        });

        // remove local stars that no longer exist
        Object.keys(merged).forEach((name) => {
          if (!data.repos.some((r: any) => r.name === name)) {
            delete merged[name];
          }
        });

        setStarred(merged);
      }
    } catch (err) {
      console.error("refreshStars failed:", err);
    }
  }

  useEffect(() => {
    refreshStars();
  }, []);

  //
  // ────────────────────────────────────────────────────────────────
  // Star counts (repo-level)
  // ────────────────────────────────────────────────────────────────
  //
  const [count, setCount] = useState<Record<string, number>>({});

  useEffect(() => {
    const initialCounts: Record<string, number> = {};
    repos.forEach((r) => (initialCounts[r.name] = r.stargazers_count));
    setCount(initialCounts);
  }, [repos]);

  //
  // ────────────────────────────────────────────────────────────────
  // Filters
  // ────────────────────────────────────────────────────────────────
  //
  const [filters, setFilters] = useState({
    language: "All",
    sortBy: "activity",
  });

  //
  // ────────────────────────────────────────────────────────────────
  // Languages
  // ────────────────────────────────────────────────────────────────
  //
  const languages = useMemo(() => {
    const set = new Set<string>();
    repos.forEach((repo) => {
      if (repo.languages) Object.keys(repo.languages).forEach((l) => set.add(l));
      if (repo.language) set.add(repo.language);
    });
    return ["All", ...Array.from(set).sort()];
  }, [repos]);

  //
  // ────────────────────────────────────────────────────────────────
  // Visible repos
  // ────────────────────────────────────────────────────────────────
  //
  const visibleRepos = useMemo(() => {
    let list = [...repos];

    // Filter
    if (filters.language !== "All") {
      list = list.filter((r) =>
        r.languages
          ? Object.keys(r.languages).includes(filters.language)
          : r.language === filters.language
      );
    }

    // Sort
    list.sort((a, b) => {
      switch (filters.sortBy) {
        case "created":
          return +new Date(b.created_at) - +new Date(a.created_at);
        case "updated":
          return +new Date(b.updated_at) - +new Date(a.updated_at);
        case "stars":
          return b.stargazers_count - a.stargazers_count;
        default:
        case "activity":
          return +new Date(b.pushed_at) - +new Date(a.pushed_at);
      }
    });

    return list;
  }, [repos, filters]);

  //
  // ────────────────────────────────────────────────────────────────
  // Display language per repo
  // ────────────────────────────────────────────────────────────────
  //
  const [displayLanguage, setDisplayLanguage] = useState<Record<string, string>>({});

  useEffect(() => {
    const map: Record<string, string> = {};

    repos.forEach((repo) => {
      const langs = repo.languages ? Object.keys(repo.languages) : [];
      const match = langs.includes(filters.language);
      map[repo.name] = match ? filters.language : repo.language ?? "Unknown";
    });

    setDisplayLanguage(map);
  }, [repos, filters.language]);

  return (
    <RepoContext.Provider
      value={{
        repos,

        starred,
        setStarred,
        refreshStars,

        count,
        setCount,

        filters,
        setFilters,

        languages,
        visibleRepos,

        displayLanguage,
        setDisplayLanguage,
      }}
    >
      {children}
    </RepoContext.Provider>
  );
}

export function useRepoContext() {
  const ctx = useContext(RepoContext);
  if (!ctx) throw new Error("useRepoContext must be used inside RepoProvider");
  return ctx;
}

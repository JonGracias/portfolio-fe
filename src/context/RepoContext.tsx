"use client";
import { createContext,  useContext, useEffect, useState, ReactNode, useMemo } from "react";
import { Repo } from "@/lib/types";

const LANGUAGE_ABBREVIATIONS: Record<string, string> = {
  JavaScript: "JS",
  TypeScript: "TS",
  Python: "PY",
  "C++": "CPP",
  "C#": "CS",
  Go: "GO",
  Rust: "RS",
  Java: "JAVA",
  HTML: "HTML",
  CSS: "CSS",
  Shell: "SH",
  Dockerfile: "DF",
  PHP: "PHP",
};


interface RepoContextType {
  userMessage: [string, boolean];
  setUserMessage: React.Dispatch<React.SetStateAction<[string, boolean]>>;
  starred: Record<string, boolean>;
  setStarred: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  isLoaded: boolean;
  count: Record<string, number>;
  setCount: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  displayLanguage: Record<string, string>;
  setDisplayLanguage: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  hoveredRepo: Repo | null;
  setHoveredRepo: React.Dispatch<React.SetStateAction<Repo | null>>;
  refreshStars: () => Promise<void>;
  repos: Repo[];

  filters: {
    language: string;
    sortBy: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      language: string;
      sortBy: string;
    }>
  >;

  languages: string[];
  visibleRepos: Repo[];
}
// Need to add abreviated languages
// Need to add a play button if there is a #PlayableDemo in repo

const RepoContext = createContext<RepoContextType | undefined>(undefined);

export function RepoProvider({ repos, children }: { repos: Repo[]; children: ReactNode }) {
  const [userMessage, setUserMessage] = useState<[string, boolean]>(["", false]);
  const [starred, setStarred] = useState<Record<string, boolean>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [count, setCount] = useState<Record<string, number>>({});
  const [displayLanguage, setDisplayLanguage] = useState<Record<string, string>>({});
  const [hoveredRepo, setHoveredRepo] = useState<Repo | null>(null);
  const [filters, setFilters] = useState({
    language: "All",
    sortBy: "activity",
  });
  
  // -----------------------
  // Filters + Sorting
  // -----------------------
  // Get available languages dynamically
  const languages = useMemo(() => {
    const langs = new Set<string>();
    repos.forEach(r => r.language && langs.add(r.language));
    return ["All", ...Array.from(langs).sort((a, b) => a.localeCompare(b))];
  }, [repos]);

  // Compute filtered + sorted repos
  const visibleRepos = useMemo(() => {
    let list = [...repos];

    // Filter by language
    if (filters.language !== "All") {
      list = list.filter(r =>
        (r.languages && Object.keys(r.languages).includes(filters.language)) ||
        r.language === filters.language
      );
    }

    // Sorting
    list.sort((a, b) => {
      switch (filters.sortBy) {
        case "created":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "stars":
          return (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0);
        case "activity":
          return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
        case "updated":
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        default:
          return 0;
      }
    });

    return list;
  }, [repos, filters]);

  // -----------------------------------------------
  // 1. Build count map from repos (always in sync)
  // -----------------------------------------------
  useEffect(() => {
    if (!repos || repos.length === 0) return;

    const newCounts: Record<string, number> = {};

    for (const r of repos) {
      newCounts[r.name] = r.stargazers_count;
    }

    setCount(newCounts);

  }, [repos]);   

  // -----------------------------------------------
  // 2. Load user's starred repos (only on mount)
  // -----------------------------------------------
  async function refreshStars() {
    try {
      const res = await fetch("/api/github/starred-list", { cache: "no-store" });
      const data = await res.json();

      if (data.authed && Array.isArray(data.repos)) {
        const starredMap: Record<string, boolean> = {};

        for (const r of data.repos) {
          if (r.name) {
            starredMap[r.name] = true;
          }
        }

        setStarred(starredMap);
      }
    } catch (err) {
      console.error("refreshStars failed:", err);
    } finally {
      setIsLoaded(true);
    }
  }

  useEffect(() => {
  refreshStars();
  }, []);

  // -----------------------
  // Display Language 
  // -----------------------
  useEffect(() => {
  const newDisplay: Record<string, string> = {};

  for (const repo of repos) {
    const langs = repo.languages ? Object.keys(repo.languages) : [];
    const hasLanguage = langs.includes(filters.language);

    newDisplay[repo.name] = hasLanguage
      ? filters.language
      : repo.language ?? "Unknown";
  }

  setDisplayLanguage(newDisplay);
}, [repos, filters.language]);



    return (
      <RepoContext.Provider
        value={{
          starred,
          setStarred,
          isLoaded,
          count,
          setCount,
          hoveredRepo,
          setHoveredRepo,
          refreshStars,
          repos,
          filters,
          setFilters,
          languages,
          visibleRepos,
          displayLanguage,
          setDisplayLanguage,
          userMessage,
          setUserMessage,
        }}
      >
        {children}
      </RepoContext.Provider>
    );
  }

  export function useRepoContext() {
    const context = useContext(RepoContext);
    if (!context) throw new Error("useRepoContext must be used within a RepoProvider");
    return context;
}

"use client";
import { useRepoContext } from "@/context/RepoContext";
import { useAuth } from "@/context/AuthProvider";
import { Filters } from "@/lib/filters";

export default function RepoFilters() {
  const { filters, setFilters, languages } = useRepoContext();
  const { isLogged, loading } = useAuth();

  return (
    <div
  className="
    sticky top-0 z-10
    bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur
    border-b border-gray-300 dark:border-gray-700
    px-4 py-3 rounded-t-2xl
    flex items-center justify-between gap-4
  "
>
  {/* LEFT: Filters + Sort */}
    <div className="flex flex-wrap items-center gap-3">
      {/* Filter */}
      <label className="text-sm font-medium">Language:</label>
      <select
        value={filters.language}
        onChange={(e) =>
          setFilters((f) => ({ ...f, language: e.target.value }))
        }
        className="
          px-2 py-1 rounded-lg
          border border-gray-300 dark:border-gray-700
          bg-white dark:bg-neutral-900
        "
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>

      {/* Sort */}
      <label className="text-sm font-medium">Sort by:</label>
      <select
        value={filters.sortBy}
        onChange={(e) =>
          setFilters((f) => ({
            ...f,
            sortBy: e.target.value as Filters["sortBy"],
          }))
        }

        className="
          px-2 py-1 rounded-lg
          border border-gray-300 dark:border-gray-700
          bg-white dark:bg-neutral-900
        "
      >
        <option value="stars">Most Stars</option>
        <option value="created">Date Created</option>
        <option value="activity">Most Worked On</option>
        <option value="updated">Last Updated</option>
      </select>
    </div>

    {/* RIGHT: Auth */}
    <div className="flex items-center">
      {!loading && !isLogged && (
        <a
          href="/api/github/login"
          className="
            text-sm font-medium
            text-red-600 dark:text-red-400
          "
        >
          Log into Github
        </a>
      )}

      {!loading && isLogged && (
        <span
          className="
            text-sm font-medium
            text-green-600 dark:text-green-400
          "
        >
          Github
        </span>
      )}
      {loading && (
        <span
          className="
            text-sm font-medium
            text-green-600 dark:text-green-400
          "
        >
         One Sec...
        </span>
      )}
    </div>
  </div>

  );
}

// src/components/RepoCard.tsx
"use client";
import { useState, useEffect, useRef, JSX } from "react";
import { useRepoContext } from "@/context/RepoContext";
import { Repo } from "@/lib/types";

export default function StarButton({ repo }: { repo: Repo }) {
  const {
    starred,
    setStarred,
    isLoaded,
    count,
    setCount,
  } = useRepoContext();
  
  const repoStarred = starred[repo.name] ?? false;
  const starCount = count[repo.name] ?? 0;


  const updateStarred = (value: boolean) =>
    setStarred(prev => ({ ...prev, [repo.name]: value }));
  const updateCount = (value: number) =>
    setCount(prev => ({ ...prev, [repo.name]: value }));

  const [starring, setStarring] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  // Handle Star
  async function handleStar(): Promise<void> {
    setStarring(true);
    try {
      const res = await fetch("/api/github/star", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: repo.owner, repo: repo.name }),
      });
      const data = await res.json();

      if (res.status === 401) {
        window.location.href = "/api/github/login";
        return;
      }

      if (data.ok) {
        updateStarred(true);
        updateCount(data.count);
      }
    } finally {
      setStarring(false);
    }
  }

  // Handle Unstar
  async function handleUnStar(): Promise<void> {
    setShowConfirm(true);
  }

  // Confirm Unstar - Joke Message
  function confirmUnstar(choice: "yes" | "no"): void {
    if (choice === "yes") {
      setMessage("😆 Not allowed!");
    }
    setShowConfirm(false);

    if (choice === "yes") {
      setTimeout(() => setMessage(null), 3000);
    }
  }

  return (
    <section className="relative"> 
      {/* Star/UnStar Container */}
      {isLoaded &&
        <div className="
                text-sm text-gray-500 dark:text-gray-400
                w-full ">
                
            {/* Star Button */}
            {!repoStarred && (
                <button
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleStar();
                }}
                disabled={starring || repoStarred}
                className="font-semibold p-2 opacity-80 hover:opacity-100 hover:scale-105">
                    {starring ? "Starring..." : `${starCount} ☆ `}
                </button>
            )}
        
            {/* Unstar Button */}
            {repoStarred && (
              <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUnStar();}}
              disabled={starring}
              className="font-semibold p-2 opacity-80 hover:opacity-100 hover:scale-110">
                  {starCount}⭐ 
              </button>
            )} 
        </div>
      }

        {/* Confirm Unstar */}
      <div className="
            absolute z-50 bottom-1 right-0
            w-max
            bg-white dark:bg-neutral-900 
            border rounded-lg shadow-xl p-2 
            text-red-600 text-center">
        {showConfirm && !message && (
          <div>
            <div className="grid h-full min-h-[12rem] place-items-center p-5 text-center">
              <p>Would you like to unstar this?</p>
              <div className="flex gap-3 mt-2">
                <button
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    confirmUnstar("yes")}}
                    className="rounded bg-red-500 text-white hover:bg-red-600">
                    Yes
                </button>
                <button
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    confirmUnstar("no")}}
                    className=" rounded bg-gray-500 hover:bg-gray-600">
                    No
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Message */}
        {message && (
          <div>
            {message}
          </div>
        )}
      </div>
    </section>
  );
}
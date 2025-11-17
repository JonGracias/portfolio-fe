// src/components/RepoCard.tsx
"use client";
import { useState, useEffect, useRef, JSX } from "react";
import { useRepoContext } from "@/context/RepoContext";
import { Repo } from "@/lib/types";
import  LanguageDisplay  from "./LanguageDisplay"
import  StarDisplay  from "./StarButton"
import  PlayButton  from "./PlayButton"

export default function RepoList({ repo }: { repo: Repo }) {
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
  const cardRef = useRef<HTMLDivElement>(null);


  const updated: string = new Date(repo.updated_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Pass Scroll Events
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      document.querySelector(".scroll-container")?.scrollBy({
        top: e.deltaY,
        behavior: "smooth",
      });
    };

    const popup = document.getElementById("popup-card");
    popup?.addEventListener("wheel", handleWheel, { passive: false });

    return () => popup?.removeEventListener("wheel", handleWheel);
  }, []);

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
    // MAIN CONTAINER
    <section>
      <span className="text-xl">▶</span>
    </section>
  );
}

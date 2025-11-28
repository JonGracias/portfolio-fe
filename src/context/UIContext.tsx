"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode
} from "react";

interface RepoMessage {
  repoName: string;
  content: ReactNode;
}

interface UIContextType {
  // Hovered repository (for popup or highlight behavior)
  hoveredRepo: any | null;
  setHoveredRepo: (repo: any | null) => void;

  // Message content and position (repo popover, star popup, language popup, etc)
  message: RepoMessage | null;
  setMessageMessage: (repoName: string, content: ReactNode) => void;

  // Scrolling flag (to hide messages on scroll)
  scrolling: boolean;
  setScrolling: (state: boolean) => void;

  // Clearing messages
  clearMessage: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [hoveredRepo, setHoveredRepo] = useState<any | null>(null);

  const [message, _setMessage] = useState<RepoMessage | null>(null);

  const [scrolling, setScrolling] = useState(false);

  // Wrapper API for setting message
  function setMessageMessage(repoName: string, message: ReactNode) {
    const content = (
      <section className=" 
      overflow-y-auto overflow-x-hidden
      custom-scrollbar
      bg-gray-100 dark:bg-gray-800
      border border-gray-300 dark:border-gray-700
      w-[14rem] h-[14rem] 
      shadow-md rounded-xl"
      onMouseLeave={clearMessage}>
      {/* Close Button */}
        <div className="flex items-center justify-end w-full"> 
          <button
            onClick={(e) => {
              e.stopPropagation();   
              clearMessage();        
            }}
            className="
              w-7 h-7
              flex items-center justify-center
              rounded-md
              bg-neutral-300 dark:bg-neutral-700
              hover:bg-neutral-400 dark:hover:bg-neutral-600
              text-black dark:text-white
              font-bold
              shadow">
            ✕
          </button>
        </div>
        {message}
      </section>
    );      
    _setMessage({ repoName, content });
  }

  function clearMessage() {
    _setMessage(null);
  }

  return (
    <UIContext.Provider
      value={{
        hoveredRepo,
        setHoveredRepo,

        message,
        setMessageMessage,

        scrolling,
        setScrolling,

        clearMessage
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUIContext() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUIContext must be used inside UIProvider");
  return ctx;
}

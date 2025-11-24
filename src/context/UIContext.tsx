"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode
} from "react";

interface Position {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface RepoMessage {
  repoName: string;
  content: ReactNode;
}

interface UIContextType {
  // Hovered repository (for popup or highlight behavior)
  hoveredRepo: any | null;
  setHoveredRepo: (repo: any | null) => void;

  // Card hover position (for popup positioning)
  hoverPos: Position;
  setHoverPos: (pos: Position) => void;

  // Overlay content and position (repo popover, star popup, language popup, etc)
  overlay: RepoMessage | null;
  setOverlayMessage: (repoName: string, content: ReactNode) => void;

  overlayPos: Position;
  setOverlayPos: (pos: Position) => void;

  // Scrolling flag (to hide overlays on scroll)
  scrolling: boolean;
  setScrolling: (state: boolean) => void;

  // Clearing overlays
  clearOverlay: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const defaultPos: Position = { top: 0, left: 0, width: 0, height: 0 };

  const [hoveredRepo, setHoveredRepo] = useState<any | null>(null);
  const [hoverPos, setHoverPos] = useState<Position>(defaultPos);

  const [overlay, _setOverlay] = useState<RepoMessage | null>(null);
  const [overlayPos, setOverlayPos] = useState<Position>(defaultPos);

  const [scrolling, setScrolling] = useState(false);

  // Wrapper API for setting overlay
  function setOverlayMessage(repoName: string, content: ReactNode) {
    _setOverlay({ repoName, content });
  }

  function clearOverlay() {
    _setOverlay(null);
  }

  return (
    <UIContext.Provider
      value={{
        hoveredRepo,
        setHoveredRepo,

        hoverPos,
        setHoverPos,

        overlay,
        setOverlayMessage,

        overlayPos,
        setOverlayPos,

        scrolling,
        setScrolling,

        clearOverlay
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

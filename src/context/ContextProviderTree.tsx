"use client";

import { RepoProvider } from "./RepoContext";
import { UIProvider } from "./UIContext";
import { Repo } from "@/lib/types";

interface ContextProviderTreeProps {
  repos: Repo[];
  children: React.ReactNode;
}

/**
 * Wraps the application in all global context providers.
 * Order matters: Repo context initializes first, then UI context.
 */
export function ContextProviderTree({ repos, children }: ContextProviderTreeProps) {
  return (
    <RepoProvider repos={repos}>
      <UIProvider>
        {children}
      </UIProvider>
    </RepoProvider>
  );
}

export default ContextProviderTree;

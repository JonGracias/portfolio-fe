"use client";

import { RepoProvider } from "./RepoContext";
import { UIProvider } from "./UIContext";
import { LanguageIconProvider } from "./LanguageIconContext";
import { StarProvider } from "./StarContext";
import { AuthProvider } from "./AuthProvider";
import { Repo } from "@/lib/repos";
import { useEffect } from "react";

interface ContextProviderTreeProps {
  children: React.ReactNode;
  repos: Repo[];
}

/**
 * Global context provider order:
 * 1. RepoProvider – loads repos, extracts languages, star data, filters, etc.
 * 2. UIProvider – manages global UI state (hover, message shell, scrolling).
 * 3. LanguageIconProvider – uses RepoContext to load icons for languages.
*/
export default function ContextProviderTree({ children, repos }: ContextProviderTreeProps) {

  return (
    <AuthProvider>  
      <RepoProvider initialRepos={repos}>
        <UIProvider>
          <LanguageIconProvider>
            <StarProvider>
              {children}
            </StarProvider>
          </LanguageIconProvider>
        </UIProvider>
      </RepoProvider>
    </AuthProvider>
  );
}

// src/app/page.tsx

import ContextProviderTree from "@/context/ContextProviderTree";
import RepoList from "@/components/RepoList";
import { fetchRepos } from "@/lib/github";
import { Repo } from "@/lib/types";

export default async function Page() {
  const repos: Repo[] = await fetchRepos();

  return (
    <main className="relative flex flex-col min-h-screen overflow-hidden">
      {/* Global App Providers */}
      <ContextProviderTree repos={repos}>
        
        {/* Header / Intro */}
        <section
          aria-labelledby="portfolio-heading"
          className="
            flex flex-col w-full max-w-[1000px] mx-auto
            p-4 py-8 sm:py-10
            gap-4 md:gap-2
            items-center text-center
          "
        >
          <h1
            id="portfolio-heading"
            className="text-4xl font-extrabold text-blue-500 drop-shadow-sm mb-3"
          >
            Jonathan Gracias – Portfolio
          </h1>

          <p className="max-w-2xl text-gray-300 md:text-left">
            A collection of my projects spanning backend automation, web development,
            and creative technology. Built with Next.js and deployed on Azure.
          </p>
        </section>

        {/* Repo Grid */}
        <section
          aria-label="Repository List"
          className="
            flex flex-col items-center justify-center w-full mx-auto 
            max-w-[70vw]
            overflow-hidden">
          <RepoList />
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 mt-10 sm:py-2">
          © {new Date().getFullYear()} Jonathan Gracias — Built with Next.js + Tailwind + Azure
        </footer>
      </ContextProviderTree>
    </main>
  );
}

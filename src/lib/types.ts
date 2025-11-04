// src/lib/types.ts
export type Repo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  owner: string;
};

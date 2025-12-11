import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;
  try {
      const res = await fetch(
    `https://api.github.com/users/${user}/repos?per_page=100&sort=updated`,
        {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
        }
    );

    if (!res.ok) {
      console.error("GitHub repo error:", res.status);
      return NextResponse.json({ authed: false, repos: [] }, { status: res.status });
    }

    
    const repos = await res.json();
    return NextResponse.json(repos);
  } catch (err: any) {
    console.error("GitHub API error:", err);
    return NextResponse.json(
      { authed: false, repos: [], error: err.message || "Network error" },
      { status: 500 }
    );
  }
}
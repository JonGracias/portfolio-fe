export async function fetchRepos() {
  const user = process.env.GITHUB_USERNAME!;
  const token = process.env.GITHUB_TOKEN;

  const res = await fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=updated`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${text}`);
  }
  return res.json();
}

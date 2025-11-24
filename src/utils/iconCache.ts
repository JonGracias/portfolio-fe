export const iconCache = new Map<string, string>();

export async function loadIcon(url: string): Promise<string> {
  if (iconCache.has(url)) return iconCache.get(url)!;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load icon");

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  iconCache.set(url, objectUrl);
  return objectUrl;
}

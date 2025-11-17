import { useState } from "react";

interface Props {
  lang: string;
  className?: string;
}

export default function LanguageIcon({ lang, className }: Props) {
  const lower = lang.toLowerCase();
  const truncated = lower.split(/[^a-z0-9]/)[0];

  const [src, setSrc] = useState(
    `https://cdn.simpleicons.org/${lower}`
  );

  return (
    <img
      src={src}
      onError={() => {
        // first fallback → truncated
        if (src.includes(lower)) {
          setSrc(`https://cdn.simpleicons.org/${truncated}`);
        } else {
          // second fallback → hide icon
          setSrc("");
        }
      }}
      className={className}
      alt={lang}
      draggable={false}
    />
  );
}

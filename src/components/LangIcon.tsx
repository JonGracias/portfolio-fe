"use client";

import { useLanguageIcons } from "@/context/LanguageIconContext";

interface LangIconProps {
  lang: string;
  percentText: string;
  size?: number;       // optional – grid can pass bigger icons if needed
}

export default function LangIcon({
  lang,
  percentText,
}: LangIconProps) {
  const { getIcon } = useLanguageIcons();
  const iconUrl = getIcon(lang);

  return (
    <div className="relative flex items-center justify-center">
      {/* Logo */}
      <div className="
          w-12 h-12 flex items-center justify-center
          rounded-lg
          bg-icon
          backdrop-blur-sm
          pointer-events-none">
        {iconUrl ? (
        <img src={iconUrl}  className="w-10 h-10"/>
        ) : (
        // Text Fallback
        <div className="text-[10px] text-red-700 font-bold">{lang}</div>         
        )}
      </div>
      
      {/* Percentage */}
      <div className="absolute top-10 left-6 w-10 h-10 flex items-center justify-center">
          <span className="relative text-[12px] font-bold text-white">
          {percentText}
          </span>
      </div>
    </div>
  );
}

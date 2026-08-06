"use client";

import { Play } from "lucide-react";

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.consistencygridwallpaper";

export function PlayBadge({ size = "lg", className = "" }) {
  const isLg = size === "lg";
  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Get it on Google Play"
      className={`group inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-b from-[oklch(0.22_0.005_275)] to-[oklch(0.13_0.005_275)] shadow-[0_10px_40px_-10px_oklch(0.72_0.19_45/40%)] transition-all hover:brightness-110 hover:shadow-[0_10px_50px_-6px_oklch(0.72_0.19_45/70%)] ${
        isLg ? "px-5 py-3" : "px-4 py-2"
      } ${className}`}
    >
      <div
        className={`grid ${
          isLg ? "h-10 w-10" : "h-7 w-7"
        } place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 font-bold shadow-inner`}
      >
        <Play className={isLg ? "h-5 w-5 fill-current" : "h-3.5 w-3.5 fill-current"} />
      </div>
      <div className="text-left leading-tight">
        <div className={`${isLg ? "text-[10px]" : "text-[9px]"} uppercase tracking-[0.15em] text-white/60`}>
          GET IT ON
        </div>
        <div className={`${isLg ? "text-lg" : "text-sm"} font-semibold text-white`}>
          Google Play
        </div>
      </div>
    </a>
  );
}

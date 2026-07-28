"use client";

import { useState } from "react";

export const themes = {
  amoled: {
    bg: "bg-black",
    past: "bg-[oklch(0.72_0.19_45)] shadow-[0_0_6px_oklch(0.72_0.19_45/60%)]",
    current: "bg-[oklch(0.83_0.16_82)] shadow-[0_0_10px_oklch(0.83_0.16_82/80%)]",
    text: "text-white",
    accent: "text-[oklch(0.83_0.16_82)]",
    label: "AMOLED Pitch Black",
  },
  sunrise: {
    bg: "bg-gradient-to-b from-[#3a1a0a] via-[#7a2a10] to-[#1a0a05]",
    past: "bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.7)]",
    current: "bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.9)]",
    text: "text-orange-50",
    accent: "text-amber-300",
    label: "Warm Sunrise",
  },
  slate: {
    bg: "bg-gradient-to-b from-slate-900 to-slate-950",
    past: "bg-slate-300 shadow-[0_0_4px_rgba(203,213,225,0.4)]",
    current: "bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]",
    text: "text-slate-100",
    accent: "text-slate-200",
    label: "Minimal Slate",
  },
  cyber: {
    bg: "bg-gradient-to-br from-[#0a0a2a] via-[#1a0a3a] to-[#0a1a2a]",
    past: "bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,0.8)]",
    current: "bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]",
    text: "text-cyan-50",
    accent: "text-cyan-300",
    label: "Cyber Neon",
  },
};

export function PhoneScreen({ theme = "amoled" }) {
  const t = themes[theme] || themes.amoled;
  return (
    <div className={`relative overflow-hidden rounded-[2.3rem] p-5 pt-14 ${t.bg}`}>
      <div className="text-center">
        <div className={`text-5xl font-extralight tracking-tight ${t.text}`}>07:30</div>
        <div className={`mt-1 text-[11px] uppercase tracking-widest opacity-60 ${t.text}`}>
          Tuesday, July 28
        </div>
      </div>
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-sm">
        <div className="mb-2 flex items-baseline justify-between">
          <span className={`text-[10px] font-semibold uppercase tracking-wider opacity-70 ${t.text}`}>
            Week 1,512 / 4,160
          </span>
          <span className={`text-[10px] font-bold ${t.accent}`}>36.3%</span>
        </div>
        <div className="grid grid-cols-10 gap-1.5">
          {Array.from({ length: 90 }).map((_, i) => {
            const isPast = i < 33;
            const isCurrent = i === 33;
            return (
              <div
                key={i}
                className={`aspect-square rounded-[3px] ${
                  isCurrent
                    ? `${t.current} animate-grid-pulse`
                    : isPast
                    ? t.past
                    : "bg-white/10"
                }`}
              />
            );
          })}
        </div>
        <div className={`mt-2 text-[9px] opacity-40 ${t.text}`}>Life journey elapsed</div>
      </div>
      <div className="mt-3 space-y-1.5">
        {[
          { label: "Morning Gym", done: true },
          { label: "Read 20 Pages", done: true },
          { label: "Code 2 Hours", done: false },
        ].map((h) => (
          <div
            key={h.label}
            className={`flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-sm ${t.text}`}
          >
            <span className="text-[11px] opacity-90">{h.label}</span>
            <span className="text-sm">{h.done ? "✅" : "⭕"}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <div className="h-1 w-24 rounded-full bg-white/20" />
      </div>
    </div>
  );
}

export function PhoneFrame({ children }) {
  return (
    <div className="relative w-[320px] rounded-[3rem] border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-3 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
      <div className="absolute left-1/2 top-4 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
      {children}
    </div>
  );
}

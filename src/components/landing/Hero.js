"use client";

import { PlayBadge } from "./PlayBadge";
import { ArrowDown, Star } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-8 sm:pt-24">
      {/* Dual Layer Ambient Orange & Gold Spotlight Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[400px] rounded-full bg-gradient-to-b from-orange-500/35 via-amber-500/20 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 -z-10 w-[400px] h-[200px] rounded-full bg-orange-500/20 blur-[90px] pointer-events-none" />

      <div className="flex flex-col items-center text-center relative z-10">
        <div className="animate-pulse-glow inline-flex items-center gap-2.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-xl shadow-[0_0_20px_-4px_rgba(52,211,153,0.3)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span>🚀 Live on Google Play Store</span>
        </div>

        <h1 className="mt-8 max-w-5xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-[5.25rem] text-white">
          Your Life in{" "}
          <span className="text-gradient-brand relative inline-block">
            Weeks
            <span className="absolute inset-0 -z-10 blur-3xl opacity-80 [background:var(--gradient-brand)]" />
          </span>{" "}
          — Live on Your Android Screen.
        </h1>

        <p className="mt-6 max-w-2xl text-base sm:text-xl text-slate-300 leading-relaxed font-normal drop-shadow-sm">
          Transform your daily perspective with an auto-updating live wallpaper. Renders your
          life momentum grid, daily habits, and priority goals every morning.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <PlayBadge />
          <Link
            href="/features"
            className="h-14 inline-flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-6 text-base font-semibold text-slate-100 backdrop-blur-xl transition-all shadow-lg hover:border-orange-500/40"
          >
            <span>Explore Themes &amp; Features</span>
            <ArrowDown className="h-4 w-4 text-orange-400 animate-bounce" />
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm">
          <div className="glass-pill flex items-center gap-1.5 rounded-full px-4 py-1.5 text-slate-200">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-white">4.9</span>
            <span className="text-slate-400">rating</span>
          </div>
          {[
            { icon: "⚡", label: "0% Battery Drain" },
            { icon: "🔒", label: "100% Offline & Private" },
          ].map((p) => (
            <div key={p.label} className="glass-pill rounded-full px-4 py-1.5 text-slate-300">
              <span className="mr-1.5">{p.icon}</span>
              {p.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { PhoneFrame, PhoneScreen, themes } from "@/components/landing/PhoneScreen";

const themeInfo = [
  { key: "amoled", blurb: "Battery-saving pitch black. True zero-pixel darkness on OLED displays." },
  { key: "sunrise", blurb: "Warm energizing gradient. Wake up to daily momentum." },
  { key: "slate", blurb: "Clean monochrome for focused professionals." },
  { key: "cyber", blurb: "Vibrant neon grid for futurists and night owls." },
];

export default function GalleryPage() {
  const [active, setActive] = useState("amoled");

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white">
      <Nav />
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-20 pb-8 text-center">
        <div className="inline-flex rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs uppercase tracking-widest text-slate-400 backdrop-blur">
          Themes &amp; Gallery
        </div>
        <h1 className="mt-5 text-balance text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
          Four <span className="text-gradient-brand">crafted looks.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-slate-400">
          Every theme is hand-tuned for OLED, readability, and mood. Tap a card to preview it
          on the phone.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto]">
          <div className="grid gap-4 sm:grid-cols-2">
            {themeInfo.map((t) => {
              const isActive = active === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  className={`glass-card group relative overflow-hidden rounded-3xl p-6 text-left transition-all ${
                    isActive
                      ? "border-orange-500/50 shadow-[0_0_40px_-8px_oklch(0.72_0.19_45/50%)]"
                      : "hover:border-orange-500/30"
                  }`}
                >
                  <div
                    className={`mb-4 h-24 w-full rounded-2xl ${themes[t.key]?.bg || "bg-black"} ring-1 ring-white/10`}
                  />
                  <div className="text-xs font-mono uppercase tracking-widest text-orange-400">
                    {isActive ? "Now previewing" : "Tap to preview"}
                  </div>
                  <h3 className="mt-1 text-xl font-semibold text-white">{themes[t.key]?.label || t.key}</h3>
                  <p className="mt-2 text-sm text-slate-400">{t.blurb}</p>
                </button>
              );
            })}
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="sticky top-24 animate-float">
              <div className="absolute -inset-10 -z-10 rounded-full blur-3xl [background:radial-gradient(ellipse,oklch(0.72_0.19_45/25%),transparent_60%)]" />
              <PhoneFrame>
                <PhoneScreen theme={active} />
              </PhoneFrame>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

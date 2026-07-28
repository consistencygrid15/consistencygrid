"use client";

import { useState } from "react";
import { PhoneFrame, PhoneScreen, themes } from "./PhoneScreen";

const options = [
  { key: "amoled", label: "AMOLED", swatch: "bg-black" },
  { key: "sunrise", label: "Sunrise", swatch: "bg-gradient-to-br from-orange-500 to-amber-300" },
  { key: "slate", label: "Slate", swatch: "bg-slate-500" },
  { key: "cyber", label: "Cyber", swatch: "bg-gradient-to-br from-fuchsia-500 to-cyan-400" },
];

export function InteractivePhone() {
  const [theme, setTheme] = useState("amoled");
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-16">
      <div className="mx-auto flex flex-col items-center gap-8">
        <div className="animate-float relative">
          <div className="absolute -inset-10 -z-10 rounded-full blur-3xl [background:radial-gradient(ellipse,oklch(0.72_0.19_45/35%),transparent_60%)]" />
          <PhoneFrame>
            <PhoneScreen theme={theme} />
          </PhoneFrame>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs uppercase tracking-widest text-slate-400">
            Try a theme — {themes[theme]?.label || "AMOLED"}
          </div>
          <div className="glass-card flex gap-1 rounded-full p-1 border border-slate-800">
            {options.map((o) => (
              <button
                key={o.key}
                onClick={() => setTheme(o.key)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  theme === o.key
                    ? "bg-white/10 text-white shadow-inner"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span className={`h-3.5 w-3.5 rounded-full ring-1 ring-white/20 ${o.swatch}`} />
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

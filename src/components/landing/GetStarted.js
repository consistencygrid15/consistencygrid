"use client";

import { Download, Settings, Smartphone } from "lucide-react";

const steps = [
  { n: "01", icon: Download, title: "Install from Play Store", body: "One tap. Free & battery-safe. Under 8 MB." },
  { n: "02", icon: Settings, title: "Configure Birth Date & Theme", body: "Set your grid horizon and pick your favorite palette." },
  { n: "03", icon: Smartphone, title: "Apply Live Wallpaper", body: "Set as wallpaper. Auto-updates at every midnight." },
];

export function GetStarted() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
          Ready in <span className="text-gradient-brand">three steps.</span>
        </h2>
        <p className="mt-4 text-slate-400">
          Sixty seconds from Play Store install to a lockscreen that finally matters.
        </p>
      </div>
      <div className="relative mt-14 grid gap-4 md:grid-cols-3">
        <div className="pointer-events-none absolute left-0 right-0 top-16 hidden h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent md:block" />
        {steps.map((s) => (
          <div key={s.n} className="glass-card relative rounded-3xl p-6 text-center">
            <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-slate-950 shadow-[0_0_30px_-6px_oklch(0.72_0.19_45/60%)]">
              <s.icon className="h-6 w-6" />
            </div>
            <div className="mt-4 font-mono text-xs uppercase tracking-widest text-orange-400">Step {s.n}</div>
            <h3 className="mt-2 text-xl font-semibold text-white">{s.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

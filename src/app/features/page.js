"use client";

import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { BentoFeatures } from "@/components/landing/BentoFeatures";
import { Check, X } from "lucide-react";

const rows = [
  { label: "Idle battery drain", us: "0%", them: "3–8%" },
  { label: "Works fully offline", us: true, them: false },
  { label: "Background ads", us: false, them: true },
  { label: "Midnight auto-refresh", us: true, them: false },
  { label: "Native WorkManager engine", us: true, them: false },
  { label: "AMOLED-first themes", us: true, them: false },
  { label: "Habit + goal overlay", us: true, them: false },
];

function Cell({ v }) {
  if (typeof v === "string") return <span className="font-semibold text-white">{v}</span>;
  return v ? (
    <Check className="mx-auto h-5 w-5 text-emerald-400" />
  ) : (
    <X className="mx-auto h-5 w-5 text-slate-500" />
  );
}

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white">
      <Nav />
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-20 pb-8 text-center">
        <div className="inline-flex rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs uppercase tracking-widest text-slate-400 backdrop-blur">
          Features &amp; Technology
        </div>
        <h1 className="mt-5 text-balance text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
          Built on the <span className="text-gradient-brand">Android platform.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-slate-400">
          A native rendering engine that treats your battery, your privacy, and your time
          with the respect they deserve.
        </p>
      </section>

      <BentoFeatures />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            ConsistencyGrid vs{" "}
            <span className="text-slate-500">standard wallpaper apps</span>
          </h2>
        </div>
        <div className="glass-card mt-10 overflow-hidden rounded-3xl">
          <div className="grid grid-cols-3 border-b border-slate-800/80 bg-slate-950/60 px-6 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <span>Capability</span>
            <span className="text-center text-gradient-brand">ConsistencyGrid</span>
            <span className="text-center">Others</span>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.label}
              className={`grid grid-cols-3 items-center px-6 py-4 text-sm ${
                i % 2 ? "bg-white/[0.02]" : ""
              }`}
            >
              <span className="text-slate-200">{r.label}</span>
              <span className="text-center"><Cell v={r.us} /></span>
              <span className="text-center text-slate-400"><Cell v={r.them} /></span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
        <div className="glass-card rounded-3xl p-8 sm:p-10">
          <div className="inline-flex rounded-full border border-orange-500/30 bg-orange-500/5 px-3 py-1 text-xs uppercase tracking-widest text-orange-400">
            Under the hood
          </div>
          <h3 className="mt-4 text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Midnight WorkManager pipeline
          </h3>
          <p className="mt-3 text-slate-400 leading-relaxed">
            At 00:00 device time, an OS-scheduled task computes today&apos;s grid, composites the
            wallpaper on-device, and hands the new bitmap to Android&apos;s wallpaper service.
            No wake-locks. No polling. No cloud round-trips.
          </p>
          <ol className="mt-6 space-y-3 text-sm">
            {[
              "OS schedules the daily task through WorkManager — battery-safe by design.",
              "Grid state recomputes locally against your birth date and habit log.",
              "A single bitmap is composited on-device using Android Canvas APIs.",
              "The wallpaper service swaps the frame silently — you wake up to it.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 text-xs font-bold text-slate-950">
                  {i + 1}
                </span>
                <span className="text-slate-200">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <Footer />
    </main>
  );
}

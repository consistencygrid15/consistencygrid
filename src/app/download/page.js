"use client";

import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { QRDownload } from "@/components/landing/QRDownload";
import { PlayBadge } from "@/components/landing/PlayBadge";
import { Download, Settings, Smartphone } from "lucide-react";

const steps = [
  { n: "01", icon: Download, title: "Install from Play Store", body: "Tap the badge or scan the QR code. Free and under 8 MB." },
  { n: "02", icon: Settings, title: "Set Birth Date & Theme", body: "Tell the grid where to start. Pick your favorite palette." },
  { n: "03", icon: Smartphone, title: "Apply Live Wallpaper", body: "Set as wallpaper — auto-updates at every midnight." },
];

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white">
      <Nav />
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-20 pb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/5 px-3 py-1 text-xs uppercase tracking-widest text-emerald-300 backdrop-blur">
          Live on Google Play
        </div>
        <h1 className="mt-5 text-balance text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
          Install in <span className="text-gradient-brand">under a minute.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-slate-400">
          Get ConsistencyGrid from the Google Play Store — free, private, and battery-safe.
        </p>
        <div className="mt-8 flex justify-center">
          <PlayBadge />
        </div>
      </section>

      <QRDownload />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <div className="relative grid gap-4 md:grid-cols-3">
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
      <Footer />
    </main>
  );
}

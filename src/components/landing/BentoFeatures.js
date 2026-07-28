"use client";

import { Clock, TrendingUp, ListChecks, Palette, Battery, ShieldCheck } from "lucide-react";

function Card({ children, className = "" }) {
  return (
    <div
      className={`glass-card group relative overflow-hidden rounded-3xl p-6 border border-white/10 transition-all hover:border-orange-500/50 hover:shadow-[0_20px_50px_-15px_rgba(249,115,22,0.2)] ${className}`}
    >
      <div className="pointer-events-none absolute -inset-px opacity-0 transition-opacity group-hover:opacity-100 [background:radial-gradient(400px_circle_at_var(--x,50%)_var(--y,50%),rgba(249,115,22,0.15),transparent)]" />
      {children}
    </div>
  );
}

function IconWrap({ children }) {
  return (
    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/25 to-amber-400/15 text-orange-400 ring-1 ring-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
      {children}
    </div>
  );
}

function Title({ children }) {
  return <h3 className="text-xl font-bold text-white tracking-tight">{children}</h3>;
}

function Body({ children }) {
  return <p className="mt-2 text-sm leading-relaxed text-slate-400">{children}</p>;
}

export function BentoFeatures() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 relative">
      <div className="absolute top-1/3 right-10 -z-10 w-[500px] h-[300px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />

      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-orange-400 backdrop-blur">
          Features
        </div>
        <h2 className="mt-5 text-balance text-3xl sm:text-5xl font-bold tracking-tight text-white">
          Built for people who actually{" "}
          <span className="text-gradient-brand">show up.</span>
        </h2>
        <p className="mt-4 text-slate-400">
          Every pixel engineered for consistency. No cloud lock-in. No battery tax.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Card 1 — Large */}
        <Card className="md:col-span-2">
          <IconWrap>
            <Clock className="h-5 w-5" />
          </IconWrap>
          <Title>Midnight Auto-Update Engine</Title>
          <Body>
            At 00:00 sharp, WorkManager triggers a silent refresh — new grid, fresh streaks,
            zero user input. Wake up to a wallpaper that already knows.
          </Body>
          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4 backdrop-blur">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-orange-500/40 bg-orange-500/15 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
              <span className="text-xl font-black text-orange-400">00:00</span>
              <span className="animate-pulse-glow absolute inset-0 rounded-full" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Next refresh scheduled
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2 */}
        <Card>
          <IconWrap>
            <TrendingUp className="h-5 w-5" />
          </IconWrap>
          <Title>Life Grid Momentum</Title>
          <Body>See your entire life in weeks. Elapsed. Current. Remaining.</Body>
          <div className="mt-5 space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Elapsed</span>
              <span className="font-bold text-orange-400">36.3%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[36%] rounded-full bg-gradient-to-r from-orange-500 to-amber-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
            </div>
          </div>
        </Card>

        {/* Card 3 */}
        <Card>
          <IconWrap>
            <ListChecks className="h-5 w-5" />
          </IconWrap>
          <Title>Habit &amp; Goal Overlay</Title>
          <Body>Your streaks live where your eyes already look — the lockscreen.</Body>
          <div className="mt-4 space-y-1.5">
            {["Gym ✅", "Read ✅", "Code ⭕"].map((t) => (
              <div
                key={t}
                className="rounded-xl border border-white/10 bg-slate-950/70 px-3.5 py-2 text-xs font-medium text-slate-200 backdrop-blur"
              >
                {t}
              </div>
            ))}
          </div>
        </Card>

        {/* Card 4 */}
        <Card>
          <IconWrap>
            <Palette className="h-5 w-5" />
          </IconWrap>
          <Title>AMOLED Pitch Black Themes</Title>
          <Body>Four crafted palettes. Battery-friendly. Eye-friendly.</Body>
          <div className="mt-5 flex gap-2.5">
            {[
              { name: "AMOLED", c: "bg-black ring-white/20" },
              { name: "Sunrise", c: "bg-gradient-to-br from-orange-500 to-amber-300 ring-orange-500/40" },
              { name: "Slate", c: "bg-slate-500 ring-slate-400/40" },
              { name: "Cyber", c: "bg-gradient-to-br from-fuchsia-500 to-cyan-400 ring-fuchsia-500/40" },
            ].map((s) => (
              <div
                key={s.name}
                className={`h-10 w-10 rounded-xl ring-2 shadow-md ${s.c}`}
              />
            ))}
          </div>
        </Card>

        {/* Card 5 */}
        <Card>
          <IconWrap>
            <Battery className="h-5 w-5" />
          </IconWrap>
          <Title>Zero Battery Impact</Title>
          <Body>Native WorkManager. 0% idle drain. Verified across 40+ devices.</Body>
          <div className="mt-5 flex items-end gap-1.5">
            {[10, 18, 14, 22, 8, 30, 6, 24, 4, 2].map((h, i) => (
              <div
                key={i}
                style={{ height: `${h}px` }}
                className="flex-1 rounded-sm bg-gradient-to-t from-orange-500 to-amber-400 shadow-[0_0_8px_rgba(249,115,22,0.4)]"
              />
            ))}
          </div>
        </Card>

        {/* Card 6 */}
        <Card>
          <IconWrap>
            <ShieldCheck className="h-5 w-5" />
          </IconWrap>
          <Title>Offline &amp; Private First</Title>
          <Body>
            No mandatory cloud, no telemetry. Your grid renders on-device, always.
          </Body>
        </Card>
      </div>
    </section>
  );
}

"use client";

export function PhilosophyCallout() {
  const total = 4160;
  const lived = 1512;
  const pct = ((lived / total) * 100).toFixed(1);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[600px] h-[300px] rounded-full bg-orange-500/15 blur-[120px] pointer-events-none" />

      <div className="glass-card relative overflow-hidden rounded-3xl p-8 sm:p-14 border border-white/10">
        <div className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(ellipse_at_center,rgba(249,115,22,0.15),transparent_70%)]" />
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <div className="inline-flex rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-orange-400 backdrop-blur">
              Why life in weeks?
            </div>
            <h2 className="mt-5 text-balance text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              The average life is{" "}
              <span className="text-gradient-brand font-extrabold">4,160 weeks.</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              You&apos;ve already lived more than you think. ConsistencyGrid puts that truth on
              your lockscreen — not to scare you, but to focus you.
            </p>
            <blockquote className="mt-6 border-l-2 border-orange-500 pl-4 text-sm italic text-slate-200 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
              &quot;You act like mortals in all that you fear, and like immortals in all that
              you desire.&quot; <span className="not-italic text-slate-400">— Seneca</span>
            </blockquote>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur shadow-2xl">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Weeks elapsed
              </span>
              <span className="text-2xl font-black text-gradient-brand">{pct}%</span>
            </div>
            <div className="grid grid-cols-20 gap-[3px]" style={{ gridTemplateColumns: "repeat(20,minmax(0,1fr))" }}>
              {Array.from({ length: 200 }).map((_, i) => {
                const scaled = (i / 200) * total;
                const isPast = scaled < lived;
                const isNow = Math.floor((lived / total) * 200) === i;
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-[2px] ${
                      isNow
                        ? "bg-amber-400 shadow-[0_0_12px_#fbbf24] animate-grid-pulse ring-2 ring-orange-500"
                        : isPast
                        ? "bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.6)]"
                        : "bg-white/10"
                    }`}
                  />
                );
              })}
            </div>
            <div className="mt-4 flex justify-between text-xs text-slate-400">
              <span className="font-medium text-slate-300">{lived.toLocaleString()} lived</span>
              <span className="font-medium text-slate-300">{(total - lived).toLocaleString()} remaining</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

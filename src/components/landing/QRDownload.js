"use client";

import { PlayBadge, PLAY_STORE_URL } from "./PlayBadge";

function QR() {
  const N = 25;
  const cells = [];
  for (let i = 0; i < N * N; i++) {
    const x = i % N;
    const y = Math.floor(i / N);
    const inCorner = (cx, cy) =>
      x >= cx && x < cx + 7 && y >= cy && y < cy + 7;
    const corner = inCorner(0, 0) || inCorner(N - 7, 0) || inCorner(0, N - 7);
    const cornerInner =
      (inCorner(0, 0) && !(x >= 1 && x <= 5 && y >= 1 && y <= 5)) ||
      (inCorner(N - 7, 0) && !(x >= N - 6 && x <= N - 2 && y >= 1 && y <= 5)) ||
      (inCorner(0, N - 7) && !(x >= 1 && x <= 5 && y >= N - 6 && y <= N - 2));
    const cornerDot =
      (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
      (x >= N - 5 && x <= N - 3 && y >= 2 && y <= 4) ||
      (x >= 2 && x <= 4 && y >= N - 5 && y <= N - 3);
    if (corner) {
      cells.push(cornerInner || cornerDot);
    } else {
      const h = (x * 928371 + y * 12345 + x * y * 17) % 100;
      cells.push(h < 48);
    }
  }
  return (
    <div
      className="grid rounded-2xl bg-white p-3.5"
      style={{ gridTemplateColumns: `repeat(${N}, 1fr)`, gap: 1 }}
    >
      {cells.map((on, i) => (
        <div
          key={i}
          className={`aspect-square ${on ? "bg-black" : "bg-white"}`}
        />
      ))}
    </div>
  );
}

export function QRDownload() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 relative">
      <div className="glass-card relative overflow-hidden rounded-3xl p-8 sm:p-14 border border-white/10">
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full blur-3xl [background:radial-gradient(circle,rgba(249,115,22,0.35),transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full blur-3xl [background:radial-gradient(circle,rgba(251,191,36,0.2),transparent_70%)]" />
        <div className="relative grid items-center gap-10 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-orange-400 backdrop-blur">
              Scan to install
            </div>
            <h3 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl text-white leading-tight">
              Point your camera.{" "}
              <span className="text-gradient-brand">Install in seconds.</span>
            </h3>
            <p className="mt-3 text-slate-300 leading-relaxed">
              Open your Android camera and aim at the code. It&apos;ll take you straight to the
              ConsistencyGrid listing on Google Play.
            </p>
            <div className="mt-6">
              <PlayBadge />
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="relative group">
              <div className="absolute -inset-4 -z-10 rounded-3xl blur-2xl [background:var(--gradient-brand)] opacity-40 group-hover:opacity-70 transition-opacity" />
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-64 rounded-3xl bg-white p-2.5 shadow-[0_20px_60px_-15px_rgba(249,115,22,0.4)] transition-transform hover:scale-[1.03]"
              >
                <QR />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

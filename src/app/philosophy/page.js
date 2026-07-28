"use client";

import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { PhilosophyCallout } from "@/components/landing/PhilosophyCallout";

const quotes = [
  { by: "Seneca", text: "It is not that we have a short time to live, but that we waste a lot of it." },
  { by: "Marcus Aurelius", text: "You could leave life right now. Let that determine what you do and say and think." },
  { by: "Tim Urban", text: "A human life in weeks fits on a single sheet of paper. That fact will change you." },
  { by: "Naval Ravikant", text: "The most important skill for a modern life is a sense of urgency without anxiety." },
];

export default function PhilosophyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white">
      <Nav />
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-20 pb-8 text-center">
        <div className="inline-flex rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs uppercase tracking-widest text-slate-400 backdrop-blur">
          Memento Mori · Philosophy
        </div>
        <h1 className="mt-5 text-balance text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
          Not morbid. <span className="text-gradient-brand">Motivating.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
          For 2,000 years, philosophers have said the same thing in different words: your
          time is finite, so live like it. ConsistencyGrid puts that ancient idea on your
          lockscreen.
        </p>
      </section>

      <PhilosophyCallout />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <div className="grid gap-4 md:grid-cols-2">
          {quotes.map((q) => (
            <figure key={q.by} className="glass-card rounded-3xl p-8">
              <div className="text-4xl leading-none text-orange-400">quot;</div>
              <blockquote className="mt-2 text-lg font-medium leading-relaxed text-slate-200">
                {q.text}
              </blockquote>
              <figcaption className="mt-4 text-sm uppercase tracking-widest text-slate-400">
                — {q.by}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          A wallpaper that reminds you, gently.
        </h2>
        <p className="mt-4 text-slate-400 leading-relaxed">
          Every time you unlock your phone, the grid whispers: this week counts. That&apos;s it.
          That&apos;s the whole product.
        </p>
      </section>
      <Footer />
    </main>
  );
}

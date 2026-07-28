"use client";

import { Star } from "lucide-react";

const reviews = [
  {
    name: "Arjun M.",
    tag: "Play Store review",
    text: "The midnight refresh feels like magic. First app I've kept on my lockscreen for more than a month.",
  },
  {
    name: "Priya S.",
    tag: "Play Store review",
    text: "Zero battery hit, verified in my meter. And the AMOLED theme is stunning on my Pixel.",
  },
  {
    name: "Ravi K.",
    tag: "Play Store review",
    text: "Seeing my weeks tick by every morning changed how I plan the day. Weirdly emotional.",
  },
  {
    name: "Neha D.",
    tag: "Play Store review",
    text: "Habits on the lockscreen made me finally stop skipping the gym. 87-day streak going.",
  },
  {
    name: "Sahil J.",
    tag: "Play Store review",
    text: "Clean, private, and beautifully engineered. Feels like a native Google app.",
  },
  {
    name: "Ananya R.",
    tag: "Play Store review",
    text: "Cyber Neon theme is gorgeous. Compliments every time I show my phone.",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs uppercase tracking-widest text-slate-400 backdrop-blur">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
          4.9 on Google Play
        </div>
        <h2 className="mt-5 text-balance text-3xl sm:text-5xl font-bold tracking-tight text-white">
          Loved by people who <span className="text-gradient-brand">show up daily.</span>
        </h2>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <div key={r.name} className="glass-card rounded-2xl p-6">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">&quot;{r.text}&quot;</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-orange-500/40 to-amber-400/40 text-xs font-semibold text-white">
                {r.name.charAt(0)}
              </div>
              <div className="text-xs">
                <div className="font-semibold text-white">{r.name}</div>
                <div className="text-slate-400">{r.tag}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

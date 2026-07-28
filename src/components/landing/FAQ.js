"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "Does the live wallpaper drain my battery?", a: "No. ConsistencyGrid uses Android's native WorkManager and renders a static image once per day at midnight. Idle drain is 0%." },
  { q: "How do I install the app safely?", a: "ConsistencyGrid is available directly on the official Google Play Store. Tap any 'Get it on Google Play' button on this site to install." },
  { q: "Can I use it fully offline?", a: "Yes. Grid rendering, habits, and midnight refresh all run on-device. Internet access is only needed if you optionally sync cloud features." },
  { q: "Does the web dashboard sync with the app?", a: "If you sign in, goals and habits sync both ways seamlessly. If signed out, everything remains 100% local on your phone." },
  { q: "Which Android versions are supported?", a: "Android 7.0 and above. Fully optimized for AMOLED displays, foldable devices, and modern tablets." },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 py-20">
      <div className="text-center">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
          Questions? <span className="text-gradient-brand">Answered.</span>
        </h2>
      </div>
      <div className="glass-card mt-10 rounded-3xl p-4 sm:p-6 space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="border-b border-slate-800/60 pb-3 last:border-0 last:pb-0">
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between text-left text-base font-medium text-slate-200 hover:text-white transition-colors py-2"
            >
              <span>{f.q}</span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform ${
                  openIndex === i ? "rotate-180 text-orange-400" : ""
                }`}
              />
            </button>
            {openIndex === i && (
              <p className="mt-2 text-sm text-slate-400 leading-relaxed pr-4">
                {f.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

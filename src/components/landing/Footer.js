"use client";

import Link from "next/link";
import { PlayBadge } from "./PlayBadge";

export function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <div className="glass-card rounded-3xl p-8 sm:p-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/logo.png"
                alt="ConsistencyGrid Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="font-bold text-base tracking-tight text-white">ConsistencyGrid</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-slate-400 leading-relaxed">
              Your life in weeks — quietly rendered on your lockscreen, every morning.
            </p>
            <div className="mt-5">
              <PlayBadge size="sm" />
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Product
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/features" className="hover:text-white text-slate-400 transition-colors">Features</Link></li>
              <li><Link href="/gallery" className="hover:text-white text-slate-400 transition-colors">Themes</Link></li>
              <li><Link href="/download" className="hover:text-white text-slate-400 transition-colors">Download</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Company
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/philosophy" className="hover:text-white text-slate-400 transition-colors">Philosophy</Link></li>
              <li><Link href="/privacy" className="hover:text-white text-slate-400 transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-white text-slate-400 transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800/80 pt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} ConsistencyGrid. Crafted for consistency.
        </div>
      </div>
    </footer>
  );
}

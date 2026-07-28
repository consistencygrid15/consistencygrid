"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlayBadge } from "./PlayBadge";

const links = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/gallery", label: "Themes" },
  { href: "/philosophy", label: "Philosophy" },
  { href: "/download", label: "Download" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/images/logo.png"
            alt="ConsistencyGrid Logo"
            className="h-8 w-8 object-contain transition-transform group-hover:scale-105"
          />
          <span className="text-base font-bold tracking-tight text-white group-hover:text-orange-400 transition-colors">
            ConsistencyGrid
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3.5 py-1.5 text-sm transition-all ${
                  isActive
                    ? "text-white bg-white/10 font-semibold shadow-inner"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <PlayBadge size="sm" />
      </div>
    </header>
  );
}

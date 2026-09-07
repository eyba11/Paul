"use client";

import { useCoach } from "@/lib/store";
import { usePathname } from "next/navigation";
import Link from "next/link";

const nav = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/plan", label: "Plan", icon: "☰" },
  { href: "/log", label: "Log", icon: "✓" },
  { href: "/track", label: "Track", icon: "◉" },
  { href: "/coach", label: "Coach", icon: "✦" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hydrated } = useCoach();
  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg pb-24">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-ink-950/90 px-4 py-3 backdrop-blur">
        <div>
          <p className="font-display text-[11px] uppercase tracking-[0.28em] text-volt">
            Paul&apos;s Hybrid Coach
          </p>
          <p className="text-xs text-mist">Strength · running · recovery</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/settings" className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-foam">
            Settings
          </Link>
          <Link
            href="/workouts"
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-foam"
          >
            Library
          </Link>
        </div>
      </header>
      <main className="px-4 py-4">
        {hydrated ? children : <p className="py-16 text-center text-mist">Loading coach…</p>}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-ink-900/95 backdrop-blur">
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 py-3 text-[11px] ${
                    active ? "text-volt" : "text-mist"
                  }`}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

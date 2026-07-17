"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, LogOut, Settings, Menu, X } from "lucide-react";
import { useApp } from "@/lib/store/provider";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const NAV = [
  { href: "/dashboard", label: "Lists", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/85 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2" aria-label="AislePilot home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                    active ? "bg-brand-50 text-brand-800" : "text-ink-soft hover:bg-black/5",
                  )}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => {
                signOut();
                router.push("/");
              }}
              className="ml-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-black/5"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </nav>
          <button
            className="rounded-lg p-2 text-ink-soft hover:bg-black/5 sm:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {open && (
          <nav className="border-t border-black/5 px-4 py-2 sm:hidden" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-black/5"
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                signOut();
                router.push("/");
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-black/5"
            >
              <LogOut size={16} />
              Sign out
            </button>
            {profile && (
              <p className="px-3 py-2 text-xs text-ink-muted">Signed in as {profile.email}</p>
            )}
          </nav>
        )}
      </header>
      <main className="px-4 py-5 sm:py-7">{children}</main>
    </div>
  );
}

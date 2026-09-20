import Link from "next/link";
import { Big_Shoulders_Display, Figtree, IBM_Plex_Mono } from "next/font/google";
import {
  ArrowRight,
  ListChecks,
  MapPin,
  Wallet,
  ScanBarcode,
  Users,
  WifiOff,
} from "lucide-react";
import { Logo } from "@/components/app/Logo";
import { Button } from "@/components/ui";
import { LandingPreview } from "@/components/marketing/LandingPreview";
import { Barcode } from "@/components/marketing/Barcode";
import { cn } from "@/lib/utils";

// This page intentionally runs its own type/color system (a grocery-receipt
// and aisle-signage motif) instead of the shared design tokens in
// packages/design-tokens — the signed-in app keeps the standard system;
// only the marketing page's look differs. Colors are CSS custom properties
// on the page wrapper below so the rest of the app is untouched.
const display = Big_Shoulders_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-display",
});
const body = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
});

const FEATURES = [
  { icon: ListChecks, title: "Match your list to real products", body: "Type “milk” and pick the exact product, brand, and size — with the store’s current price." },
  { icon: MapPin, title: "Shop by store route", body: "Items sort by department and aisle so you walk the store once, not five times." },
  { icon: Wallet, title: "Know your total before checkout", body: "Live estimated, collected, and remaining totals — plus a budget you can actually keep." },
  { icon: Users, title: "Share the trip", body: "Invite family, split the list, and see who grabbed what in real time." },
  { icon: WifiOff, title: "Works offline", body: "Keep shopping when the signal drops. Changes sync when you’re back." },
  { icon: ScanBarcode, title: "Barcode-ready", body: "Scan-to-add foundation built in for fast, accurate item entry." },
];

const STEPS = [
  { n: "1", title: "Build your list", body: "Add items fast — one at a time or paste a whole list." },
  { n: "2", title: "Pick your store", body: "Choose a Kroger-family store to get its prices and layout." },
  { n: "3", title: "Match products", body: "Confirm the exact product for each item." },
  { n: "4", title: "Shop the route", body: "Enter Shopping Mode and check items off as you go." },
];

function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-center font-[family-name:var(--font-mono)] text-xs font-medium uppercase tracking-[0.3em] text-[color:var(--ink-soft)]">
      · {children} ·
    </p>
  );
}

export default function LandingPage() {
  return (
    <div
      className={cn(
        display.variable,
        body.variable,
        mono.variable,
        "min-h-screen bg-[color:var(--paper)] font-[family-name:var(--font-body)] text-[color:var(--ink)]",
      )}
      style={
        {
          "--paper": "#FBF7EF",
          "--ink": "#201D17",
          "--ink-soft": "#6B6355",
          "--ink-faint": "#8A8374",
          "--tag-yellow-soft": "rgba(234,166,39,0.22)",
          "--tag-yellow-ink": "#7A5310",
          "--route-rust": "#C1481E",
        } as React.CSSProperties
      }
    >
      <div className="mx-auto w-full max-w-6xl px-4">
        <header className="flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="grid items-center gap-12 py-10 sm:py-16 lg:grid-cols-2">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-xs font-medium uppercase tracking-[0.3em] text-[color:var(--ink-soft)]">
              · Mobile-first shopping assistant ·
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-6xl font-black uppercase leading-[0.95] tracking-tight text-[color:var(--ink)] sm:text-7xl">
              Your list.
              <br />
              Your route.
              <br />
              Your total.
            </h1>
            <p className="mt-6 max-w-md text-lg text-[color:var(--ink-soft)]">
              AislePilot turns a scribbled grocery list into an exact, priced, aisle-by-aisle
              shopping plan for your Kroger-family store — so you spend less time wandering and
              never blow the budget.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/sign-up">
                <Button size="lg">
                  Start your first list <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline">Sign in</Button>
              </Link>
            </div>
            <p className="mt-4 font-[family-name:var(--font-mono)] text-xs tracking-wide text-[color:var(--ink-soft)]">
              No credit card required · Live prices from your Kroger-family store
            </p>
          </div>
          <LandingPreview />
        </section>

        {/* Features */}
        <section className="py-16">
          <SectionKicker>What&apos;s inside</SectionKicker>
          <h2 className="mt-2 text-center font-[family-name:var(--font-display)] text-3xl font-black uppercase tracking-tight text-[color:var(--ink)] sm:text-4xl">
            Everything you need for one clean trip
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-black/5 bg-white p-5 shadow-card">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <f.icon size={20} />
                </div>
                <h3 className="font-semibold text-[color:var(--ink)]">{f.title}</h3>
                <p className="mt-1 text-sm text-[color:var(--ink-soft)]">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="py-16">
          <SectionKicker>The route</SectionKicker>
          <h2 className="mt-2 text-center font-[family-name:var(--font-display)] text-3xl font-black uppercase tracking-tight text-[color:var(--ink)] sm:text-4xl">
            How it works
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl bg-white p-5 shadow-card">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--route-rust)] font-[family-name:var(--font-mono)] font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mt-3 font-semibold text-[color:var(--ink)]">{s.title}</h3>
                <p className="mt-1 text-sm text-[color:var(--ink-soft)]">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="my-12 overflow-hidden rounded-3xl bg-brand-600 px-6 py-14 text-center text-white sm:px-12">
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-black uppercase tracking-tight">
            Ready for a calmer grocery run?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-50">
            Build a list in under a minute and see your whole trip — priced, routed, and ready.
          </p>
          <div className="mt-7 flex justify-center">
            <Link href="/sign-up">
              <Button size="lg" variant="secondary">
                Get started free <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </section>

        <footer className="border-t border-dashed border-black/15 py-8 text-center">
          <Barcode className="mx-auto text-[color:var(--ink-soft)]" barHeight={20} />
          <p className="mt-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[color:var(--ink-soft)]">
            AislePilot — not affiliated with The Kroger Co.
          </p>
          <p className="mt-1 text-xs text-[color:var(--ink-faint)]">
            Prices and availability are provided by Kroger and may vary.
          </p>
        </footer>
      </div>
    </div>
  );
}

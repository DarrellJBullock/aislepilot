import Link from "next/link";
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
import { Button, Badge } from "@/components/ui";
import { LandingPreview } from "@/components/marketing/LandingPreview";

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

export default function LandingPage() {
  return (
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
      <section className="grid items-center gap-10 py-10 sm:py-16 lg:grid-cols-2">
        <div>
          <Badge tone="brand" className="mb-4">Mobile-first shopping assistant</Badge>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
            Your list. Your route. Your total.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
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
              <Button size="lg" variant="outline">Try the demo</Button>
            </Link>
          </div>
          <p className="mt-3 text-sm text-ink-muted">
            No credit card. Runs on demo data — no store account needed.
          </p>
        </div>
        <LandingPreview />
      </section>

      {/* Features */}
      <section className="py-12">
        <h2 className="text-center text-2xl font-bold tracking-tight text-ink">
          Everything you need for one clean trip
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-black/5 bg-white p-5 shadow-card">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <f.icon size={20} />
              </div>
              <h3 className="font-semibold text-ink">{f.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-12">
        <h2 className="text-center text-2xl font-bold tracking-tight text-ink">How it works</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl bg-white p-5 shadow-card">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 font-bold text-white">
                {s.n}
              </span>
              <h3 className="mt-3 font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="my-12 overflow-hidden rounded-3xl bg-brand-600 px-6 py-12 text-center text-white sm:px-12">
        <h2 className="text-3xl font-bold tracking-tight">Ready for a calmer grocery run?</h2>
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

      <footer className="border-t border-black/5 py-8 text-center text-sm text-ink-muted">
        <p>AislePilot — demo MVP. Not affiliated with The Kroger Co. Product & price data is fictional.</p>
      </footer>
    </div>
  );
}

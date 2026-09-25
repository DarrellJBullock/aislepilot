import type { Metadata } from "next";
import Link from "next/link";
import {
  ListChecks,
  MapPin,
  ScanBarcode,
  ShoppingCart,
  TrendingDown,
  Users,
} from "lucide-react";
import { Logo } from "@/components/app/Logo";
import { Card, CardBody, Button } from "@/components/ui";
import { KrogerFamilyList } from "@/components/stores/KrogerFamilyList";

export const metadata: Metadata = { title: "How to use AislePilot" };

const STEPS = [
  {
    icon: ListChecks,
    title: "Start a list",
    body: "From your dashboard, tap New list. Give it a name, an optional budget, and pick your store — you can also add items first and pick a store later.",
  },
  {
    icon: ScanBarcode,
    title: "Add your items",
    body: "Quick add types one item at a time. Paste list drops in a whole list at once (one item per line). Scan lets you add by barcode.",
  },
  {
    icon: MapPin,
    title: "Match each item to the real product",
    body: "Tap Match on an item to pick the exact product, brand, size, and current price at your store — this is what makes the total and aisle routing accurate.",
  },
  {
    icon: Users,
    title: "Share it (optional)",
    body: "Tap Share on a list to invite family or roommates by email. Everyone sees the same list and who's grabbed what.",
  },
  {
    icon: ShoppingCart,
    title: "Start Shopping",
    body: "Once you've got a store and at least one matched item, tap Start Shopping. Items are sorted by that store's real aisle order, so you walk it once — mark each one Collected, Skip, or Unavailable as you go.",
  },
  {
    icon: TrendingDown,
    title: "Watch your budget",
    body: "Your total updates live as you shop. If you go over budget, AislePilot suggests a genuinely cheaper swap for the priciest item you haven't collected yet — tap Swap it or Not now.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link href="/" className="mb-8 flex justify-center">
        <Logo />
      </Link>
      <Card>
        <CardBody className="sm:p-8">
          <h1 className="text-2xl font-bold text-ink">How to use AislePilot</h1>
          <p className="mt-1 text-sm text-ink-muted">
            The basics — start to finish, in about a minute.
          </p>

          <ol className="mt-6 space-y-5">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <s.icon size={18} />
                </span>
                <div>
                  <p className="font-semibold text-ink">
                    {i + 1}. {s.title}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-soft">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-7">
            <h2 className="font-semibold text-ink">Which stores work?</h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              Any Kroger-family store. Search by ZIP code near you — these are the brands to look for:
            </p>
            <KrogerFamilyList className="mt-3 grid gap-2 sm:grid-cols-2" />
          </div>

          <div className="mt-7 rounded-2xl bg-brand-50 p-4 text-sm text-brand-900">
            <p className="font-semibold">A few things worth knowing</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-5">
              <li>Works offline — changes sync once you&apos;re back online.</li>
              <li>Your trip is saved to Purchase history automatically once every item is resolved.</li>
              <li>Stuck on something, or it just did something weird? That&apos;s useful to know — tell whoever sent you this link.</li>
            </ul>
          </div>

          <Link href="/dashboard" className="mt-6 block">
            <Button fullWidth size="lg">
              Back to your lists
            </Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}

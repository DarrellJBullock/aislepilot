import { cn } from "@/lib/utils";
import { Barcode } from "./Barcode";

// Static, self-contained visual preview of a list + route + total, styled as
// the literal artifact the product produces: a priced receipt with aisle
// codes. Colors here are inherited CSS custom properties set by the
// landing page wrapper (see src/app/page.tsx) — no data deps.
const ITEMS = [
  { name: "2% Reduced Fat Milk", aisle: "D1", price: "3.69", done: true },
  { name: "Large Grade A Eggs", aisle: "D3", price: "2.99", done: true },
  { name: "100% Whole Wheat Bread", aisle: "B1", price: "2.99", done: false },
  { name: "Boneless Chicken Breast", aisle: "M1", price: "3.99", done: false },
];

function TornEdge({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 300 12"
      preserveAspectRatio="none"
      className={cn("block h-3 w-full text-white", flip && "rotate-180")}
      aria-hidden
    >
      <polygon
        fill="currentColor"
        points="0,12 0,6 12,0 24,6 36,0 48,6 60,0 72,6 84,0 96,6 108,0 120,6 132,0 144,6 156,0 168,6 180,0 192,6 204,0 216,6 228,0 240,6 252,0 264,6 276,0 288,6 300,0 300,12"
      />
    </svg>
  );
}

export function LandingPreview() {
  return (
    <div className="relative mx-auto w-full max-w-sm animate-slide-up motion-reduce:animate-none">
      <TornEdge />
      <div className="bg-white px-6 py-5 shadow-xl">
        <div className="text-center">
          <p className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.2em] text-[color:var(--ink-soft)]">
            KROGER · RIVERSIDE COMMONS
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-black uppercase tracking-tight text-[color:var(--ink)]">
            Weekly Groceries
          </p>
        </div>

        <div className="my-3 border-t border-dashed border-black/15" />

        <ul className="space-y-2.5 font-[family-name:var(--font-mono)] text-[13px] text-[color:var(--ink)]">
          {ITEMS.map((it) => (
            <li key={it.name} className="flex items-baseline gap-2">
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border text-[9px] leading-none",
                  it.done ? "border-brand-600 bg-brand-600 text-white" : "border-black/25 text-transparent",
                )}
              >
                ✓
              </span>
              <span className="shrink-0 rounded-sm bg-[color:var(--tag-yellow-soft)] px-1 py-px text-[10px] font-bold text-[color:var(--tag-yellow-ink)]">
                {it.aisle}
              </span>
              <span className={cn("truncate", it.done && "text-[color:var(--ink-soft)] line-through")}>
                {it.name}
              </span>
              <span className="mx-1 -translate-y-[3px] flex-1 border-b border-dotted border-black/25" />
              <span className="shrink-0 tabular-nums">${it.price}</span>
            </li>
          ))}
        </ul>

        <div className="my-3 border-t border-dashed border-black/15" />

        <div className="flex items-baseline justify-between font-[family-name:var(--font-display)] text-lg font-black uppercase text-[color:var(--ink)]">
          <span>Total</span>
          <span className="font-[family-name:var(--font-mono)] tabular-nums">$13.66</span>
        </div>
        <p className="mt-1 text-right font-[family-name:var(--font-mono)] text-[10px] tracking-wide text-[color:var(--ink-soft)]">
          2 OF 4 COLLECTED · 50%
        </p>

        <Barcode className="mt-4 text-[color:var(--ink)]" barHeight={26} />
        <p className="mt-1 text-center font-[family-name:var(--font-mono)] text-[9px] tracking-[0.3em] text-[color:var(--ink-soft)]">
          THANK YOU
        </p>
      </div>
      <TornEdge flip />
    </div>
  );
}

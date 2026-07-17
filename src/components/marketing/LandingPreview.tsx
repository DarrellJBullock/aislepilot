import { MapPin, Check } from "lucide-react";

// Static, self-contained visual preview of a list + route + total. No data deps.
const ITEMS = [
  { name: "2% Reduced Fat Milk", dept: "Dairy · Aisle D1", price: "$3.69", done: true },
  { name: "Large Grade A Eggs", dept: "Dairy · Aisle D3", price: "$2.99", done: true },
  { name: "100% Whole Wheat Bread", dept: "Bakery · Aisle B1", price: "$2.99", done: false },
  { name: "Boneless Chicken Breast", dept: "Meat · Aisle M1", price: "$3.99", done: false },
];

export function LandingPreview() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="rounded-[2rem] border border-black/10 bg-white p-3 shadow-xl">
        <div className="rounded-[1.5rem] bg-[var(--background)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-ink-muted">Kroger — Riverside Commons</p>
              <p className="text-lg font-bold text-ink">Weekly Groceries</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-muted">Est. total</p>
              <p className="text-lg font-bold text-brand-700">$13.66</p>
            </div>
          </div>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/10">
            <div className="h-full w-1/2 rounded-full bg-brand-500" />
          </div>
          <p className="mt-1 text-xs text-ink-muted">2 of 4 collected · 50%</p>

          <div className="mt-4 space-y-2">
            {ITEMS.map((it) => (
              <div key={it.name} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    it.done ? "bg-brand-500 text-white" : "border border-black/10 text-transparent"
                  }`}
                >
                  <Check size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${it.done ? "text-ink-muted line-through" : "text-ink"}`}>
                    {it.name}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-ink-muted">
                    <MapPin size={11} /> {it.dept}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums text-ink">{it.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

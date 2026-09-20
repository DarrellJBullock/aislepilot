import { cn } from "@/lib/utils";

// Fixed bar widths (not random) so server and client render identically.
const WIDTHS = [2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 1, 3, 2, 1, 1, 2, 1, 3, 1, 2];

export function Barcode({ className, barHeight = 28 }: { className?: string; barHeight?: number }) {
  return (
    <div className={cn("flex items-end justify-center gap-[2px]", className)} aria-hidden>
      {WIDTHS.map((w, i) => (
        <span key={i} className="block bg-current" style={{ width: w, height: barHeight }} />
      ))}
    </div>
  );
}

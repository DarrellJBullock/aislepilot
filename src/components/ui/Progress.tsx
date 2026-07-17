import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  label,
}: {
  value: number; // 0-100
  className?: string;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-black/10", className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progress"}
    >
      <div
        className="h-full rounded-full bg-brand-500 transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

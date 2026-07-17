import { cn } from "@/lib/utils";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span
        className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm"
        aria-hidden
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 5h2l2.4 11.2a1 1 0 0 0 1 .8h8.2a1 1 0 0 0 1-.78L21 8H6" />
          <path d="m11 12 2 2 4-4" />
        </svg>
      </span>
      {showText && (
        <span className="text-lg font-bold tracking-tight text-ink">
          Aisle<span className="text-brand-600">Pilot</span>
        </span>
      )}
    </span>
  );
}

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "brand" | "amber" | "red" | "blue" | "green";

const TONES: Record<Tone, string> = {
  neutral: "bg-black/5 text-ink-soft",
  brand: "bg-brand-50 text-brand-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}

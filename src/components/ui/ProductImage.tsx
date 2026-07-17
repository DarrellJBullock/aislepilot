import { cn } from "@/lib/utils";

// Deterministic pastel background from the product name so the placeholder is
// stable and visually varied without any network images.
const PALETTE = [
  "bg-brand-100 text-brand-800",
  "bg-amber-100 text-amber-800",
  "bg-blue-100 text-blue-800",
  "bg-rose-100 text-rose-800",
  "bg-violet-100 text-violet-800",
  "bg-emerald-100 text-emerald-800",
];

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function ProductImage({
  name,
  imageUrl,
  size = 56,
  className,
}: {
  name: string;
  imageUrl?: string;
  size?: number;
  className?: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        width={size}
        height={size}
        className={cn("rounded-xl object-cover", className)}
      />
    );
  }
  const tone = PALETTE[hash(name) % PALETTE.length];
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl font-semibold",
        tone,
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.32 }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

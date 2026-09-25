import { KROGER_FAMILY_BANNERS } from "@aislepilot/domain/branding";
import { StoreLogo } from "./StoreLogo";

/** Every Kroger-family banner with its logo and where it operates. */
export function KrogerFamilyList({ className }: { className?: string }) {
  return (
    <ul className={className ?? "grid gap-2 sm:grid-cols-2"}>
      {KROGER_FAMILY_BANNERS.map((b) => (
        <li
          key={b.code}
          className="flex items-center gap-3 rounded-xl border border-black/5 bg-white p-2.5"
        >
          <StoreLogo store={{ banner: b.code, demo: false }} size={32} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-ink">{b.name}</span>
            <span className="block truncate text-xs text-ink-muted">{b.region}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

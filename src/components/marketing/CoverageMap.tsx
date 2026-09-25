import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import us from "us-atlas/states-10m.json";
import { KROGER_COVERAGE, coverageTier, type CoverageTier } from "@aislepilot/domain/branding";

const FILL: Record<CoverageTier, string> = {
  covered: "var(--route-rust)",
  partial: "rgba(193,72,30,0.35)",
  none: "rgba(32,29,23,0.09)",
};

// Rendered on the server at build time — no map library ships to the browser.
const topology = us as unknown as Topology;
const states = feature(topology, topology.objects.states as GeometryCollection<{ name: string }>);
const toPath = geoPath(geoAlbersUsa().scale(1100).translate([450, 280]));

const covered = Object.entries(KROGER_COVERAGE).filter(([, v]) => v.tier === "covered").length;

export function CoverageMap({ className }: { className?: string }) {
  return (
    <figure className={className}>
      <svg
        viewBox="0 0 900 560"
        role="img"
        aria-label="Map of US states with Kroger-family stores: most of the South, Midwest and West, plus Maryland, Virginia and the Carolinas. None in the Northeast, including New Jersey and Pennsylvania."
        className="w-full"
      >
        {states.features.map((f) => {
          const name = f.properties.name;
          const info = KROGER_COVERAGE[name];
          const d = toPath(f);
          if (!d) return null;
          return (
            <path key={name} d={d} fill={FILL[coverageTier(name)]} stroke="#FBF7EF" strokeWidth={1}>
              <title>{info ? `${name}: ${info.note}` : `${name}: no Kroger-family stores`}</title>
            </path>
          );
        })}
      </svg>
      <figcaption className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-[color:var(--ink-soft)]">
        {(
          [
            ["covered", `Covered (${covered} states)`],
            ["partial", "Some metros only"],
            ["none", "Not yet"],
          ] as const
        ).map(([tier, label]) => (
          <span key={tier} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm" style={{ background: FILL[tier] }} />
            {label}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

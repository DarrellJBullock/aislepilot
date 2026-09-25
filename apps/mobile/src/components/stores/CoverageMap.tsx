import { View, Text } from "react-native";
import Svg, { Path } from "react-native-svg";
import { KROGER_COVERAGE, coverageTier, type CoverageTier } from "@aislepilot/domain/branding";
import { US_MAP_VIEWBOX, US_STATE_PATHS } from "@/lib/us-state-paths";

const FILL: Record<CoverageTier, string> = {
  covered: "#0b7344",
  partial: "#9fd3b8",
  none: "#e5e3dc",
};

const LEGEND: [CoverageTier, string][] = [
  ["covered", "Covered"],
  ["partial", "Some metros only"],
  ["none", "Not yet"],
];

const coveredCount = Object.values(KROGER_COVERAGE).filter((v) => v.tier === "covered").length;

/** US map of states with Kroger-family stores (outlines precomputed). */
export function CoverageMap() {
  const [, , w, h] = US_MAP_VIEWBOX.split(" ").map(Number);
  return (
    <View
      accessible
      accessibilityLabel="Map of US states with Kroger-family stores. Most of the South, Midwest and West are covered, plus Maryland, Virginia and the Carolinas. None in the Northeast, including New Jersey and Pennsylvania."
    >
      <Svg width="100%" viewBox={US_MAP_VIEWBOX} style={{ aspectRatio: w / h }}>
        {Object.entries(US_STATE_PATHS).map(([name, d]) => (
          <Path key={name} d={d} fill={FILL[coverageTier(name)]} stroke="#ffffff" strokeWidth={1} />
        ))}
      </Svg>
      <View className="mt-2 flex-row flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {LEGEND.map(([tier, label]) => (
          <View key={tier} className="flex-row items-center gap-1.5">
            <View style={{ backgroundColor: FILL[tier] }} className="h-3 w-3 rounded-sm" />
            <Text className="text-xs text-ink-muted">
              {tier === "covered" ? `${label} (${coveredCount} states)` : label}
            </Text>
          </View>
        ))}
      </View>
      <Text className="mt-2 text-center text-xs text-ink-muted">
        Not yet in New Jersey, Pennsylvania or the rest of the Northeast. Even in a covered state,
        you&apos;ll only see stores within about 10 miles of your ZIP.
      </Text>
    </View>
  );
}

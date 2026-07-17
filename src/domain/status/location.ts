import type { LocationSource } from "../types";

export interface LocationConfidence {
  source: LocationSource;
  label: string;
  verified: boolean; // true ONLY when the retailer verified it
  confidence: "high" | "medium" | "low" | "none";
}

const CONFIDENCE: Record<LocationSource, LocationConfidence> = {
  retailer_verified: {
    source: "retailer_verified",
    label: "Retailer verified",
    verified: true,
    confidence: "high",
  },
  community_verified: {
    source: "community_verified",
    label: "Community verified",
    verified: false,
    confidence: "medium",
  },
  aislepilot_mapped: {
    source: "aislepilot_mapped",
    label: "AislePilot estimate",
    verified: false,
    confidence: "medium",
  },
  category_estimate: {
    source: "category_estimate",
    label: "Estimated by category",
    verified: false,
    confidence: "low",
  },
  unknown: {
    source: "unknown",
    label: "Location unknown",
    verified: false,
    confidence: "none",
  },
};

export function locationConfidence(source?: LocationSource): LocationConfidence {
  return CONFIDENCE[source ?? "unknown"];
}

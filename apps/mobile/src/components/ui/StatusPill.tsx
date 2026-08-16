import { Text } from "react-native";
import { ShieldCheck, MapPin, Sparkles } from "lucide-react-native";
import type { Availability, ItemStatus, LocationSource } from "@aislepilot/domain/types";
import { locationConfidence } from "@aislepilot/domain/status/location";
import { statusTones } from "@aislepilot/design-tokens";
import { Badge } from "./Badge";

type Tone = "neutral" | "brand" | "amber" | "red" | "blue" | "green";

const STATUS_LABEL: Record<ItemStatus, { label: string; tone: Tone }> = {
  unmatched: { label: "Needs match", tone: "amber" },
  matched: { label: "Matched", tone: "blue" },
  available: { label: "Ready", tone: "brand" },
  collected: { label: "Collected", tone: "green" },
  unavailable: { label: "Unavailable", tone: "red" },
  skipped: { label: "Skipped", tone: "neutral" },
  purchased: { label: "Purchased", tone: "green" },
};

export function StatusPill({ status }: { status: ItemStatus }) {
  const s = STATUS_LABEL[status];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

const AVAIL: Record<Availability, { label: string; tone: Tone }> = {
  in_stock: { label: "In stock", tone: "green" },
  limited: { label: "Limited", tone: "amber" },
  out_of_stock: { label: "Out of stock", tone: "red" },
  unknown: { label: "Availability unknown", tone: "neutral" },
};

export function AvailabilityPill({ availability }: { availability: Availability }) {
  const a = AVAIL[availability];
  return <Badge tone={a.tone}>{a.label}</Badge>;
}

const TONE_TEXT: Record<Tone, string> = {
  neutral: "text-ink-soft",
  brand: "text-brand-800",
  amber: "text-amber-800",
  red: "text-red-700",
  blue: "text-blue-700",
  green: "text-green-700",
};

/** Only retailer_verified sources render as "verified" — estimates say so. */
export function LocationBadge({ source }: { source?: LocationSource }) {
  const info = locationConfidence(source);
  const tone: Tone = info.verified ? "green" : info.confidence === "low" ? "neutral" : "blue";
  const Icon = info.verified ? ShieldCheck : info.confidence === "low" ? Sparkles : MapPin;
  return (
    <Badge tone={tone}>
      <Icon size={12} color={statusTones[tone].text} />
      <Text className={`text-xs font-medium ${TONE_TEXT[tone]}`}>{info.label}</Text>
    </Badge>
  );
}

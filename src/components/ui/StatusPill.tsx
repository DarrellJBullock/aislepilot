import type { Availability, ItemStatus, LocationSource } from "@/domain/types";
import { locationConfidence } from "@/domain/status/location";
import { Badge } from "./Badge";
import { ShieldCheck, MapPin, Sparkles } from "lucide-react";

const STATUS_LABEL: Record<ItemStatus, { label: string; tone: Parameters<typeof Badge>[0]["tone"] }> = {
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

const AVAIL: Record<Availability, { label: string; tone: Parameters<typeof Badge>[0]["tone"] }> = {
  in_stock: { label: "In stock", tone: "green" },
  limited: { label: "Limited", tone: "amber" },
  out_of_stock: { label: "Out of stock", tone: "red" },
  unknown: { label: "Availability unknown", tone: "neutral" },
};

export function AvailabilityPill({ availability }: { availability: Availability }) {
  const a = AVAIL[availability];
  return <Badge tone={a.tone}>{a.label}</Badge>;
}

/**
 * Location confidence badge. Only retailer_verified sources are labelled
 * "verified" (with a shield). Estimates are clearly marked as estimates.
 */
export function LocationBadge({ source }: { source?: LocationSource }) {
  const info = locationConfidence(source);
  const Icon = info.verified ? ShieldCheck : info.confidence === "low" ? Sparkles : MapPin;
  const tone = info.verified ? "green" : info.confidence === "low" ? "neutral" : "blue";
  return (
    <Badge tone={tone}>
      <Icon size={12} />
      {info.label}
    </Badge>
  );
}

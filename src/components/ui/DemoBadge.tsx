import { FlaskConical } from "lucide-react";
import { Badge } from "./Badge";

/** Marks that the app is showing demo/mock data, not live retailer data. */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge tone="amber" className={className}>
      <FlaskConical size={12} />
      Demo data
    </Badge>
  );
}

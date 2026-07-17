"use client";

import { CloudOff, RefreshCw, Check } from "lucide-react";
import type { SyncState } from "@/services/offline/useSyncStatus";
import { Badge } from "@/components/ui";

export function SyncBadge({ state }: { state: SyncState }) {
  if (state === "offline") {
    return (
      <Badge tone="amber">
        <CloudOff size={12} /> Offline — saved locally
      </Badge>
    );
  }
  if (state === "syncing") {
    return (
      <Badge tone="blue">
        <RefreshCw size={12} className="animate-spin" /> Syncing
      </Badge>
    );
  }
  return (
    <Badge tone="green">
      <Check size={12} /> Synced
    </Badge>
  );
}

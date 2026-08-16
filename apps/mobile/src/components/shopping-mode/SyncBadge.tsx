import { Text } from "react-native";
import { CloudOff, RefreshCw, Check } from "lucide-react-native";
import type { SyncState } from "../../lib/use-sync-status";
import { Badge } from "../ui";

export function SyncBadge({ state }: { state: SyncState }) {
  if (state === "offline") {
    return (
      <Badge tone="amber">
        <CloudOff size={12} color="#92400e" />
        <Text className="text-xs font-medium text-amber-800">Offline — saved locally</Text>
      </Badge>
    );
  }
  if (state === "syncing") {
    return (
      <Badge tone="blue">
        <RefreshCw size={12} color="#1d4ed8" />
        <Text className="text-xs font-medium text-blue-700">Syncing</Text>
      </Badge>
    );
  }
  return (
    <Badge tone="green">
      <Check size={12} color="#15803d" />
      <Text className="text-xs font-medium text-green-700">Synced</Text>
    </Badge>
  );
}

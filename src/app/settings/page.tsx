import { AppShell } from "@/components/app/AppShell";
import { RequireAuth } from "@/components/app/RequireAuth";
import { SettingsView } from "@/components/settings/SettingsView";

export default function SettingsPage() {
  return (
    <RequireAuth>
      <AppShell>
        <SettingsView />
      </AppShell>
    </RequireAuth>
  );
}

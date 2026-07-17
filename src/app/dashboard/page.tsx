import { AppShell } from "@/components/app/AppShell";
import { RequireAuth } from "@/components/app/RequireAuth";
import { Dashboard } from "@/components/dashboard/Dashboard";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <AppShell>
        <Dashboard />
      </AppShell>
    </RequireAuth>
  );
}

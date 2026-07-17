import { AppShell } from "@/components/app/AppShell";
import { RequireAuth } from "@/components/app/RequireAuth";
import { CreateListForm } from "@/components/lists/CreateListForm";

export default function NewListPage() {
  return (
    <RequireAuth>
      <AppShell>
        <CreateListForm />
      </AppShell>
    </RequireAuth>
  );
}

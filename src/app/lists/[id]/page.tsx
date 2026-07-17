import { AppShell } from "@/components/app/AppShell";
import { RequireAuth } from "@/components/app/RequireAuth";
import { ListDetail } from "@/components/lists/ListDetail";

export default async function ListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireAuth>
      <AppShell>
        <ListDetail listId={id} />
      </AppShell>
    </RequireAuth>
  );
}

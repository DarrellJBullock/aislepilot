import { RequireAuth } from "@/components/app/RequireAuth";
import { ShoppingMode } from "@/components/shopping-mode/ShoppingMode";

export default async function ShoppingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireAuth>
      <ShoppingMode listId={id} />
    </RequireAuth>
  );
}

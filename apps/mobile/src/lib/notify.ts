// Fires a best-effort push to the other members of a shared list via
// /api/notifications/notify (see src/lib/retailer.ts for the same
// EXPO_PUBLIC_API_BASE_URL convention). Never awaited by callers and never
// throws — a failed notification should never block or surface an error
// for the action that triggered it.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

export function notifyListMembers(input: {
  listId: string;
  actorUserId: string;
  event: "items_added" | "item_collected" | "member_invited";
  title: string;
  body: string;
}) {
  if (!API_BASE_URL) return;
  fetch(`${API_BASE_URL}/api/notifications/notify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  }).catch(() => {});
}

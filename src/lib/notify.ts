// Fires a best-effort push to the other members of a shared list via
// /api/notifications/notify. Same-origin, so no base URL is needed (see
// apps/mobile/src/lib/notify.ts for the mobile equivalent, which does need
// one). Never awaited by callers and never throws — a failed notification
// should never block or surface an error for the action that triggered it.
export function notifyListMembers(input: {
  listId: string;
  actorUserId: string;
  event: "items_added" | "item_collected" | "member_invited";
  title: string;
  body: string;
}) {
  fetch("/api/notifications/notify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  }).catch(() => {});
}

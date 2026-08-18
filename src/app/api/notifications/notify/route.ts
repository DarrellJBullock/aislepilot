import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type NotifyEvent = "items_added" | "item_collected" | "member_invited";

interface NotifyBody {
  listId: string;
  actorUserId: string;
  event: NotifyEvent;
  title: string;
  body: string;
}

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/**
 * Notifies the other members of a shared list (excluding the actor) of
 * list activity. Runs server-side with the service-role client because it
 * needs to read every member's push token — something RLS deliberately
 * only allows a user to do for their own rows (see
 * supabase/migrations/0003_push_tokens.sql).
 */
export async function POST(request: Request) {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ sent: 0, error: "supabase_not_configured" }, { status: 200 });

  let payload: NotifyBody;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const { listId, actorUserId, title, body } = payload;
  if (!listId || !actorUserId || !title || !body) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const { data: list } = await admin
    .from("shopping_lists")
    .select("id, owner_id")
    .eq("id", listId)
    .maybeSingle();
  if (!list) return NextResponse.json({ sent: 0, error: "list_not_found" }, { status: 200 });

  const { data: members } = await admin
    .from("shopping_list_members")
    .select("email")
    .eq("list_id", listId);

  const { data: ownerProfile } = await admin
    .from("profiles")
    .select("email")
    .eq("id", list.owner_id)
    .maybeSingle();

  const emails = [...(members ?? []).map((m) => m.email), ownerProfile?.email].filter(
    (e): e is string => !!e,
  );
  if (!emails.length) return NextResponse.json({ sent: 0 });

  // Only actors who are actually part of this list can trigger a notification
  // to it — this endpoint has no user auth of its own, so this is the guard.
  const { data: actorProfile } = await admin
    .from("profiles")
    .select("id, email")
    .eq("id", actorUserId)
    .maybeSingle();
  if (!actorProfile || !emails.includes(actorProfile.email)) {
    return NextResponse.json({ sent: 0, error: "actor_not_a_member" }, { status: 200 });
  }

  const { data: recipients } = await admin
    .from("profiles")
    .select("id")
    .in("email", emails)
    .neq("id", actorUserId);
  const recipientIds = (recipients ?? []).map((r) => r.id);
  if (!recipientIds.length) return NextResponse.json({ sent: 0 });

  const { data: tokens } = await admin
    .from("device_push_tokens")
    .select("token")
    .in("user_id", recipientIds);
  const pushTokens = [...new Set((tokens ?? []).map((t) => t.token))];
  if (!pushTokens.length) return NextResponse.json({ sent: 0 });

  const messages = pushTokens.map((to) => ({
    to,
    title,
    body,
    data: { listId },
  }));

  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(messages),
    });
    if (!res.ok) return NextResponse.json({ sent: 0, error: "expo_push_failed" }, { status: 200 });
  } catch {
    return NextResponse.json({ sent: 0, error: "expo_push_unreachable" }, { status: 200 });
  }

  return NextResponse.json({ sent: pushTokens.length });
}

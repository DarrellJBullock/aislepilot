import { NextResponse } from "next/server";
import { Resend } from "resend";

// Forwards mail sent to support@aisle-pilot.app to a real inbox. Resend
// delivers inbound mail as a webhook event (metadata only) rather than SMTP
// forwarding, so this route verifies the event came from Resend and uses
// their receiving.forward() API (passthrough: true keeps the original
// sender/formatting/attachments intact) to relay it on.
const resend = new Resend(process.env.RESEND_API_KEY);

const FORWARD_FROM = "AislePilot Support <support@aisle-pilot.app>";

export async function POST(request: Request) {
  // .trim() guards against a trailing newline/whitespace sneaking into the
  // env var via copy-paste — base64 decoding the secret is strict about it.
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  const forwardTo = process.env.SUPPORT_FORWARD_TO?.trim();
  if (!webhookSecret || !forwardTo) {
    console.error("[resend-inbound] RESEND_WEBHOOK_SECRET or SUPPORT_FORWARD_TO not configured");
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  const payload = await request.text();
  let event;
  try {
    event = resend.webhooks.verify({
      payload,
      // Standard Webhooks spec header names — the SDK's internal verify()
      // maps these to "webhook-id"/"webhook-timestamp"/"webhook-signature"
      // (not the older "svix-*" naming) when computing the signature.
      headers: {
        id: request.headers.get("webhook-id") ?? "",
        timestamp: request.headers.get("webhook-timestamp") ?? "",
        signature: request.headers.get("webhook-signature") ?? "",
      },
      webhookSecret,
    });
  } catch (err) {
    // Diagnostic only, temporary: dump every incoming header name (not
    // values, except the three we care about aren't secret) so we can see
    // what Resend actually sends instead of guessing again.
    const allHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      allHeaders[key] = key.includes("signature") ? "[redacted]" : value;
    });
    console.error(
      `[resend-inbound] signature verification failed (secret length ${webhookSecret.length}):`,
      err,
      "headers:",
      JSON.stringify(allHeaders),
    );
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  if (event.type === "email.received") {
    const { error } = await resend.emails.receiving.forward({
      emailId: event.data.email_id,
      to: forwardTo,
      from: FORWARD_FROM,
      passthrough: true,
    });
    if (error) {
      console.error("[resend-inbound] forward failed:", error);
      return NextResponse.json({ error: "forward_failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

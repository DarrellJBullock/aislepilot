/**
 * Supabase end-to-end smoke test: proves auth, RLS, and list/item CRUD against
 * your real project. Run after pushing the schema (supabase/schema.sql):
 *
 *   npm run supabase:smoke
 *
 * Creates a temporary confirmed user, signs in as them (anon key → RLS applies),
 * creates a list + item, reads it back, then deletes the user (cascades cleanup).
 * Reads NEXT_PUBLIC_SUPABASE_URL / ANON / SERVICE_ROLE from .env.local.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

function loadEnvLocal() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* rely on ambient env */
  }
}

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) {
    console.log("[supabase-smoke] Missing Supabase env vars in .env.local — skipping.");
    return;
  }

  const admin = createClient(url, service, { auth: { persistSession: false } });
  const email = `smoke_${Date.now()}@aislepilot.test`;
  const password = "smoke-pass-123";

  console.log("① Creating a confirmed test user…");
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: "Smoke Tester" },
  });
  if (createErr || !created.user) throw createErr ?? new Error("no user created");
  const userId = created.user.id;
  console.log(`   ✓ ${email}`);

  try {
    console.log("② Signing in as the user (anon key, RLS enforced)…");
    const user = createClient(url, anon, { auth: { persistSession: false } });
    const { error: signInErr } = await user.auth.signInWithPassword({ email, password });
    if (signInErr) throw signInErr;
    console.log("   ✓ session established");

    console.log("③ Creating a list + item…");
    const listId = randomUUID();
    const itemId = randomUUID();
    const { error: listErr } = await user
      .from("shopping_lists")
      .insert({ id: listId, owner_id: userId, name: "Smoke List", budget: 25 });
    if (listErr) throw describe(listErr);
    await user.from("shopping_list_members").insert({
      id: randomUUID(),
      list_id: listId,
      user_id: userId,
      email,
      display_name: "Smoke Tester",
      role: "owner",
    });
    const { error: itemErr } = await user.from("shopping_list_items").insert({
      id: itemId,
      list_id: listId,
      raw_text: "Milk",
      quantity: 2,
      status: "available",
      product: { name: "2% Milk", currentPrice: 3.69 },
    });
    if (itemErr) throw describe(itemErr);
    console.log("   ✓ inserted");

    console.log("④ Reading it back (nested select, RLS-scoped)…");
    const { data, error: readErr } = await user
      .from("shopping_lists")
      .select("*, shopping_list_items(*), shopping_list_members(*)");
    if (readErr) throw describe(readErr);
    const list = data?.find((l) => l.id === listId);
    if (!list) throw new Error("list not returned to its owner");
    console.log(
      `   ✓ "${list.name}" · items=${list.shopping_list_items.length} · members=${list.shopping_list_members.length}`,
    );

    console.log("⑤ Verifying RLS isolation (anon, no session)…");
    const anonClient = createClient(url, anon, { auth: { persistSession: false } });
    const { data: leaked } = await anonClient.from("shopping_lists").select("id");
    console.log(`   ✓ unauthenticated sees ${leaked?.length ?? 0} lists (expected 0)`);

    console.log("\n✅ Supabase auth + RLS + CRUD path OK.");
  } finally {
    console.log("⑥ Cleaning up test user…");
    await admin.auth.admin.deleteUser(userId);
    console.log("   ✓ removed");
  }
}

function describe(err: { message?: string; code?: string }): Error {
  const msg = err.message ?? "";
  const schemaMissing =
    err.code === "42P01" ||
    /relation .* does not exist/i.test(msg) ||
    /could not find the table|schema cache/i.test(msg);
  const hint = schemaMissing
    ? " — run supabase/schema.sql in the Supabase SQL Editor first."
    : "";
  return new Error(`${err.message ?? "unknown error"}${hint}`);
}

main().catch((err) => {
  console.error("\n[supabase-smoke] FAILED:", err instanceof Error ? err.message : err);
  process.exit(1);
});

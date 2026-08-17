// Every uid() call site feeds a Postgres `uuid` primary key (shopping_lists,
// shopping_list_members, shopping_list_items, saved_products,
// purchase_history — see supabase/migrations/0001_init.sql), so this must
// always return a valid UUID string, not a prefixed label — Postgres
// rejects anything else with "invalid input syntax for type uuid".
export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  // Fallback for runtimes without crypto.randomUUID: still valid v4 format.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function now(): string {
  return new Date().toISOString();
}

export function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[.\-_]/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

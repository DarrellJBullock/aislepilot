import type { AppState } from "./state";
import { emptyState } from "./state";
import * as S from "./state";
import { signUp } from "./auth";
import { catalogForStore } from "@/data/mock/stores";

/**
 * Build an initial demo state with a sample account and a pre-filled list so a
 * first-time visitor sees a working experience immediately (mock mode).
 */
export function seedDemoState(): AppState {
  let state: AppState = emptyState();

  const res = signUp(state, "demo@aislepilot.app", "demo123", "Demo Shopper");
  state = res.state;

  const storeId = "store-riverside";
  const created = S.createList(state, {
    name: "Weekly Groceries",
    budget: 75,
    storeId,
    notes: "Demo list — try Shopping Mode!",
  });
  state = created.state;
  const listId = created.id;

  const entries: Array<{ text: string; qty: number; match?: string; priority?: "low" | "normal" | "high" }> = [
    { text: "Milk", qty: 1, match: "milk-2pct-gal" },
    { text: "Eggs", qty: 1, match: "eggs-large-dozen" },
    { text: "Bread", qty: 1, match: "bread-wheat" },
    { text: "Bananas", qty: 2, match: "bananas", priority: "low" },
    { text: "Chicken breast", qty: 1, match: "chicken-breast", priority: "high" },
    { text: "Paper towels", qty: 1, match: "paper-towels-2" },
    { text: "Dish soap", qty: 1 },
  ];

  const catalog = catalogForStore(storeId);
  for (const entry of entries) {
    state = S.addItem(state, listId, {
      rawText: entry.text,
      quantity: entry.qty,
      priority: entry.priority ?? "normal",
    });
    if (entry.match) {
      const list = state.lists.find((l) => l.id === listId)!;
      const item = list.items[list.items.length - 1];
      const product = catalog.find((p) => p.externalId === entry.match);
      if (product) state = S.matchItem(state, listId, item.id, product);
    }
  }

  // Seed the demo data but leave the visitor signed out so auth guards apply.
  // They can sign in with the demo credentials shown on the sign-in screen.
  state = { ...state, sessionUserId: null };
  return state;
}

import { describe, it, expect, beforeEach } from "vitest";
import type { AppState } from "@/lib/store/state";
import * as S from "@/lib/store/state";
import { signUp, signIn, signOut, currentProfile } from "@/lib/store/auth";
import { catalogForStore } from "@/data/mock/stores";

function authedState(): AppState {
  const base = S.emptyState();
  return signUp(base, "alex@example.com", "secret1", "Alex").state;
}

describe("auth", () => {
  it("signs up, signs out and signs back in", () => {
    let state = signUp(S.emptyState(), "a@b.com", "secret1").state;
    expect(currentProfile(state)?.email).toBe("a@b.com");
    state = signOut(state);
    expect(currentProfile(state)).toBeNull();
    const res = signIn(state, "a@b.com", "secret1");
    expect(res.error).toBeUndefined();
    expect(currentProfile(res.state)?.email).toBe("a@b.com");
  });

  it("rejects duplicate email and bad passwords", () => {
    let state = signUp(S.emptyState(), "a@b.com", "secret1").state;
    expect(signUp(state, "a@b.com", "secret1").error).toBeTruthy();
    expect(signUp(S.emptyState(), "bad", "secret1").error).toBeTruthy();
    expect(signUp(S.emptyState(), "c@d.com", "123").error).toBeTruthy();
    state = signOut(state);
    expect(signIn(state, "a@b.com", "wrong").error).toBeTruthy();
  });

  it("never exposes the password on the profile", () => {
    const state = authedState();
    const profile = currentProfile(state) as unknown as Record<string, unknown>;
    expect(profile.password).toBeUndefined();
  });
});

describe("lists and items", () => {
  let state: AppState;
  let listId: string;

  beforeEach(() => {
    state = authedState();
    const created = S.createList(state, { name: "Groceries", budget: 40, storeId: "store-riverside" });
    state = created.state;
    listId = created.id;
  });

  it("creates a list with the owner as a member", () => {
    const list = state.lists.find((l) => l.id === listId)!;
    expect(list.name).toBe("Groceries");
    expect(list.members[0].role).toBe("owner");
  });

  it("adds a single item", () => {
    state = S.addItem(state, listId, { rawText: "Milk", quantity: 2 });
    const list = state.lists.find((l) => l.id === listId)!;
    expect(list.items).toHaveLength(1);
    expect(list.items[0].quantity).toBe(2);
    expect(list.items[0].status).toBe("unmatched");
  });

  it("bulk-adds items with quantity prefixes", () => {
    state = S.addItemsBulk(state, listId, "Milk\n2 Eggs\nBread x3\n\n");
    const list = state.lists.find((l) => l.id === listId)!;
    expect(list.items).toHaveLength(3);
    const eggs = list.items.find((i) => i.rawText === "Eggs");
    const bread = list.items.find((i) => i.rawText === "Bread");
    expect(eggs?.quantity).toBe(2);
    expect(bread?.quantity).toBe(3);
  });

  it("matches a product and advances status to available", () => {
    state = S.addItem(state, listId, { rawText: "Milk" });
    const itemId = state.lists.find((l) => l.id === listId)!.items[0].id;
    const product = catalogForStore("store-riverside").find((p) => p.externalId === "milk-2pct-gal")!;
    state = S.matchItem(state, listId, itemId, product);
    const item = state.lists.find((l) => l.id === listId)!.items[0];
    expect(item.status).toBe("available");
    expect(item.product?.externalId).toBe("milk-2pct-gal");
  });

  it("adds a scanned product as an already-matched item", () => {
    const product = catalogForStore("store-riverside").find((p) => p.externalId === "eggs-large-dozen")!;
    state = S.addMatchedItem(state, listId, product, 2);
    const item = state.lists.find((l) => l.id === listId)!.items[0];
    expect(item.status).toBe("available");
    expect(item.quantity).toBe(2);
    expect(item.product?.externalId).toBe("eggs-large-dozen");
    expect(item.rawText).toBe(product.name);
  });

  it("collects an item and records the collector", () => {
    state = S.addItem(state, listId, { rawText: "Milk" });
    const itemId = state.lists.find((l) => l.id === listId)!.items[0].id;
    const product = catalogForStore("store-riverside")[0];
    state = S.matchItem(state, listId, itemId, product);
    state = S.setItemStatus(state, listId, itemId, "collected", "Alex");
    const item = state.lists.find((l) => l.id === listId)!.items[0];
    expect(item.status).toBe("collected");
    expect(item.collectedBy).toBe("Alex");
  });

  it("ignores invalid status transitions", () => {
    state = S.addItem(state, listId, { rawText: "Milk" });
    const itemId = state.lists.find((l) => l.id === listId)!.items[0].id;
    state = S.setItemStatus(state, listId, itemId, "collected");
    expect(state.lists.find((l) => l.id === listId)!.items[0].status).toBe("unmatched");
  });

  it("duplicates a list with fresh item ids and reset statuses", () => {
    state = S.addItem(state, listId, { rawText: "Milk" });
    const itemId = state.lists.find((l) => l.id === listId)!.items[0].id;
    state = S.matchItem(state, listId, itemId, catalogForStore("store-riverside")[0]);
    state = S.setItemStatus(state, listId, itemId, "collected");
    const dup = S.duplicateList(state, listId);
    const copy = dup.state.lists.find((l) => l.id === dup.id)!;
    expect(copy.id).not.toBe(listId);
    expect(copy.items[0].id).not.toBe(itemId);
    expect(copy.items[0].status).toBe("available");
  });
});

describe("shared-list permissions", () => {
  it("invites a member and prevents removing the owner", () => {
    let state = authedState();
    const created = S.createList(state, { name: "Shared" });
    state = created.state;
    const listId = created.id;
    state = S.inviteMember(state, listId, "friend@example.com");
    let list = state.lists.find((l) => l.id === listId)!;
    expect(list.members).toHaveLength(2);

    const ownerId = list.members.find((m) => m.role === "owner")!.id;
    state = S.removeMember(state, listId, ownerId);
    list = state.lists.find((l) => l.id === listId)!;
    expect(list.members.some((m) => m.role === "owner")).toBe(true);

    const memberId = list.members.find((m) => m.role === "member")!.id;
    state = S.removeMember(state, listId, memberId);
    list = state.lists.find((l) => l.id === listId)!;
    expect(list.members).toHaveLength(1);
  });

  it("does not duplicate an existing member", () => {
    let state = authedState();
    const created = S.createList(state, { name: "Shared" });
    state = created.state;
    state = S.inviteMember(state, created.id, "friend@example.com");
    state = S.inviteMember(state, created.id, "FRIEND@example.com");
    expect(state.lists.find((l) => l.id === created.id)!.members).toHaveLength(2);
  });
});

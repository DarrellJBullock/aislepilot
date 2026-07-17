import type {
  ItemPriority,
  ItemStatus,
  Product,
  Profile,
  PurchaseHistory,
  SavedProduct,
  ShoppingList,
  ShoppingListItem,
} from "@/domain/types";
import { assignProduct, clearMatch, replaceProduct } from "@/domain/assignment";
import { canTransition } from "@/domain/status";
import { uid, now, displayNameFromEmail } from "@/lib/utils";

export interface AppState {
  profiles: Record<string, Profile & { password: string }>;
  sessionUserId: string | null;
  lists: ShoppingList[];
  savedProducts: SavedProduct[];
  purchaseHistory: PurchaseHistory[];
}

export function emptyState(): AppState {
  return {
    profiles: {},
    sessionUserId: null,
    lists: [],
    savedProducts: [],
    purchaseHistory: [],
  };
}

// ---- Lists ----

export function createList(
  state: AppState,
  input: { name: string; budget?: number; storeId?: string; notes?: string },
): { state: AppState; id: string } {
  const ownerId = state.sessionUserId!;
  const profile = state.profiles[ownerId];
  const list: ShoppingList = {
    id: uid("list"),
    ownerId,
    name: input.name.trim() || "Untitled list",
    notes: input.notes?.trim() || undefined,
    budget: input.budget,
    storeId: input.storeId,
    archived: false,
    createdAt: now(),
    updatedAt: now(),
    items: [],
    members: [
      {
        id: uid("member"),
        listId: "",
        email: profile?.email ?? "",
        displayName: profile?.displayName ?? "Owner",
        role: "owner",
        joinedAt: now(),
      },
    ],
  };
  list.members[0].listId = list.id;
  return { state: { ...state, lists: [list, ...state.lists] }, id: list.id };
}

function mapList(
  state: AppState,
  id: string,
  fn: (list: ShoppingList) => ShoppingList,
): AppState {
  return {
    ...state,
    lists: state.lists.map((l) =>
      l.id === id ? { ...fn(l), updatedAt: now() } : l,
    ),
  };
}

export function updateList(
  state: AppState,
  id: string,
  patch: Partial<Pick<ShoppingList, "name" | "budget" | "storeId" | "notes" | "archived">>,
): AppState {
  return mapList(state, id, (l) => ({ ...l, ...patch }));
}

export function deleteList(state: AppState, id: string): AppState {
  return { ...state, lists: state.lists.filter((l) => l.id !== id) };
}

export function duplicateList(
  state: AppState,
  id: string,
): { state: AppState; id: string } {
  const source = state.lists.find((l) => l.id === id);
  if (!source) return { state, id };
  const newId = uid("list");
  const copy: ShoppingList = {
    ...source,
    id: newId,
    name: `${source.name} (copy)`,
    archived: false,
    createdAt: now(),
    updatedAt: now(),
    items: source.items.map((i) => ({
      ...i,
      id: uid("item"),
      listId: newId,
      status: i.product ? "available" : "unmatched",
      collectedBy: undefined,
    })),
    members: source.members.map((m) => ({ ...m, id: uid("member"), listId: newId })),
  };
  return { state: { ...state, lists: [copy, ...state.lists] }, id: newId };
}

// ---- Items ----

export function addItem(
  state: AppState,
  listId: string,
  input: { rawText: string; quantity?: number; notes?: string; priority?: ItemPriority },
): AppState {
  const text = input.rawText.trim();
  if (!text) return state;
  const item: ShoppingListItem = {
    id: uid("item"),
    listId,
    rawText: text,
    quantity: Math.max(1, input.quantity ?? 1),
    notes: input.notes?.trim() || undefined,
    priority: input.priority ?? "normal",
    status: "unmatched",
    updatedAt: now(),
  };
  return mapList(state, listId, (l) => ({ ...l, items: [...l.items, item] }));
}

export function addItemsBulk(
  state: AppState,
  listId: string,
  text: string,
): AppState {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  let next = state;
  for (const line of lines) {
    // Support "2x Milk" or "Milk x2" quantity prefixes/suffixes.
    const parsed = parseBulkLine(line);
    next = addItem(next, listId, parsed);
  }
  return next;
}

export function parseBulkLine(line: string): { rawText: string; quantity: number } {
  const prefix = line.match(/^(\d+)\s*[xX]?\s+(.+)$/);
  if (prefix) return { rawText: prefix[2].trim(), quantity: Number(prefix[1]) };
  const suffix = line.match(/^(.+?)\s+[xX]\s*(\d+)$/);
  if (suffix) return { rawText: suffix[1].trim(), quantity: Number(suffix[2]) };
  return { rawText: line, quantity: 1 };
}

function mapItem(
  state: AppState,
  listId: string,
  itemId: string,
  fn: (item: ShoppingListItem) => ShoppingListItem,
): AppState {
  return mapList(state, listId, (l) => ({
    ...l,
    items: l.items.map((i) => (i.id === itemId ? fn(i) : i)),
  }));
}

export function updateItem(
  state: AppState,
  listId: string,
  itemId: string,
  patch: Partial<Pick<ShoppingListItem, "rawText" | "quantity" | "notes" | "priority">>,
): AppState {
  return mapItem(state, listId, itemId, (i) => ({
    ...i,
    ...patch,
    quantity: patch.quantity != null ? Math.max(1, patch.quantity) : i.quantity,
    updatedAt: now(),
  }));
}

export function removeItem(
  state: AppState,
  listId: string,
  itemId: string,
): AppState {
  return mapList(state, listId, (l) => ({
    ...l,
    items: l.items.filter((i) => i.id !== itemId),
  }));
}

export function matchItem(
  state: AppState,
  listId: string,
  itemId: string,
  product: Product,
): AppState {
  return mapItem(state, listId, itemId, (i) =>
    i.product ? replaceProduct(i, product) : assignProduct(i, product),
  );
}

export function unmatchItem(
  state: AppState,
  listId: string,
  itemId: string,
): AppState {
  return mapItem(state, listId, itemId, (i) => clearMatch(i));
}

export function setItemStatus(
  state: AppState,
  listId: string,
  itemId: string,
  status: ItemStatus,
  collectedBy?: string,
): AppState {
  return mapItem(state, listId, itemId, (i) => {
    if (!canTransition(i.status, status)) return i;
    return {
      ...i,
      status,
      collectedBy:
        status === "collected" ? collectedBy ?? i.collectedBy : i.collectedBy,
      updatedAt: now(),
    };
  });
}

export function restoreItem(
  state: AppState,
  listId: string,
  itemId: string,
): AppState {
  return mapItem(state, listId, itemId, (i) => ({
    ...i,
    status: i.product ? "available" : "unmatched",
    collectedBy: undefined,
    updatedAt: now(),
  }));
}

// ---- Members ----

export function inviteMember(
  state: AppState,
  listId: string,
  email: string,
): AppState {
  const clean = email.trim().toLowerCase();
  if (!clean) return state;
  return mapList(state, listId, (l) => {
    if (l.members.some((m) => m.email.toLowerCase() === clean)) return l;
    return {
      ...l,
      members: [
        ...l.members,
        {
          id: uid("member"),
          listId,
          email: clean,
          displayName: displayNameFromEmail(clean),
          role: "member",
          joinedAt: now(),
        },
      ],
    };
  });
}

export function removeMember(
  state: AppState,
  listId: string,
  memberId: string,
): AppState {
  return mapList(state, listId, (l) => ({
    ...l,
    members: l.members.filter((m) => m.id !== memberId || m.role === "owner"),
  }));
}

// ---- Saved products & history ----

export function saveProduct(state: AppState, product: Product): AppState {
  if (state.savedProducts.some((s) => s.product.id === product.id)) return state;
  return {
    ...state,
    savedProducts: [
      { id: uid("saved"), userId: state.sessionUserId!, product, savedAt: now() },
      ...state.savedProducts,
    ],
  };
}

export function recordPurchase(
  state: AppState,
  entry: Omit<PurchaseHistory, "id" | "userId" | "purchasedAt">,
): AppState {
  return {
    ...state,
    purchaseHistory: [
      { ...entry, id: uid("hist"), userId: state.sessionUserId!, purchasedAt: now() },
      ...state.purchaseHistory,
    ],
  };
}

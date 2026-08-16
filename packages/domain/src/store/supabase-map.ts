import type {
  ItemPriority,
  ItemStatus,
  Product,
  ShoppingList,
  ShoppingListItem,
  ShoppingListMember,
} from "../types";

// ---- Row shapes (subset of the columns we read/write) ----

export interface ListRow {
  id: string;
  owner_id: string;
  name: string;
  notes: string | null;
  budget: number | null;
  store_id: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
  shopping_list_items?: ItemRow[];
  shopping_list_members?: MemberRow[];
}

export interface ItemRow {
  id: string;
  list_id: string;
  raw_text: string;
  quantity: number;
  notes: string | null;
  priority: string;
  status: string;
  product: Product | null;
  substitute_for: string | null;
  collected_by: string | null;
  updated_at: string;
}

export interface MemberRow {
  id: string;
  list_id: string;
  user_id: string | null;
  email: string;
  display_name: string;
  role: string;
  joined_at: string;
}

// ---- Row → domain ----

export function rowToItem(r: ItemRow): ShoppingListItem {
  return {
    id: r.id,
    listId: r.list_id,
    rawText: r.raw_text,
    quantity: r.quantity,
    notes: r.notes ?? undefined,
    priority: r.priority as ItemPriority,
    status: r.status as ItemStatus,
    product: r.product ?? undefined,
    substituteFor: r.substitute_for ?? undefined,
    collectedBy: r.collected_by ?? undefined,
    updatedAt: r.updated_at,
  };
}

export function rowToMember(r: MemberRow): ShoppingListMember {
  return {
    id: r.id,
    listId: r.list_id,
    email: r.email,
    displayName: r.display_name,
    role: r.role === "owner" ? "owner" : "member",
    joinedAt: r.joined_at,
  };
}

export function rowToList(r: ListRow): ShoppingList {
  return {
    id: r.id,
    ownerId: r.owner_id,
    name: r.name,
    notes: r.notes ?? undefined,
    budget: r.budget ?? undefined,
    storeId: r.store_id ?? undefined,
    archived: r.archived,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    items: (r.shopping_list_items ?? []).map(rowToItem),
    members: (r.shopping_list_members ?? []).map(rowToMember),
  };
}

// ---- Domain → row (for inserts/updates) ----

export function itemToRow(i: ShoppingListItem): ItemRow {
  return {
    id: i.id,
    list_id: i.listId,
    raw_text: i.rawText,
    quantity: i.quantity,
    notes: i.notes ?? null,
    priority: i.priority,
    status: i.status,
    product: i.product ?? null,
    substitute_for: i.substituteFor ?? null,
    collected_by: i.collectedBy ?? null,
    updated_at: i.updatedAt,
  };
}

export function memberToRow(m: ShoppingListMember): Omit<MemberRow, "user_id"> {
  return {
    id: m.id,
    list_id: m.listId,
    email: m.email,
    display_name: m.displayName,
    role: m.role,
    joined_at: m.joinedAt,
  };
}

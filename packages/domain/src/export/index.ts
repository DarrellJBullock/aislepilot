// "Download my data": everything a user has in AislePilot, as JSON (complete)
// and CSV (spreadsheet-friendly). Pure functions so web and mobile share them.
import type { Profile, PurchaseHistory, SavedProduct, ShoppingList } from "../types";
import { effectiveUnitPrice, hasCurrentPrice } from "../pricing";

export interface ExportInput {
  profile: Pick<Profile, "id" | "email" | "displayName" | "createdAt"> | null;
  lists: ShoppingList[];
  savedProducts: SavedProduct[];
  purchaseHistory: PurchaseHistory[];
}

export function buildUserExport(input: ExportInput, exportedAt = new Date().toISOString()) {
  return {
    format: "aislepilot-export",
    version: 1,
    exportedAt,
    account: input.profile && {
      email: input.profile.email,
      displayName: input.profile.displayName,
      createdAt: input.profile.createdAt,
    },
    lists: input.lists.map((l) => ({
      name: l.name,
      notes: l.notes ?? null,
      budget: l.budget ?? null,
      storeId: l.storeId ?? null,
      archived: l.archived,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
      members: l.members.map((m) => ({ email: m.email, displayName: m.displayName, role: m.role })),
      items: l.items.map((i) => ({
        text: i.rawText,
        quantity: i.quantity,
        status: i.status,
        priority: i.priority,
        notes: i.notes ?? null,
        product: i.product
          ? {
              name: i.product.name,
              brand: i.product.brand ?? null,
              size: i.product.size ?? null,
              upc: i.product.upc ?? null,
              department: i.product.department ?? null,
              aisle: i.product.aisle ?? null,
              price: hasCurrentPrice(i.product) ? effectiveUnitPrice(i.product) : null,
              pricedAt: i.product.pricedAt ?? null,
            }
          : null,
      })),
    })),
    savedProducts: input.savedProducts.map((s) => ({
      name: s.product.name,
      brand: s.product.brand ?? null,
      size: s.product.size ?? null,
      upc: s.product.upc ?? null,
      savedAt: s.savedAt,
    })),
    purchaseHistory: input.purchaseHistory.map((h) => ({
      purchasedAt: h.purchasedAt,
      storeId: h.storeId,
      itemCount: h.itemCount,
      total: h.total,
    })),
  };
}

function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  // Quote anything with a delimiter/quote/newline; neutralise spreadsheet formulas.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** One row per list item: opens directly in Excel / Google Sheets. */
export function itemsToCsv(lists: ShoppingList[]): string {
  const header = ["List", "Item", "Quantity", "Status", "Product", "Brand", "Size", "Price", "Notes"];
  const rows = lists.flatMap((l) =>
    l.items.map((i) => [
      l.name,
      i.rawText,
      i.quantity,
      i.status,
      i.product?.name,
      i.product?.brand,
      i.product?.size,
      i.product && hasCurrentPrice(i.product) ? effectiveUnitPrice(i.product).toFixed(2) : "",
      i.notes,
    ]),
  );
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

export function exportFilename(kind: "json" | "csv", now = new Date()): string {
  return `aislepilot-export-${now.toISOString().slice(0, 10)}.${kind}`;
}

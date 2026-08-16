import type { ShoppingListItem, Store } from "../types";

export type SortMode = "route" | "price" | "name" | "status";

function routeOrderFor(item: ShoppingListItem, store?: Store): number {
  const product = item.product;
  if (product?.routeOrder != null) return product.routeOrder;
  if (product?.department && store) {
    const dept = store.departments.find(
      (d) => d.name.toLowerCase() === product.department!.toLowerCase(),
    );
    if (dept) return dept.routeOrder;
  }
  return 999; // unmatched / unknown department sorts last
}

import { effectiveUnitPrice } from "../pricing";

export function sortItems(
  items: ShoppingListItem[],
  mode: SortMode,
  store?: Store,
): ShoppingListItem[] {
  const copy = [...items];
  switch (mode) {
    case "route":
      return copy.sort(
        (a, b) =>
          routeOrderFor(a, store) - routeOrderFor(b, store) ||
          a.rawText.localeCompare(b.rawText),
      );
    case "price":
      return copy.sort(
        (a, b) => effectiveUnitPrice(b.product) - effectiveUnitPrice(a.product),
      );
    case "name":
      return copy.sort((a, b) => a.rawText.localeCompare(b.rawText));
    case "status":
      return copy.sort((a, b) => a.status.localeCompare(b.status));
    default:
      return copy;
  }
}

export interface DepartmentGroup {
  department: string;
  routeOrder: number;
  items: ShoppingListItem[];
}

/** Group items by department in store-route order. */
export function groupByDepartment(
  items: ShoppingListItem[],
  store?: Store,
): DepartmentGroup[] {
  const groups = new Map<string, DepartmentGroup>();
  for (const item of items) {
    const dept = item.product?.department ?? "Unsorted";
    if (!groups.has(dept)) {
      groups.set(dept, {
        department: dept,
        routeOrder: routeOrderFor(item, store),
        items: [],
      });
    }
    const g = groups.get(dept)!;
    g.items.push(item);
    g.routeOrder = Math.min(g.routeOrder, routeOrderFor(item, store));
  }
  return [...groups.values()].sort((a, b) => a.routeOrder - b.routeOrder);
}

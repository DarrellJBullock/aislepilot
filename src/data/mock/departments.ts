import type { StoreDepartment } from "@/domain/types";

// Route order reflects a typical store walk: produce first, checkout last.
export const DEPARTMENTS: StoreDepartment[] = [
  { id: "produce", name: "Produce", routeOrder: 10 },
  { id: "bakery", name: "Bakery", routeOrder: 20 },
  { id: "deli", name: "Deli", routeOrder: 30 },
  { id: "meat", name: "Meat", routeOrder: 40 },
  { id: "seafood", name: "Seafood", routeOrder: 50 },
  { id: "dairy", name: "Dairy", routeOrder: 60 },
  { id: "frozen", name: "Frozen", routeOrder: 70 },
  { id: "pantry", name: "Pantry", routeOrder: 80 },
  { id: "beverages", name: "Beverages", routeOrder: 90 },
  { id: "household", name: "Household", routeOrder: 100 },
  { id: "personal-care", name: "Personal Care", routeOrder: 110 },
  { id: "checkout", name: "Checkout", routeOrder: 200 },
];

export function departmentRouteOrder(name: string): number {
  return (
    DEPARTMENTS.find((d) => d.name.toLowerCase() === name.toLowerCase())
      ?.routeOrder ?? 999
  );
}

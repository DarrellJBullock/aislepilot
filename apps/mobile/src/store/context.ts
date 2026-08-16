// Ported from the web app's src/lib/store/context.ts — identical interface,
// so screens are written once against `useApp()` regardless of platform.
import { createContext, useContext } from "react";
import type {
  ItemPriority,
  ItemStatus,
  Product,
  Profile,
  ShoppingList,
} from "@aislepilot/domain/types";
import type * as S from "@aislepilot/domain/store/state";

export interface AppContextValue {
  ready: boolean;
  profile: Profile | null;
  lists: ShoppingList[];
  savedProducts: S.AppState["savedProducts"];
  purchaseHistory: S.AppState["purchaseHistory"];
  signUp: (
    email: string,
    password: string,
    displayName?: string,
  ) => string | null | Promise<string | null>;
  signIn: (email: string, password: string) => string | null | Promise<string | null>;
  signOut: () => void;
  updateProfile: (patch: Partial<Pick<Profile, "displayName">>) => void;
  createList: (input: {
    name: string;
    budget?: number;
    storeId?: string;
    notes?: string;
  }) => string;
  updateList: (id: string, patch: Parameters<typeof S.updateList>[2]) => void;
  deleteList: (id: string) => void;
  duplicateList: (id: string) => string;
  getList: (id: string) => ShoppingList | undefined;
  addItem: (listId: string, input: Parameters<typeof S.addItem>[2]) => void;
  addItemsBulk: (listId: string, text: string) => void;
  addMatchedItem: (listId: string, product: Product, quantity?: number) => void;
  updateItem: (listId: string, itemId: string, patch: Parameters<typeof S.updateItem>[3]) => void;
  removeItem: (listId: string, itemId: string) => void;
  matchItem: (listId: string, itemId: string, product: Product) => void;
  unmatchItem: (listId: string, itemId: string) => void;
  setItemStatus: (
    listId: string,
    itemId: string,
    status: ItemStatus,
    collectedBy?: string,
  ) => void;
  setItemPriority: (listId: string, itemId: string, priority: ItemPriority) => void;
  restoreItem: (listId: string, itemId: string) => void;
  inviteMember: (listId: string, email: string) => void;
  removeMember: (listId: string, memberId: string) => void;
  saveProduct: (product: Product) => void;
  recordPurchase: (entry: Parameters<typeof S.recordPurchase>[1]) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

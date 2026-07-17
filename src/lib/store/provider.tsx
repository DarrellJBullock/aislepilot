"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type {
  ItemPriority,
  ItemStatus,
  Product,
  Profile,
  ShoppingList,
} from "@/domain/types";
import * as S from "./state";
import * as Auth from "./auth";
import { seedDemoState } from "./seed";

const STORAGE_KEY = "aislepilot:v1";

interface AppContextValue {
  ready: boolean;
  profile: Profile | null;
  lists: ShoppingList[];
  savedProducts: S.AppState["savedProducts"];
  purchaseHistory: S.AppState["purchaseHistory"];
  // auth
  signUp: (email: string, password: string, displayName?: string) => string | null;
  signIn: (email: string, password: string) => string | null;
  signOut: () => void;
  updateProfile: (patch: Partial<Pick<Profile, "displayName">>) => void;
  // lists
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
  // items
  addItem: (listId: string, input: Parameters<typeof S.addItem>[2]) => void;
  addItemsBulk: (listId: string, text: string) => void;
  addMatchedItem: (listId: string, product: Product, quantity?: number) => void;
  updateItem: (
    listId: string,
    itemId: string,
    patch: Parameters<typeof S.updateItem>[3],
  ) => void;
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
  // members
  inviteMember: (listId: string, email: string) => void;
  removeMember: (listId: string, memberId: string) => void;
  // saved / history
  saveProduct: (product: Product) => void;
  recordPurchase: (entry: Parameters<typeof S.recordPurchase>[1]) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<S.AppState>(() => S.emptyState());
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  // Hydrate from localStorage (or seed) on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setState(JSON.parse(raw) as S.AppState);
      } else {
        setState(seedDemoState());
      }
    } catch {
      setState(seedDemoState());
    }
    hydrated.current = true;
    setReady(true);
  }, []);

  // Persist on change (after hydration).
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [state]);

  const collectorName = state.sessionUserId
    ? state.profiles[state.sessionUserId]?.displayName
    : undefined;

  const value = useMemo<AppContextValue>(() => {
    const scoped = (lists: ShoppingList[]) =>
      lists.filter(
        (l) =>
          l.ownerId === state.sessionUserId ||
          l.members.some(
            (m) =>
              m.email ===
              state.profiles[state.sessionUserId ?? ""]?.email,
          ),
      );

    return {
      ready,
      profile: Auth.currentProfile(state),
      lists: scoped(state.lists),
      savedProducts: state.savedProducts,
      purchaseHistory: state.purchaseHistory,

      signUp: (email, password, displayName) => {
        let err: string | null = null;
        setState((s) => {
          const res = Auth.signUp(s, email, password, displayName);
          err = res.error ?? null;
          return res.state;
        });
        return err;
      },
      signIn: (email, password) => {
        let err: string | null = null;
        setState((s) => {
          const res = Auth.signIn(s, email, password);
          err = res.error ?? null;
          return res.state;
        });
        return err;
      },
      signOut: () => setState((s) => Auth.signOut(s)),
      updateProfile: (patch) => setState((s) => Auth.updateProfile(s, patch)),

      createList: (input) => {
        let id = "";
        setState((s) => {
          const res = S.createList(s, input);
          id = res.id;
          return res.state;
        });
        return id;
      },
      updateList: (id, patch) => setState((s) => S.updateList(s, id, patch)),
      deleteList: (id) => setState((s) => S.deleteList(s, id)),
      duplicateList: (id) => {
        let newId = id;
        setState((s) => {
          const res = S.duplicateList(s, id);
          newId = res.id;
          return res.state;
        });
        return newId;
      },
      getList: (id) => state.lists.find((l) => l.id === id),

      addItem: (listId, input) => setState((s) => S.addItem(s, listId, input)),
      addItemsBulk: (listId, text) =>
        setState((s) => S.addItemsBulk(s, listId, text)),
      addMatchedItem: (listId, product, quantity) =>
        setState((s) => S.addMatchedItem(s, listId, product, quantity)),
      updateItem: (listId, itemId, patch) =>
        setState((s) => S.updateItem(s, listId, itemId, patch)),
      removeItem: (listId, itemId) =>
        setState((s) => S.removeItem(s, listId, itemId)),
      matchItem: (listId, itemId, product) =>
        setState((s) => S.matchItem(s, listId, itemId, product)),
      unmatchItem: (listId, itemId) =>
        setState((s) => S.unmatchItem(s, listId, itemId)),
      setItemStatus: (listId, itemId, status, collectedBy) =>
        setState((s) =>
          S.setItemStatus(s, listId, itemId, status, collectedBy ?? collectorName),
        ),
      setItemPriority: (listId, itemId, priority) =>
        setState((s) => S.updateItem(s, listId, itemId, { priority })),
      restoreItem: (listId, itemId) =>
        setState((s) => S.restoreItem(s, listId, itemId)),

      inviteMember: (listId, email) =>
        setState((s) => S.inviteMember(s, listId, email)),
      removeMember: (listId, memberId) =>
        setState((s) => S.removeMember(s, listId, memberId)),

      saveProduct: (product) => setState((s) => S.saveProduct(s, product)),
      recordPurchase: (entry) => setState((s) => S.recordPurchase(s, entry)),
    };
  }, [state, ready, collectorName]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

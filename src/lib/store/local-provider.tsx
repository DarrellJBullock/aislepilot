"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { ShoppingList } from "@aislepilot/domain/types";
import * as S from "@aislepilot/domain/store/state";
import * as Auth from "./auth";
import { seedDemoState } from "./seed";
import { AppContext, type AppContextValue } from "./context";

const STORAGE_KEY = "aislepilot:v1";

/** localStorage-backed store — the zero-credential mock mode. */
export function LocalAppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<S.AppState>(() => S.emptyState());
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setState(raw ? (JSON.parse(raw) as S.AppState) : seedDemoState());
    } catch {
      setState(seedDemoState());
    }
    hydrated.current = true;
    setReady(true);
  }, []);

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
            (m) => m.email === state.profiles[state.sessionUserId ?? ""]?.email,
          ),
      );

    return {
      ready,
      backend: "local",
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

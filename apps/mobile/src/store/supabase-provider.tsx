// Ported from the web app's src/lib/store/supabase-provider.tsx — same
// reducer ops (@aislepilot/domain/store/state), same row mapping
// (@aislepilot/domain/store/supabase-map), same realtime subscription
// pattern. Only the client construction differs (SecureStore vs browser
// cookies — see ../lib/supabase.ts).
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@aislepilot/domain/types";
import * as S from "@aislepilot/domain/store/state";
import { rowToList, itemToRow, memberToRow, type ListRow } from "@aislepilot/domain/store/supabase-map";
import { displayNameFromEmail } from "@aislepilot/domain/utils";
import type { WriteOp } from "@aislepilot/domain/sync/queue";
import { getSupabase } from "../lib/supabase";
import { enqueueOps, flushQueue } from "../lib/sync-queue";
import { useOnlineStatus } from "../lib/use-online-status";
import { notifyListMembers } from "../lib/notify";
import { AppContext, type AppContextValue } from "./context";

const SELECT = "*, shopping_list_items(*), shopping_list_members(*)";

export function SupabaseAppProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => getSupabase(), []);
  const [state, setState] = useState<S.AppState>(() => S.emptyState());
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const channelRef = useRef<ReturnType<SupabaseClient["channel"]> | null>(null);
  const online = useOnlineStatus();

  const apply = useCallback((fn: (s: S.AppState) => S.AppState) => {
    const prev = stateRef.current;
    const next = fn(prev);
    stateRef.current = next;
    setState(next);
    return { prev, next };
  }, []);

  const loadLists = useCallback(async (db: SupabaseClient) => {
    const { data, error } = await db.from("shopping_lists").select(SELECT);
    if (error) {
      console.error("[supabase] load lists failed:", error);
      return;
    }
    const lists = ((data ?? []) as ListRow[])
      .map(rowToList)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    setState((s) => {
      const next = { ...s, lists };
      stateRef.current = next;
      return next;
    });
  }, []);

  const setSession = useCallback(
    async (db: SupabaseClient, userId: string, email: string) => {
      const { data: prof } = await db
        .from("profiles")
        .select("id,email,display_name,created_at")
        .eq("id", userId)
        .maybeSingle();
      const profile: Profile & { password: string } = {
        id: userId,
        email,
        displayName: prof?.display_name || displayNameFromEmail(email),
        createdAt: prof?.created_at || new Date().toISOString(),
        password: "",
      };
      setState((s) => {
        const next: S.AppState = {
          ...s,
          sessionUserId: userId,
          profiles: { ...s.profiles, [userId]: profile },
        };
        stateRef.current = next;
        return next;
      });
      await loadLists(db);
    },
    [loadLists],
  );

  useEffect(() => {
    if (!supabase) return;
    const db = supabase;

    const ensureRealtime = () => {
      if (channelRef.current) return;
      channelRef.current = db
        .channel("aislepilot-lists")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "shopping_list_items" },
          () => loadLists(db),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "shopping_lists" },
          () => loadLists(db),
        )
        .subscribe();
    };

    const teardownRealtime = () => {
      if (channelRef.current) {
        db.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };

    (async () => {
      const { data } = await db.auth.getSession();
      const session = data.session;
      if (session?.user) {
        await setSession(db, session.user.id, session.user.email ?? "");
        ensureRealtime();
      }
      setReady(true);
    })();

    const { data: sub } = db.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSession(db, session.user.id, session.user.email ?? "");
        ensureRealtime();
      } else {
        setState(S.emptyState());
        stateRef.current = S.emptyState();
        teardownRealtime();
      }
    });

    return () => {
      sub.subscription.unsubscribe();
      teardownRealtime();
    };
  }, [supabase, setSession, loadLists]);

  // Retry anything left in the queue (from a dropped connection, or a
  // killed app with unsent writes) as soon as there's a client to use and
  // the network's back.
  useEffect(() => {
    if (online && supabase) void flushQueue(supabase);
  }, [online, supabase]);

  const value = useMemo<AppContextValue>(() => {
    const db = supabase!;
    const uid = state.sessionUserId;
    const profile = uid ? state.profiles[uid] : null;
    const collectorName = profile?.displayName;

    // Every write goes through the durable queue: enqueue first (so it
    // survives even if the app is killed before the network call returns),
    // then attempt to drain it immediately — the common online case still
    // resolves in one round trip, but nothing is lost if it doesn't.
    const runChain = (ops: WriteOp[]) => {
      enqueueOps(ops);
      void flushQueue(db);
    };
    const run = (op: WriteOp) => runChain([op]);

    const newItemsIn = (prev: S.AppState, next: S.AppState, listId: string) => {
      const prevIds = new Set(
        prev.lists.find((l) => l.id === listId)?.items.map((i) => i.id) ?? [],
      );
      return next.lists.find((l) => l.id === listId)?.items.filter((i) => !prevIds.has(i.id)) ?? [];
    };
    const itemById = (s: S.AppState, listId: string, itemId: string) =>
      s.lists.find((l) => l.id === listId)?.items.find((i) => i.id === itemId);

    // Only worth a push once a list actually has other people on it.
    const notifyIfShared = (
      s: S.AppState,
      listId: string,
      event: Parameters<typeof notifyListMembers>[0]["event"],
      title: string,
      body: string,
    ) => {
      if (!uid) return;
      const list = s.lists.find((l) => l.id === listId);
      if (!list || list.members.length < 2) return;
      notifyListMembers({ listId, actorUserId: uid, event, title, body });
    };

    return {
      ready,
      profile: profile
        ? { id: profile.id, email: profile.email, displayName: profile.displayName, createdAt: profile.createdAt }
        : null,
      lists: state.lists,
      savedProducts: state.savedProducts,
      purchaseHistory: state.purchaseHistory,

      signUp: async (email, password, displayName) => {
        const { data, error } = await db.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName || displayNameFromEmail(email) } },
        });
        if (error) return error.message;
        if (!data.session || !data.user) {
          return "Check your email to confirm your account, then sign in.";
        }
        await setSession(db, data.user.id, data.user.email ?? email);
        return null;
      },
      signIn: async (email, password) => {
        const { data, error } = await db.auth.signInWithPassword({ email, password });
        if (error) return error.message;
        if (data.user) await setSession(db, data.user.id, data.user.email ?? email);
        return null;
      },
      signOut: () => {
        db.auth.signOut();
      },
      updateProfile: (patch) => {
        if (!uid) return;
        apply((s) => ({
          ...s,
          profiles: { ...s.profiles, [uid]: { ...s.profiles[uid], ...patch } },
        }));
        if (patch.displayName != null) {
          run({ table: "profiles", kind: "update", recordId: uid, patch: { display_name: patch.displayName } });
        }
      },

      createList: (input) => {
        const { next } = apply((s) => S.createList(s, input).state);
        const created = next.lists[0];
        const owner = created.members[0];
        // The owner-member insert's RLS policy requires the shopping_lists
        // row to already exist with owner_id = auth.uid(), so it's queued
        // as a two-step chain (drained strictly in order) rather than
        // fired concurrently — otherwise it can race ahead of the list row
        // being committed and get rejected with "new row violates row-level
        // security policy".
        runChain([
          {
            table: "shopping_lists",
            kind: "insert",
            rows: [
              {
                id: created.id,
                owner_id: uid,
                name: created.name,
                notes: created.notes ?? null,
                budget: created.budget ?? null,
                store_id: created.storeId ?? null,
                archived: created.archived,
              },
            ],
          },
          {
            table: "shopping_list_members",
            kind: "insert",
            rows: [
              {
                id: owner.id,
                list_id: created.id,
                user_id: uid,
                email: owner.email,
                display_name: owner.displayName,
                role: "owner",
              },
            ],
          },
        ]);
        return created.id;
      },
      updateList: (id, patch) => {
        apply((s) => S.updateList(s, id, patch));
        const row: Record<string, unknown> = {};
        if (patch.name != null) row.name = patch.name;
        if ("budget" in patch) row.budget = patch.budget ?? null;
        if ("notes" in patch) row.notes = patch.notes ?? null;
        if ("storeId" in patch) row.store_id = patch.storeId ?? null;
        if ("archived" in patch) row.archived = patch.archived;
        run({ table: "shopping_lists", kind: "update", recordId: id, patch: row });
      },
      deleteList: (id) => {
        apply((s) => S.deleteList(s, id));
        run({ table: "shopping_lists", kind: "delete", recordId: id });
      },
      duplicateList: (id) => {
        const { next } = apply((s) => S.duplicateList(s, id).state);
        const copy = next.lists[0];
        // Same ordering requirement as createList: members/items policies
        // require the list row (and, for items, a member row) to already
        // exist, so each insert is a chained step, drained in order.
        const ops: WriteOp[] = [
          {
            table: "shopping_lists",
            kind: "insert",
            rows: [
              {
                id: copy.id,
                owner_id: uid,
                name: copy.name,
                notes: copy.notes ?? null,
                budget: copy.budget ?? null,
                store_id: copy.storeId ?? null,
                archived: copy.archived,
              },
            ],
          },
        ];
        if (copy.members.length) {
          ops.push({
            table: "shopping_list_members",
            kind: "insert",
            rows: copy.members.map((m) => ({
              id: m.id,
              list_id: copy.id,
              user_id: m.role === "owner" ? uid : null,
              email: m.email,
              display_name: m.displayName,
              role: m.role,
            })),
          });
        }
        if (copy.items.length) {
          ops.push({ table: "shopping_list_items", kind: "insert", rows: copy.items.map(itemToRow) });
        }
        runChain(ops);
        return copy.id;
      },
      getList: (id) => stateRef.current.lists.find((l) => l.id === id),

      addItem: (listId, input) => {
        const { prev, next } = apply((s) => S.addItem(s, listId, input));
        const added = newItemsIn(prev, next, listId);
        if (added.length) {
          run({ table: "shopping_list_items", kind: "insert", rows: added.map(itemToRow) });
          const list = next.lists.find((l) => l.id === listId);
          notifyIfShared(
            next,
            listId,
            "items_added",
            list?.name ?? "Shopping list",
            `${collectorName ?? "Someone"} added ${added[0].rawText}${added.length > 1 ? ` and ${added.length - 1} more` : ""}`,
          );
        }
      },
      addItemsBulk: (listId, text) => {
        const { prev, next } = apply((s) => S.addItemsBulk(s, listId, text));
        const added = newItemsIn(prev, next, listId);
        if (added.length) {
          run({ table: "shopping_list_items", kind: "insert", rows: added.map(itemToRow) });
          const list = next.lists.find((l) => l.id === listId);
          notifyIfShared(
            next,
            listId,
            "items_added",
            list?.name ?? "Shopping list",
            `${collectorName ?? "Someone"} added ${added.length} item${added.length === 1 ? "" : "s"}`,
          );
        }
      },
      addMatchedItem: (listId, product, quantity) => {
        const { prev, next } = apply((s) => S.addMatchedItem(s, listId, product, quantity));
        const added = newItemsIn(prev, next, listId);
        if (added.length) {
          run({ table: "shopping_list_items", kind: "insert", rows: added.map(itemToRow) });
          const list = next.lists.find((l) => l.id === listId);
          notifyIfShared(
            next,
            listId,
            "items_added",
            list?.name ?? "Shopping list",
            `${collectorName ?? "Someone"} added ${product.name}`,
          );
        }
      },
      updateItem: (listId, itemId, patch) => {
        const { next } = apply((s) => S.updateItem(s, listId, itemId, patch));
        const item = itemById(next, listId, itemId);
        if (item) run({ table: "shopping_list_items", kind: "update", recordId: itemId, patch: itemToRow(item) });
      },
      removeItem: (listId, itemId) => {
        apply((s) => S.removeItem(s, listId, itemId));
        run({ table: "shopping_list_items", kind: "delete", recordId: itemId });
      },
      matchItem: (listId, itemId, product) => {
        const { next } = apply((s) => S.matchItem(s, listId, itemId, product));
        const item = itemById(next, listId, itemId);
        if (item) run({ table: "shopping_list_items", kind: "update", recordId: itemId, patch: itemToRow(item) });
      },
      unmatchItem: (listId, itemId) => {
        const { next } = apply((s) => S.unmatchItem(s, listId, itemId));
        const item = itemById(next, listId, itemId);
        if (item) run({ table: "shopping_list_items", kind: "update", recordId: itemId, patch: itemToRow(item) });
      },
      setItemStatus: (listId, itemId, status, collectedBy) => {
        const { next } = apply((s) =>
          S.setItemStatus(s, listId, itemId, status, collectedBy ?? collectorName),
        );
        const item = itemById(next, listId, itemId);
        if (item) {
          run({ table: "shopping_list_items", kind: "update", recordId: itemId, patch: itemToRow(item) });
          if (status === "collected") {
            const list = next.lists.find((l) => l.id === listId);
            notifyIfShared(
              next,
              listId,
              "item_collected",
              list?.name ?? "Shopping list",
              `${collectorName ?? "Someone"} collected ${item.rawText}`,
            );
          }
        }
      },
      setItemPriority: (listId, itemId, priority) => {
        const { next } = apply((s) => S.updateItem(s, listId, itemId, { priority }));
        const item = itemById(next, listId, itemId);
        if (item) run({ table: "shopping_list_items", kind: "update", recordId: itemId, patch: itemToRow(item) });
      },
      restoreItem: (listId, itemId) => {
        const { next } = apply((s) => S.restoreItem(s, listId, itemId));
        const item = itemById(next, listId, itemId);
        if (item) run({ table: "shopping_list_items", kind: "update", recordId: itemId, patch: itemToRow(item) });
      },

      inviteMember: (listId, email) => {
        const { prev, next } = apply((s) => S.inviteMember(s, listId, email));
        const before = new Set(
          prev.lists.find((l) => l.id === listId)?.members.map((m) => m.id) ?? [],
        );
        const added = next.lists.find((l) => l.id === listId)?.members.filter((m) => !before.has(m.id));
        if (added?.length) {
          run({
            table: "shopping_list_members",
            kind: "insert",
            rows: added.map((m) => ({ ...memberToRow(m), user_id: null })),
          });
          const list = next.lists.find((l) => l.id === listId);
          notifyIfShared(
            next,
            listId,
            "member_invited",
            list?.name ?? "Shopping list",
            `${collectorName ?? "Someone"} invited ${email} to the list`,
          );
        }
      },
      removeMember: (listId, memberId) => {
        apply((s) => S.removeMember(s, listId, memberId));
        run({ table: "shopping_list_members", kind: "delete", recordId: memberId });
      },

      saveProduct: (product) => {
        const { next } = apply((s) => S.saveProduct(s, product));
        const saved = next.savedProducts[0];
        if (saved) run({ table: "saved_products", kind: "insert", rows: [{ id: saved.id, user_id: uid, product }] });
      },
      recordPurchase: (entry) => {
        const { next } = apply((s) => S.recordPurchase(s, entry));
        const h = next.purchaseHistory[0];
        if (h)
          run({
            table: "purchase_history",
            kind: "insert",
            rows: [
              {
                id: h.id,
                user_id: uid,
                list_id: entry.listId,
                store_id: entry.storeId,
                total: entry.total,
                item_count: entry.itemCount,
              },
            ],
          });
      },
    };
  }, [supabase, state, ready, apply, setSession]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

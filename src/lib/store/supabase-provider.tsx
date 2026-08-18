"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@aislepilot/domain/types";
import * as S from "@aislepilot/domain/store/state";
import { createClient } from "@/lib/supabase/client";
import { notifyListMembers } from "@/lib/notify";
import { AppContext, type AppContextValue } from "./context";
import { rowToList, itemToRow, memberToRow, type ListRow } from "@aislepilot/domain/store/supabase-map";
import { displayNameFromEmail } from "@aislepilot/domain/utils";

const SELECT = "*, shopping_list_items(*), shopping_list_members(*)";

/** Supabase Auth + Postgres store. Optimistic local state, mirrored writes. */
export function SupabaseAppProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<S.AppState>(() => S.emptyState());
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const channelRef = useRef<ReturnType<SupabaseClient["channel"]> | null>(null);

  // Apply a pure state op synchronously so callers can read the result + push
  // the corresponding write to Supabase.
  const apply = useCallback((fn: (s: S.AppState) => S.AppState) => {
    const prev = stateRef.current;
    const next = fn(prev);
    stateRef.current = next;
    setState(next);
    return { prev, next };
  }, []);

  const run = useCallback((p: PromiseLike<{ error: unknown }>) => {
    Promise.resolve(p).then(({ error }) => {
      if (error) console.error("[supabase] write failed:", error);
    });
  }, []);

  const loadLists = useCallback(
    async (db: SupabaseClient) => {
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
    },
    [],
  );

  const setSession = useCallback(
    async (db: SupabaseClient, userId: string, email: string) => {
      // Load profile row (created by the DB trigger); fall back to metadata.
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

  // Initial session + auth subscription + realtime.
  useEffect(() => {
    if (!supabase) return;
    const db = supabase;

    // Create the realtime channel exactly once (guarded by a ref). Calling
    // db.channel() with the same topic reuses an existing channel, and adding
    // `.on()` after `.subscribe()` throws — hence the single-instance guard.
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

  const value = useMemo<AppContextValue>(() => {
    const db = supabase!;
    const uid = state.sessionUserId;
    const profile = uid ? state.profiles[uid] : null;
    const collectorName = profile?.displayName;

    const newItemsIn = (prev: S.AppState, next: S.AppState, listId: string) => {
      const prevIds = new Set(
        prev.lists.find((l) => l.id === listId)?.items.map((i) => i.id) ?? [],
      );
      return (
        next.lists.find((l) => l.id === listId)?.items.filter((i) => !prevIds.has(i.id)) ??
        []
      );
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
      backend: "supabase",
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
          run(db.from("profiles").update({ display_name: patch.displayName }).eq("id", uid));
        }
      },

      createList: (input) => {
        const { next } = apply((s) => S.createList(s, input).state);
        const created = next.lists[0]; // newest is first
        const owner = created.members[0];
        // The owner-member insert's RLS policy requires the shopping_lists
        // row to already exist with owner_id = auth.uid(), so it must be
        // chained after the list insert resolves, not fired concurrently —
        // otherwise it can race ahead of the list row being committed and
        // get rejected with "new row violates row-level security policy".
        run(
          db
            .from("shopping_lists")
            .insert({
              id: created.id,
              owner_id: uid,
              name: created.name,
              notes: created.notes ?? null,
              budget: created.budget ?? null,
              store_id: created.storeId ?? null,
              archived: created.archived,
            })
            .then((listResult) => {
              if (listResult.error) return listResult;
              return db.from("shopping_list_members").insert({
                id: owner.id,
                list_id: created.id,
                user_id: uid,
                email: owner.email,
                display_name: owner.displayName,
                role: "owner",
              });
            }),
        );
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
        run(db.from("shopping_lists").update(row).eq("id", id));
      },
      deleteList: (id) => {
        apply((s) => S.deleteList(s, id));
        run(db.from("shopping_lists").delete().eq("id", id));
      },
      duplicateList: (id) => {
        const { next } = apply((s) => S.duplicateList(s, id).state);
        const copy = next.lists[0];
        // Same ordering requirement as createList: members/items policies
        // require the list row (and, for items, a member row) to already
        // exist, so each insert must be chained after the previous commits.
        run(
          db
            .from("shopping_lists")
            .insert({
              id: copy.id,
              owner_id: uid,
              name: copy.name,
              notes: copy.notes ?? null,
              budget: copy.budget ?? null,
              store_id: copy.storeId ?? null,
              archived: copy.archived,
            })
            .then(async (listResult) => {
              if (listResult.error) return listResult;
              if (copy.members.length) {
                const membersResult = await db.from("shopping_list_members").insert(
                  copy.members.map((m) => ({
                    id: m.id,
                    list_id: copy.id,
                    user_id: m.role === "owner" ? uid : null,
                    email: m.email,
                    display_name: m.displayName,
                    role: m.role,
                  })),
                );
                if (membersResult.error) return membersResult;
              }
              if (copy.items.length) {
                return db.from("shopping_list_items").insert(copy.items.map(itemToRow));
              }
              return { error: null };
            }),
        );
        return copy.id;
      },
      getList: (id) => stateRef.current.lists.find((l) => l.id === id),

      addItem: (listId, input) => {
        const { prev, next } = apply((s) => S.addItem(s, listId, input));
        const added = newItemsIn(prev, next, listId);
        if (added.length) {
          run(db.from("shopping_list_items").insert(added.map(itemToRow)));
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
          run(db.from("shopping_list_items").insert(added.map(itemToRow)));
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
          run(db.from("shopping_list_items").insert(added.map(itemToRow)));
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
        if (item) run(db.from("shopping_list_items").update(itemToRow(item)).eq("id", itemId));
      },
      removeItem: (listId, itemId) => {
        apply((s) => S.removeItem(s, listId, itemId));
        run(db.from("shopping_list_items").delete().eq("id", itemId));
      },
      matchItem: (listId, itemId, product) => {
        const { next } = apply((s) => S.matchItem(s, listId, itemId, product));
        const item = itemById(next, listId, itemId);
        if (item) run(db.from("shopping_list_items").update(itemToRow(item)).eq("id", itemId));
      },
      unmatchItem: (listId, itemId) => {
        const { next } = apply((s) => S.unmatchItem(s, listId, itemId));
        const item = itemById(next, listId, itemId);
        if (item) run(db.from("shopping_list_items").update(itemToRow(item)).eq("id", itemId));
      },
      setItemStatus: (listId, itemId, status, collectedBy) => {
        const { next } = apply((s) =>
          S.setItemStatus(s, listId, itemId, status, collectedBy ?? collectorName),
        );
        const item = itemById(next, listId, itemId);
        if (item) {
          run(db.from("shopping_list_items").update(itemToRow(item)).eq("id", itemId));
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
        if (item) run(db.from("shopping_list_items").update(itemToRow(item)).eq("id", itemId));
      },
      restoreItem: (listId, itemId) => {
        const { next } = apply((s) => S.restoreItem(s, listId, itemId));
        const item = itemById(next, listId, itemId);
        if (item) run(db.from("shopping_list_items").update(itemToRow(item)).eq("id", itemId));
      },

      inviteMember: (listId, email) => {
        const { prev, next } = apply((s) => S.inviteMember(s, listId, email));
        const before = new Set(
          prev.lists.find((l) => l.id === listId)?.members.map((m) => m.id) ?? [],
        );
        const added = next.lists
          .find((l) => l.id === listId)
          ?.members.filter((m) => !before.has(m.id));
        if (added?.length) {
          run(
            db.from("shopping_list_members").insert(
              added.map((m) => ({ ...memberToRow(m), user_id: null })),
            ),
          );
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
        run(db.from("shopping_list_members").delete().eq("id", memberId));
      },

      saveProduct: (product) => {
        const { next } = apply((s) => S.saveProduct(s, product));
        const saved = next.savedProducts[0];
        if (saved) run(db.from("saved_products").insert({ id: saved.id, user_id: uid, product }));
      },
      recordPurchase: (entry) => {
        const { next } = apply((s) => S.recordPurchase(s, entry));
        const h = next.purchaseHistory[0];
        if (h)
          run(
            db.from("purchase_history").insert({
              id: h.id,
              user_id: uid,
              list_id: entry.listId,
              store_id: entry.storeId,
              total: entry.total,
              item_count: entry.itemCount,
            }),
          );
      },
    };
  }, [supabase, state, ready, apply, run, setSession]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

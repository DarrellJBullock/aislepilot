"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Settings2, Users, ShoppingCart, MapPin } from "lucide-react";
import { useApp } from "@/lib/store/provider";
import { useStore } from "@/lib/use-store";
import { Button, Badge, EmptyState } from "@/components/ui";
import { TotalsSummary } from "./TotalsSummary";
import { ItemEntry } from "./ItemEntry";
import { ItemList } from "./ItemList";
import { ListSettings } from "./ListSettings";
import { MembersPanel } from "@/components/collaboration/MembersPanel";

export function ListDetail({ listId }: { listId: string }) {
  const { lists } = useApp();
  const [settings, setSettings] = useState(false);
  const [members, setMembers] = useState(false);
  const list = lists.find((l) => l.id === listId);
  const store = useStore(list?.storeId);

  if (!list) {
    return (
      <EmptyState
        title="List not found"
        description="It may have been deleted."
        action={
          <Link href="/dashboard">
            <Button>Back to lists</Button>
          </Link>
        }
      />
    );
  }

  const matchedCount = list.items.filter((i) => i.product).length;
  const canShop = matchedCount > 0 && !!store;

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={16} /> Lists
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-ink">{list.name}</h1>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin size={13} /> {store ? store.name : "No store selected"}
            </span>
            {store?.demo && <Badge tone="amber">Demo data</Badge>}
          </p>
          {list.notes && <p className="mt-1 text-sm text-ink-soft">{list.notes}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setMembers(true)}>
            <Users size={16} /> Share
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSettings(true)}>
            <Settings2 size={16} /> Settings
          </Button>
        </div>
      </div>

      <TotalsSummary list={list} />

      {canShop ? (
        <Link href={`/lists/${list.id}/shopping`}>
          <Button fullWidth size="lg">
            <ShoppingCart size={18} /> Start Shopping Mode
          </Button>
        </Link>
      ) : (
        <p className="rounded-xl bg-brand-50 px-3 py-2.5 text-sm text-brand-800">
          {!store
            ? "Select a store in Settings to enable Shopping Mode."
            : "Match at least one product to start Shopping Mode."}
        </p>
      )}

      <ItemEntry listId={list.id} storeId={list.storeId} />
      <ItemList list={list} />

      <ListSettings list={list} open={settings} onClose={() => setSettings(false)} />
      <MembersPanel list={list} open={members} onClose={() => setMembers(false)} />
    </div>
  );
}

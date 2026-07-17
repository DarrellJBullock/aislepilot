"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, ListPlus, Archive, Heart } from "lucide-react";
import { useApp } from "@/lib/store/provider";
import { Button, EmptyState, Badge } from "@/components/ui";
import { ListCard } from "./ListCard";

export function Dashboard() {
  const { profile, lists, savedProducts } = useApp();
  const [showArchived, setShowArchived] = useState(false);

  const active = lists.filter((l) => !l.archived);
  const archived = lists.filter((l) => l.archived);
  const visible = showArchived ? archived : active;

  const firstName = profile?.displayName.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Hi, {firstName} 👋</h1>
          <p className="text-sm text-ink-muted">
            {active.length > 0
              ? `You have ${active.length} active ${active.length === 1 ? "list" : "lists"}.`
              : "Create your first list to get started."}
          </p>
        </div>
        <Link href="/lists/new">
          <Button>
            <Plus size={18} /> New list
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowArchived(false)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            !showArchived ? "bg-brand-600 text-white" : "bg-black/5 text-ink-soft"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
            showArchived ? "bg-brand-600 text-white" : "bg-black/5 text-ink-soft"
          }`}
        >
          <Archive size={14} /> Archived
          {archived.length > 0 && (
            <Badge tone={showArchived ? "neutral" : "neutral"}>{archived.length}</Badge>
          )}
        </button>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<ListPlus size={40} />}
          title={showArchived ? "No archived lists" : "No lists yet"}
          description={
            showArchived
              ? "Lists you archive will appear here."
              : "Build a shopping list, match products, and shop by store route."
          }
          action={
            !showArchived && (
              <Link href="/lists/new">
                <Button>
                  <Plus size={18} /> Create a list
                </Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}

      {savedProducts.length > 0 && (
        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-card">
          <h2 className="flex items-center gap-2 font-semibold text-ink">
            <Heart size={16} className="text-brand-600" /> Saved products
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            {savedProducts.length} saved for quick re-adding.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Archive, Trash2, ArchiveRestore } from "lucide-react";
import type { ShoppingList, Store } from "@aislepilot/domain/types";
import { useApp } from "@/lib/store/provider";
import { StorePicker } from "@/components/stores/StorePicker";
import { Modal, Input, Textarea, Label, Button } from "@/components/ui";

export function ListSettings({
  list,
  open,
  onClose,
}: {
  list: ShoppingList;
  open: boolean;
  onClose: () => void;
}) {
  const { updateList, deleteList, duplicateList } = useApp();
  const router = useRouter();
  const [name, setName] = useState(list.name);
  const [budget, setBudget] = useState(list.budget?.toString() ?? "");
  const [notes, setNotes] = useState(list.notes ?? "");
  const [storeId, setStoreId] = useState(list.storeId);

  const save = () => {
    const budgetNum = budget ? Number(budget) : undefined;
    updateList(list.id, {
      name: name.trim() || list.name,
      budget: budgetNum && budgetNum > 0 ? budgetNum : undefined,
      notes,
      storeId,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="List settings">
      <div className="space-y-4">
        <div>
          <Label htmlFor="ls-name">Name</Label>
          <Input id="ls-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="ls-budget">Budget</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">$</span>
            <Input
              id="ls-budget"
              type="number"
              min="0"
              step="0.01"
              className="pl-7"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="No budget"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="ls-notes">Notes</Label>
          <Textarea id="ls-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div>
          <Label>Store</Label>
          <StorePicker value={storeId} onChange={(id: string, _s: Store) => setStoreId(id)} />
        </div>

        <div className="flex flex-wrap gap-2 border-t border-black/5 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const id = duplicateList(list.id);
              onClose();
              router.push(`/lists/${id}`);
            }}
          >
            <Copy size={14} /> Duplicate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              updateList(list.id, { archived: !list.archived });
              onClose();
            }}
          >
            {list.archived ? (
              <>
                <ArchiveRestore size={14} /> Unarchive
              </>
            ) : (
              <>
                <Archive size={14} /> Archive
              </>
            )}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (confirm(`Delete "${list.name}"? This cannot be undone.`)) {
                deleteList(list.id);
                router.push("/dashboard");
              }
            }}
          >
            <Trash2 size={14} /> Delete
          </Button>
        </div>

        <div className="flex justify-end gap-2 border-t border-black/5 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Save changes</Button>
        </div>
      </div>
    </Modal>
  );
}

"use client";

import { useState } from "react";
import { Plus, Rows3, CornerDownLeft } from "lucide-react";
import { useApp } from "@/lib/store/provider";
import { Button, Input, Textarea } from "@/components/ui";
import { ScanToAddButton } from "@/components/products/ScanToAddButton";

export function ItemEntry({ listId, storeId }: { listId: string; storeId?: string }) {
  const { addItem, addItemsBulk } = useApp();
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [text, setText] = useState("");
  const [qty, setQty] = useState(1);
  const [bulk, setBulk] = useState("");

  const addSingle = () => {
    if (!text.trim()) return;
    addItem(listId, { rawText: text, quantity: qty });
    setText("");
    setQty(1);
  };

  const addBulk = () => {
    if (!bulk.trim()) return;
    addItemsBulk(listId, bulk);
    setBulk("");
    setMode("single");
  };

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-3 shadow-card">
      <div className="mb-2 flex items-center gap-2">
        <button
          onClick={() => setMode("single")}
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            mode === "single" ? "bg-brand-600 text-white" : "bg-black/5 text-ink-soft"
          }`}
        >
          Quick add
        </button>
        <button
          onClick={() => setMode("bulk")}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
            mode === "bulk" ? "bg-brand-600 text-white" : "bg-black/5 text-ink-soft"
          }`}
        >
          <Rows3 size={13} /> Paste list
        </button>
        <div className="ml-auto">
          <ScanToAddButton listId={listId} storeId={storeId} />
        </div>
      </div>

      {mode === "single" ? (
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSingle();
              }
            }}
            placeholder="Add an item, e.g. Milk"
            aria-label="Item name"
          />
          <Input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            className="w-16 text-center"
            aria-label="Quantity"
          />
          <Button onClick={addSingle} aria-label="Add item">
            <Plus size={18} />
          </Button>
        </div>
      ) : (
        <div>
          <Textarea
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            placeholder={"One item per line, e.g.\nMilk\n2 Eggs\nBread\nPaper towels"}
            className="min-h-[120px]"
            aria-label="Bulk items"
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="flex items-center gap-1 text-xs text-ink-muted">
              <CornerDownLeft size={12} /> One item per line. Prefix a number for quantity.
            </p>
            <Button onClick={addBulk} size="sm">
              Add all
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

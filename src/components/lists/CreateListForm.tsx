"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Store } from "@/domain/types";
import { useApp } from "@/lib/store/provider";
import { StorePicker } from "@/components/stores/StorePicker";
import { Button, Input, Textarea, Label, Card, CardBody, FieldError } from "@/components/ui";

export function CreateListForm() {
  const { createList } = useApp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [storeId, setStoreId] = useState<string | undefined>();
  const [store, setStore] = useState<Store | undefined>();
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Give your list a name.");
      return;
    }
    const budgetNum = budget ? Number(budget) : undefined;
    const id = createList({
      name,
      budget: budgetNum && budgetNum > 0 ? budgetNum : undefined,
      storeId,
      notes,
    });
    router.push(`/lists/${id}`);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={16} /> Back to lists
      </Link>
      <h1 className="text-2xl font-bold text-ink">Create a list</h1>
      <p className="mt-1 text-sm text-ink-muted">Name it, set a budget, and pick your store.</p>

      <form onSubmit={submit} className="mt-6 space-y-5">
        <Card>
          <CardBody className="space-y-4">
            <div>
              <Label htmlFor="name">List name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="Weekly Groceries"
                autoFocus
              />
              <FieldError>{error}</FieldError>
            </div>
            <div>
              <Label htmlFor="budget">Budget (optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">$</span>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  className="pl-7"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="75.00"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Dinner party on Saturday"
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Label>Store {store ? `— ${store.banner}` : "(optional)"}</Label>
            <p className="mb-3 text-sm text-ink-muted">
              Choose a store to load its prices, availability, and aisle layout.
            </p>
            <StorePicker
              value={storeId}
              onChange={(id, s) => {
                setStoreId(id);
                setStore(s);
              }}
            />
          </CardBody>
        </Card>

        <div className="flex justify-end gap-2">
          <Link href="/dashboard">
            <Button type="button" variant="ghost">Cancel</Button>
          </Link>
          <Button type="submit" size="lg">Create list</Button>
        </div>
      </form>
    </div>
  );
}

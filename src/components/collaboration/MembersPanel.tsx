"use client";

import { useState } from "react";
import { UserPlus, X, Users } from "lucide-react";
import type { ShoppingList } from "@aislepilot/domain/types";
import { useApp } from "@/lib/store/provider";
import { Modal, Input, Button, Badge } from "@/components/ui";

export function MembersPanel({
  list,
  open,
  onClose,
}: {
  list: ShoppingList;
  open: boolean;
  onClose: () => void;
}) {
  const { inviteMember, removeMember } = useApp();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const invite = () => {
    const clean = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError("Enter a valid email.");
      return;
    }
    inviteMember(list.id, clean);
    setEmail("");
    setError(null);
  };

  return (
    <Modal open={open} onClose={onClose} title="Share this list">
      <p className="mb-3 text-sm text-ink-muted">
        Invite people by email. They can add items and mark things collected — and you’ll see
        who grabbed what.
      </p>

      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && invite()}
          aria-label="Invite email"
        />
        <Button onClick={invite}>
          <UserPlus size={16} /> Invite
        </Button>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      <div className="mt-4">
        <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
          <Users size={14} /> Members ({list.members.length})
        </p>
        <ul className="space-y-2">
          {list.members.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between rounded-xl border border-black/5 bg-white p-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{m.displayName}</p>
                <p className="truncate text-xs text-ink-muted">{m.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={m.role === "owner" ? "brand" : "neutral"}>{m.role}</Badge>
                {m.role !== "owner" && (
                  <button
                    onClick={() => removeMember(list.id, m.id)}
                    className="rounded-full p-1 text-ink-muted hover:bg-red-50 hover:text-red-600"
                    aria-label={`Remove ${m.displayName}`}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}

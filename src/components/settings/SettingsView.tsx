"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, Receipt, Database } from "lucide-react";
import { useApp } from "@/lib/store/provider";
import { formatCurrency } from "@aislepilot/domain/pricing";
import { Card, CardBody, Input, Label, Button, Badge } from "@/components/ui";

export function SettingsView() {
  const { profile, updateProfile, signOut, purchaseHistory, savedProducts } = useApp();
  const router = useRouter();
  const [name, setName] = useState(profile?.displayName ?? "");
  const [saved, setSaved] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold text-ink">Settings</h1>

      <Card>
        <CardBody className="space-y-4">
          <h2 className="flex items-center gap-2 font-semibold text-ink">
            <User size={18} className="text-brand-600" /> Account
          </h2>
          <div>
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile?.email ?? ""} disabled />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                updateProfile({ displayName: name.trim() || profile?.displayName });
                setSaved(true);
              }}
            >
              Save
            </Button>
            {saved && <Badge tone="green">Saved</Badge>}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="flex items-center gap-2 font-semibold text-ink">
            <Receipt size={18} className="text-brand-600" /> Purchase history
          </h2>
          {purchaseHistory.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">
              Completed shopping trips will appear here.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {purchaseHistory.map((h) => (
                <li
                  key={h.id}
                  className="flex items-center justify-between rounded-xl border border-black/5 p-3 text-sm"
                >
                  <span className="text-ink-soft">
                    {new Date(h.purchasedAt).toLocaleDateString()} · {h.itemCount} items
                  </span>
                  <span className="font-semibold text-ink">{formatCurrency(h.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="flex items-center gap-2 font-semibold text-ink">
            <Database size={18} className="text-brand-600" /> Saved products
          </h2>
          <p className="mt-1 text-sm text-ink-muted">{savedProducts.length} saved.</p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-ink">Sign out</p>
            <p className="text-sm text-ink-muted">End your session on this device.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              signOut();
              router.push("/");
            }}
          >
            <LogOut size={16} /> Sign out
          </Button>
        </CardBody>
      </Card>

      <p className="text-center text-xs text-ink-muted">
        Running in demo mode — data is stored locally in your browser.
      </p>
    </div>
  );
}

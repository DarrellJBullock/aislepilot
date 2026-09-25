"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, Receipt, Database, Download } from "lucide-react";
import { useApp } from "@/lib/store/provider";
import { formatCurrency } from "@aislepilot/domain/pricing";
import { buildUserExport, exportFilename, itemsToCsv } from "@aislepilot/domain/export";
import { downloadTextFile } from "@/lib/download";
import { Card, CardBody, Input, Label, Button, Badge } from "@/components/ui";

export function SettingsView() {
  const { backend, profile, lists, updateProfile, signOut, purchaseHistory, savedProducts } = useApp();
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
        <CardBody>
          <h2 className="flex items-center gap-2 font-semibold text-ink">
            <Download size={18} className="text-brand-600" /> Your data
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Download your lists, items, saved products and purchase history. JSON has everything;
            CSV opens in Excel or Google Sheets.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() =>
                downloadTextFile(
                  exportFilename("json"),
                  "application/json",
                  JSON.stringify(
                    buildUserExport({ profile, lists, savedProducts, purchaseHistory }),
                    null,
                    2,
                  ),
                )
              }
            >
              <Download size={16} /> Download JSON
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadTextFile(exportFilename("csv"), "text/csv", itemsToCsv(lists))}
            >
              <Download size={16} /> Download CSV
            </Button>
          </div>
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

      {backend === "local" && (
        <p className="text-center text-xs text-ink-muted">
          Running in demo mode — data is stored locally in your browser.
        </p>
      )}
    </div>
  );
}

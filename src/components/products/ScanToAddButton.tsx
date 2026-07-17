"use client";

import { useEffect, useState } from "react";
import { ScanBarcode, Check, X, Loader2 } from "lucide-react";
import { useApp } from "@/lib/store/provider";
import { fetchBarcode } from "@/lib/retailer-client";
import { Button } from "@/components/ui";
import { BarcodeScanner } from "./BarcodeScanner";

type Feedback = { ok: boolean; text: string } | null;

export function ScanToAddButton({
  listId,
  storeId,
}: {
  listId: string;
  storeId?: string;
}) {
  const { addMatchedItem } = useApp();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(t);
  }, [feedback]);

  const onDetected = async (upc: string) => {
    setOpen(false);
    setBusy(true);
    try {
      const { product } = await fetchBarcode(upc, storeId);
      if (product) {
        addMatchedItem(listId, product);
        setFeedback({ ok: true, text: `Added ${product.name}` });
      } else {
        setFeedback({ ok: false, text: `No product found for ${upc}` });
      }
    } catch {
      setFeedback({ ok: false, text: "Lookup failed — try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={busy}
        aria-label="Scan a barcode to add an item"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <ScanBarcode size={16} />}
        Scan
      </Button>

      {feedback && (
        <p
          role="status"
          className={`mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm ${
            feedback.ok ? "bg-brand-50 text-brand-800" : "bg-amber-50 text-amber-800"
          }`}
        >
          {feedback.ok ? <Check size={15} /> : <X size={15} />}
          {feedback.text}
        </p>
      )}

      <BarcodeScanner open={open} onClose={() => setOpen(false)} onDetected={onDetected} />
    </div>
  );
}

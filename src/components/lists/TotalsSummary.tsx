"use client";

import { AlertTriangle, TrendingDown } from "lucide-react";
import type { ShoppingList } from "@aislepilot/domain/types";
import { computeTotals, formatCurrency } from "@aislepilot/domain/pricing";
import { budgetSuggestions } from "@aislepilot/domain/assignment";
import { Card, Progress } from "@/components/ui";

export function TotalsSummary({ list }: { list: ShoppingList }) {
  const totals = computeTotals(list);
  const budgetPct =
    totals.budget && totals.budget > 0
      ? Math.min(100, Math.round((totals.estimatedTotal / totals.budget) * 100))
      : 0;
  const suggestions =
    totals.overBudget > 0 ? budgetSuggestions(list.items, totals.overBudget) : [];

  return (
    <Card>
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Estimated" value={formatCurrency(totals.estimatedTotal)} tone="brand" />
          <Stat label="Collected" value={formatCurrency(totals.collectedTotal)} />
          <Stat label="Remaining" value={formatCurrency(totals.remainingTotal)} />
        </div>

        {totals.budget != null && (
          <div className="mt-4 border-t border-black/5 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">Budget {formatCurrency(totals.budget)}</span>
              {totals.overBudget > 0 ? (
                <span className="inline-flex items-center gap-1 font-semibold text-red-600">
                  <AlertTriangle size={14} /> {formatCurrency(totals.overBudget)} over
                </span>
              ) : (
                <span className="font-semibold text-brand-700">
                  {formatCurrency(totals.budgetRemaining ?? 0)} left
                </span>
              )}
            </div>
            <Progress
              value={budgetPct}
              className={totals.overBudget > 0 ? "[&>div]:bg-red-500" : ""}
              label="Budget used"
            />

            {suggestions.length > 0 && (
              <div className="mt-3 rounded-xl bg-amber-50 p-3">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-800">
                  <TrendingDown size={14} /> Ways to get back under budget
                </p>
                <ul className="mt-1.5 space-y-1 text-sm text-amber-800">
                  {suggestions.slice(0, 3).map((s, i) => (
                    <li key={`${s.itemId}-${i}`} className="flex gap-1.5">
                      <span aria-hidden>•</span>
                      {s.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "brand";
}) {
  return (
    <div>
      <p className="text-xs text-ink-muted">{label}</p>
      <p
        className={`text-lg font-bold tabular-nums ${
          tone === "brand" ? "text-brand-700" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

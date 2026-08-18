import { View, Text } from "react-native";
import { AlertTriangle, TrendingDown } from "lucide-react-native";
import type { ShoppingList, Store } from "@aislepilot/domain/types";
import { computeTotals, formatCurrency, getGroceryTaxRate } from "@aislepilot/domain/pricing";
import { budgetSuggestions } from "@aislepilot/domain/assignment";
import { Card, CardBody, Progress } from "../ui";

export function TotalsSummary({ list, store }: { list: ShoppingList; store?: Store }) {
  const totals = computeTotals(list, getGroceryTaxRate(store?.state));
  const budgetPct =
    totals.budget && totals.budget > 0
      ? Math.min(100, Math.round((totals.estimatedTotal / totals.budget) * 100))
      : 0;
  const suggestions = totals.overBudget > 0 ? budgetSuggestions(list.items, totals.overBudget) : [];

  return (
    <Card>
      <CardBody>
        <View className="flex-row justify-between">
          <Stat label="Estimated" value={formatCurrency(totals.estimatedTotal)} tone="brand" />
          <Stat label="Collected" value={formatCurrency(totals.collectedTotal)} />
          <Stat label="Remaining" value={formatCurrency(totals.remainingTotal)} />
        </View>

        {totals.taxRate > 0 && (
          <View className="mt-3 flex-row items-center justify-between border-t border-black/5 pt-3">
            <Text className="text-sm text-ink-muted">
              Tax ({(totals.taxRate * 100).toFixed(2).replace(/\.?0+$/, "")}%)
            </Text>
            <Text className="text-sm text-ink-soft">+{formatCurrency(totals.estimatedTax)}</Text>
          </View>
        )}
        {totals.taxRate > 0 && (
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-ink">Total with tax</Text>
            <Text className="text-sm font-bold text-ink">
              {formatCurrency(totals.estimatedTotalWithTax)}
            </Text>
          </View>
        )}

        {totals.budget != null && (
          <View className="mt-4 border-t border-black/5 pt-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-ink-muted">Budget {formatCurrency(totals.budget)}</Text>
              {totals.overBudget > 0 ? (
                <View className="flex-row items-center gap-1">
                  <AlertTriangle size={14} color="#dc2626" />
                  <Text className="text-sm font-semibold text-red-600">
                    {formatCurrency(totals.overBudget)} over
                  </Text>
                </View>
              ) : (
                <Text className="text-sm font-semibold text-brand-700">
                  {formatCurrency(totals.budgetRemaining ?? 0)} left
                </Text>
              )}
            </View>
            <View className="mt-2">
              <Progress value={budgetPct} className={totals.overBudget > 0 ? "bg-red-100" : undefined} />
            </View>

            {suggestions.length > 0 && (
              <View className="mt-3 rounded-xl bg-amber-50 p-3">
                <View className="flex-row items-center gap-1.5">
                  <TrendingDown size={14} color="#92400e" />
                  <Text className="text-sm font-semibold text-amber-800">Ways to get back under budget</Text>
                </View>
                <View className="mt-1.5 gap-1">
                  {suggestions.slice(0, 3).map((s, i) => (
                    <Text key={`${s.itemId}-${i}`} className="text-sm text-amber-800">
                      • {s.reason}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </CardBody>
    </Card>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "brand" }) {
  return (
    <View>
      <Text className="text-xs text-ink-muted">{label}</Text>
      <Text className={`text-lg font-bold ${tone === "brand" ? "text-brand-700" : "text-ink"}`}>{value}</Text>
    </View>
  );
}

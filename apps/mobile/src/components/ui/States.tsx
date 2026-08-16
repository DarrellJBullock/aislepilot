import type { ReactNode } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { cn } from "../../lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <View className={cn("rounded-lg bg-black/10", className)} />;
}

export function Spinner() {
  return <ActivityIndicator color="#18b365" accessibilityLabel="Loading" />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <View className="items-center justify-center rounded-2xl border border-dashed border-black/10 bg-white/50 px-6 py-12">
      {icon && <View className="mb-3">{icon}</View>}
      <Text className="text-center text-base font-semibold text-ink">{title}</Text>
      {description && (
        <Text className="mt-1 max-w-sm text-center text-sm text-ink-muted">{description}</Text>
      )}
      {action && <View className="mt-4">{action}</View>}
    </View>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <View
      accessibilityRole="alert"
      className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6"
    >
      <Text className="text-center text-base font-semibold text-red-800">{title}</Text>
      {description && (
        <Text className="mt-1 text-center text-sm text-red-700">{description}</Text>
      )}
      {action && <View className="mt-4">{action}</View>}
    </View>
  );
}

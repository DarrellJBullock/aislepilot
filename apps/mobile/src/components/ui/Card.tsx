import { View, type ViewProps } from "react-native";
import { cn } from "../../lib/cn";

export function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn("rounded-2xl border border-black/5 bg-white", className)}
      style={{
        shadowColor: "#101828",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: ViewProps) {
  return <View className={cn("p-4", className)} {...props} />;
}

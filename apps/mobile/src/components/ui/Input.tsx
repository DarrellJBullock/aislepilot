import { TextInput, Text, type TextInputProps, type TextProps } from "react-native";
import { cn } from "../../lib/cn";

const base =
  "w-full rounded-xl border border-black/10 bg-white px-3.5 text-[15px] text-ink " +
  "placeholder:text-ink-muted";

export function Input({ className, multiline, ...props }: TextInputProps) {
  return (
    <TextInput
      className={cn(base, multiline ? "min-h-[88px] py-2.5" : "h-11", className)}
      placeholderTextColor="#6b7688"
      {...props}
    />
  );
}

export function Textarea(props: TextInputProps) {
  return <Input multiline textAlignVertical="top" {...props} />;
}

export function Label({ className, ...props }: TextProps) {
  return <Text className={cn("mb-1.5 text-sm font-medium text-ink-soft", className)} {...props} />;
}

export function FieldError({ children }: { children?: string | null }) {
  if (!children) return null;
  return <Text className="mt-1 text-sm text-red-600">{children}</Text>;
}

import { Pressable, Text, type PressableProps } from "react-native";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, { bg: string; text: string }> = {
  primary: { bg: "bg-brand-600", text: "text-white" },
  secondary: { bg: "bg-brand-50", text: "text-brand-800" },
  ghost: { bg: "bg-transparent", text: "text-ink-soft" },
  outline: { bg: "border border-black/10 bg-white", text: "text-ink" },
  danger: { bg: "bg-red-600", text: "text-white" },
};

const SIZES: Record<Size, { box: string; text: string }> = {
  sm: { box: "h-9 px-3 rounded-lg", text: "text-sm" },
  md: { box: "h-11 px-4 rounded-xl", text: "text-sm" },
  lg: { box: "h-14 px-6 rounded-2xl", text: "text-base" },
};

export interface ButtonProps extends Omit<PressableProps, "children"> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
  textClassName?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  disabled,
  className,
  textClassName,
  children,
  ...props
}: ButtonProps) {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={cn(
        "flex-row items-center justify-center gap-2",
        v.bg,
        s.box,
        fullWidth && "w-full",
        className,
      )}
      style={({ pressed }) => ({ opacity: pressed && !disabled ? 0.85 : disabled ? 0.5 : 1 })}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className={cn("font-semibold", v.text, s.text, textClassName)}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

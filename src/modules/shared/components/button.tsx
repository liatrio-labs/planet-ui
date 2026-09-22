import type { ComponentProps } from "react";

type ButtonVariant = "primary" | "ghost" | "outline";
type ButtonSize = "md" | "sm" | "icon";

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-ink shadow-[0_0_20px_-4px_var(--color-accent)] hover:brightness-110",
  ghost: "text-ink-muted hover:bg-surface-raised hover:text-ink",
  outline: "border border-line-strong text-ink hover:bg-surface-raised",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-10 px-4",
  sm: "h-8 px-3 text-xs",
  icon: "size-8",
};

export const Button = ({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    {...props}
  />
);

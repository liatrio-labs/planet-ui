import type {
  ComponentProps,
  ReactNode,
} from "react";

export const Field = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-2">{children}</div>
);

export const FieldLabel = (props: ComponentProps<"label">) => (
  <label className="text-sm font-medium leading-none" {...props} />
);

export const FieldHint = ({ children }: { children: ReactNode }) => (
  <p className="text-xs text-ink-muted">{children}</p>
);

export const FieldError = ({ children }: { children: ReactNode }) => (
  <p className="text-xs text-red-400" role="alert">
    {children}
  </p>
);

const control =
  "w-full rounded-lg border border-line-strong bg-space/60 px-3 py-2 text-sm text-ink placeholder:text-ink-muted/70 focus-visible:border-accent/60";

export const Input = ({
  className = "",
  ...props
}: ComponentProps<"input">) => (
  <input className={`h-10 ${control} ${className}`} {...props} />
);

export const Textarea = ({
  className = "",
  ...props
}: ComponentProps<"textarea">) => (
  <textarea className={`min-h-20 resize-y ${control} ${className}`} {...props} />
);

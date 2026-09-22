import { SunIcon } from "lucide-react";

import { SUN_ID, usePlanetsStore } from "~/modules/planets/store/planets.store";

export const SunListItem = () => {
  const isSelected = usePlanetsStore((state) => state.focusedBodyId === SUN_ID);
  const focusBody = usePlanetsStore((state) => state.focusBody);

  return (
    <button
      type="button"
      aria-label="Focus camera on Sun"
      aria-pressed={isSelected}
      onClick={() => focusBody(SUN_ID)}
      className={`mb-2 flex w-full cursor-pointer items-center gap-2 rounded-lg border bg-surface-raised/50 p-3 text-left transition-colors outline-none hover:bg-surface-raised focus-visible:ring-2 focus-visible:ring-accent ${
        isSelected ? "border-accent/60 ring-1 ring-accent/40" : "border-line"
      }`}
    >
      <span className="flex size-6 items-center justify-center rounded-full bg-accent text-accent-ink shadow-[0_0_14px_var(--color-accent)]">
        <SunIcon className="size-3.5" />
      </span>
      <span>
        <h3 className="text-sm font-medium leading-5">Sun</h3>
        <p className="text-xs text-ink-muted">Fixed at the center</p>
      </span>
    </button>
  );
};

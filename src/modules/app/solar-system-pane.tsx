import { SunIcon } from "lucide-react";

import { AddPlanetDialog } from "~/modules/planets/components/add-planet-dialog";
import { PlanetList } from "~/modules/planets/components/planet-list";
import { usePlanetsStore } from "~/modules/planets/store/planets.store";
import { env } from "~/modules/shared/env.config";

export const SolarSystemPane = () => {
  const planetCount = usePlanetsStore((state) => state.planets.length);

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-r border-line bg-surface">
      <header className="px-4 pt-5 pb-4">
        <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">
          {env.appName}
        </p>
        <h1 className="mt-1 text-lg font-semibold">Solar System</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {planetCount === 0
            ? "One sun, no planets."
            : `One sun, ${planetCount} ${planetCount === 1 ? "planet" : "planets"}.`}
        </p>
      </header>

      <div className="px-4">
        <AddPlanetDialog />
      </div>

      <hr className="mx-4 my-4 border-line" />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <section aria-label="Bodies">
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-line bg-surface-raised/50 p-3">
            <span className="flex size-6 items-center justify-center rounded-full bg-accent text-accent-ink shadow-[0_0_14px_var(--color-accent)]">
              <SunIcon className="size-3.5" />
            </span>
            <div>
              <h3 className="text-sm font-medium leading-5">Sun</h3>
              <p className="text-xs text-ink-muted">Fixed at the center</p>
            </div>
          </div>
          <PlanetList />
        </section>
      </div>
    </aside>
  );
};

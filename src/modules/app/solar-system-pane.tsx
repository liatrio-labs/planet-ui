import { SunIcon } from "lucide-react";

import { AddPlanetDialog } from "~/modules/planets/components/add-planet-dialog";
import { PlanetList } from "~/modules/planets/components/planet-list";
import { usePlanetsStore } from "~/modules/planets/store/planets.store";
import { ScrollArea } from "~/modules/shared/components/ui/scroll-area";
import { Separator } from "~/modules/shared/components/ui/separator";
import { env } from "~/modules/shared/env.config";

export const SolarSystemPane = () => {
  const planetCount = usePlanetsStore((state) => state.planets.length);

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <header className="px-4 pt-5 pb-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {env.appName}
        </p>
        <h1 className="mt-1 text-lg font-semibold">Solar System</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {planetCount === 0
            ? "One sun, no planets."
            : `One sun, ${planetCount} ${planetCount === 1 ? "planet" : "planets"}.`}
        </p>
      </header>

      <div className="px-4">
        <AddPlanetDialog />
      </div>

      <Separator className="my-4" />

      <ScrollArea className="min-h-0 flex-1 px-4 pb-4">
        <section aria-label="Bodies">
          <div className="mb-2 flex items-center gap-2 rounded-lg border bg-card/60 p-3">
            <span className="flex size-6 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-[0_0_14px_rgba(251,191,36,0.7)]">
              <SunIcon className="size-3.5" />
            </span>
            <div>
              <h3 className="text-sm font-medium leading-5">Sun</h3>
              <p className="text-xs text-muted-foreground">Fixed at the center</p>
            </div>
          </div>
          <PlanetList />
        </section>
      </ScrollArea>
    </aside>
  );
};

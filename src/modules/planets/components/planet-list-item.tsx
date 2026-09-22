import { Trash2Icon } from "lucide-react";

import { Button } from "~/modules/shared/components/ui/button";
import { formatAu, formatAuAsKm } from "~/modules/shared/lib/format";
import { derivePlanetAppearance } from "../lib/planet-appearance";
import type { Planet } from "../models/planet";
import { CharacteristicBadge } from "./characteristic-badge";

type PlanetListItemProps = {
  planet: Planet;
  onRemove: (id: string) => void;
};

export const PlanetListItem = ({ planet, onRemove }: PlanetListItemProps) => {
  const appearance = derivePlanetAppearance(planet.characteristics);

  return (
    <li className="group rounded-lg border bg-card/60 p-3 transition-colors hover:bg-card">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-0.5 size-6 shrink-0 rounded-full shadow-[inset_-3px_-3px_6px_rgba(0,0,0,0.6)]"
          style={{ backgroundColor: appearance.color }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-medium leading-6">{planet.name}</h3>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${planet.name}`}
              className="-mr-1 -mt-0.5 opacity-60 hover:opacity-100"
              onClick={() => onRemove(planet.id)}
            >
              <Trash2Icon />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatAu(planet.distanceAu)} · {formatAuAsKm(planet.distanceAu)} · size{" "}
            {planet.size}
          </p>
          {planet.description && (
            <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
              {planet.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-1">
            {planet.characteristics.map((characteristic) => (
              <CharacteristicBadge
                key={characteristic}
                characteristic={characteristic}
              />
            ))}
          </div>
        </div>
      </div>
    </li>
  );
};

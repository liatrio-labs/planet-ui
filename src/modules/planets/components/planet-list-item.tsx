import { Trash2Icon } from "lucide-react";

import { Button } from "~/modules/shared/components/button";
import { formatAu, formatAuAsKm } from "~/modules/shared/lib/format";
import { derivePlanetAppearance } from "../lib/planet-appearance";
import type { Planet } from "../models/planet";
import { CharacteristicBadge } from "./characteristic-badge";

type PlanetListItemProps = {
  planet: Planet;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onRemove: (id: string) => void;
};

export const PlanetListItem = ({
  planet,
  isSelected = false,
  onSelect,
  onRemove,
}: PlanetListItemProps) => {
  const appearance = derivePlanetAppearance(planet.characteristics);

  return (
    <li
      className={`rounded-lg border bg-surface-raised/50 transition-colors hover:bg-surface-raised ${
        isSelected ? "border-accent/60 ring-1 ring-accent/40" : "border-line"
      }`}
    >
      <div className="flex items-start gap-2 p-3">
        <button
          type="button"
          aria-label={`Focus camera on ${planet.name}`}
          aria-pressed={isSelected}
          onClick={() => onSelect?.(planet.id)}
          className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span
            aria-hidden
            className="mt-0.5 size-6 shrink-0 rounded-full shadow-[inset_-3px_-3px_6px_rgba(0,0,0,0.6)]"
            style={{ backgroundColor: appearance.color }}
          />
          <span className="min-w-0 flex-1">
            <h3 className="truncate font-medium leading-6">{planet.name}</h3>
            <p className="text-xs text-ink-muted">
              {formatAu(planet.distanceAu)} · {formatAuAsKm(planet.distanceAu)} · size{" "}
              {planet.size}
            </p>
            {planet.description && (
              <p className="mt-1.5 line-clamp-2 text-sm text-ink-muted">
                {planet.description}
              </p>
            )}
            {planet.characteristics.length > 0 && (
              <span className="mt-2 flex flex-wrap gap-1">
                {planet.characteristics.map((characteristic) => (
                  <CharacteristicBadge
                    key={characteristic}
                    characteristic={characteristic}
                  />
                ))}
              </span>
            )}
          </span>
        </button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Remove ${planet.name}`}
          className="-mr-1 -mt-0.5 hover:text-danger"
          onClick={() => onRemove(planet.id)}
        >
          <Trash2Icon />
        </Button>
      </div>
    </li>
  );
};

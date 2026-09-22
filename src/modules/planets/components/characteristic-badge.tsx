import {
  planetCharacteristicMeta,
  type PlanetCharacteristic,
} from "../models/planet-characteristic";

type CharacteristicBadgeProps = {
  characteristic: PlanetCharacteristic;
};

export const CharacteristicBadge = ({
  characteristic,
}: CharacteristicBadgeProps) => {
  const meta = planetCharacteristicMeta[characteristic];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-0.5 text-xs text-ink-muted">
      <span
        aria-hidden
        className="size-2 rounded-full"
        style={{ backgroundColor: meta.swatch }}
      />
      {meta.label}
    </span>
  );
};

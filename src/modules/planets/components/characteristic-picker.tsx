import {
  PLANET_CHARACTERISTICS,
  planetCharacteristicMeta,
  type PlanetCharacteristic,
} from "../models/planet-characteristic";

type CharacteristicPickerProps = {
  value: PlanetCharacteristic[];
  onChange: (value: PlanetCharacteristic[]) => void;
};

export const CharacteristicPicker = ({
  value,
  onChange,
}: CharacteristicPickerProps) => {
  const toggle = (characteristic: PlanetCharacteristic) =>
    onChange(
      value.includes(characteristic)
        ? value.filter((item) => item !== characteristic)
        : [...value, characteristic],
    );

  return (
    <div role="group" className="flex flex-wrap gap-2">
      {PLANET_CHARACTERISTICS.map((characteristic) => {
        const meta = planetCharacteristicMeta[characteristic];
        return (
          <button
            key={characteristic}
            type="button"
            aria-pressed={value.includes(characteristic)}
            title={meta.description}
            onClick={() => toggle(characteristic)}
            className="inline-flex h-8 items-center gap-2 rounded-full border border-line-strong px-3 text-sm text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink aria-pressed:border-accent/70 aria-pressed:bg-accent/10 aria-pressed:text-ink"
          >
            <span
              aria-hidden
              className="size-2.5 rounded-full ring-1 ring-white/20"
              style={{ backgroundColor: meta.swatch }}
            />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
};

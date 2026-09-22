import {
  ToggleGroup,
  ToggleGroupItem,
} from "~/modules/shared/components/ui/toggle-group";
import {
  PLANET_CHARACTERISTICS,
  planetCharacteristicMeta,
  type PlanetCharacteristic,
} from "../models/planet-characteristic";

type CharacteristicPickerProps = {
  value: PlanetCharacteristic[];
  onChange: (value: PlanetCharacteristic[]) => void;
  invalid?: boolean;
};

export const CharacteristicPicker = ({
  value,
  onChange,
  invalid,
}: CharacteristicPickerProps) => (
  <ToggleGroup
    type="multiple"
    variant="outline"
    value={value}
    onValueChange={(next) => onChange(next as PlanetCharacteristic[])}
    aria-invalid={invalid}
    className="flex flex-wrap justify-start gap-2"
  >
    {PLANET_CHARACTERISTICS.map((characteristic) => {
      const meta = planetCharacteristicMeta[characteristic];
      return (
        <ToggleGroupItem
          key={characteristic}
          value={characteristic}
          title={meta.description}
          className="h-8 gap-2 rounded-full px-3 data-[state=on]:border-primary/60"
        >
          <span
            aria-hidden
            className="size-2.5 rounded-full ring-1 ring-white/20"
            style={{ backgroundColor: meta.swatch }}
          />
          {meta.label}
        </ToggleGroupItem>
      );
    })}
  </ToggleGroup>
);

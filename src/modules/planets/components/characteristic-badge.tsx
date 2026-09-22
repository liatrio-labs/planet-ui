import { Badge } from "~/modules/shared/components/ui/badge";
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
    <Badge variant="outline" className="gap-1.5 font-normal">
      <span
        aria-hidden
        className="size-2 rounded-full"
        style={{ backgroundColor: meta.swatch }}
      />
      {meta.label}
    </Badge>
  );
};

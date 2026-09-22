export const PLANET_CHARACTERISTICS = [
  "rocky",
  "oceans",
  "gas-giant",
  "icy",
  "volcanic",
  "desert",
  "toxic",
  "clouded",
  "ringed",
  "glowing",
] as const;

export type PlanetCharacteristic = (typeof PLANET_CHARACTERISTICS)[number];

export type PlanetCharacteristicMeta = {
  label: string;
  description: string;
  /** Swatch used in the picker and list badges. */
  swatch: string;
};

export const planetCharacteristicMeta: Record<
  PlanetCharacteristic,
  PlanetCharacteristicMeta
> = {
  rocky: {
    label: "Rocky",
    description: "Cratered, terrestrial surface.",
    swatch: "#9c7a5b",
  },
  oceans: {
    label: "Oceans",
    description: "Liquid water with a blue atmosphere.",
    swatch: "#2f6fd6",
  },
  "gas-giant": {
    label: "Gas Giant",
    description: "Thick banded gas layers.",
    swatch: "#d9a066",
  },
  icy: {
    label: "Icy",
    description: "Frozen, reflective crust.",
    swatch: "#cfe8ff",
  },
  volcanic: {
    label: "Volcanic",
    description: "Dark rock with glowing lava.",
    swatch: "#ff4500",
  },
  desert: {
    label: "Desert",
    description: "Dry dunes and dust storms.",
    swatch: "#d8a24a",
  },
  toxic: {
    label: "Toxic",
    description: "Acidic green haze.",
    swatch: "#7ddc3a",
  },
  clouded: {
    label: "Clouded",
    description: "Dense white cloud cover.",
    swatch: "#f4f4f4",
  },
  ringed: {
    label: "Ringed",
    description: "Dust and ice ring system.",
    swatch: "#c8b89a",
  },
  glowing: {
    label: "Glowing",
    description: "Emits its own light.",
    swatch: "#ffd166",
  },
};

import { Color } from "three";

import type { PlanetCharacteristic } from "../models/planet-characteristic";

export type PlanetAppearance = {
  color: string;
  emissive: string;
  emissiveIntensity: number;
  roughness: number;
  metalness: number;
  atmosphereColor: string | null;
  atmosphereOpacity: number;
  hasRings: boolean;
};

type SurfaceStyle = {
  color: string;
  roughness: number;
  metalness?: number;
};

type AtmosphereStyle = {
  color: string;
  opacity: number;
};

/** Characteristics that contribute a surface color. */
const surfaceStyles: Partial<Record<PlanetCharacteristic, SurfaceStyle>> = {
  rocky: { color: "#9c7a5b", roughness: 0.95 },
  oceans: { color: "#2f6fd6", roughness: 0.45 },
  "gas-giant": { color: "#d9a066", roughness: 0.75 },
  icy: { color: "#cfe8ff", roughness: 0.25, metalness: 0.15 },
  volcanic: { color: "#3a1f1a", roughness: 0.9 },
  desert: { color: "#d8a24a", roughness: 0.9 },
  toxic: { color: "#7ddc3a", roughness: 0.6 },
};

const atmosphereStyles: Partial<Record<PlanetCharacteristic, AtmosphereStyle>> =
  {
    oceans: { color: "#7ab8ff", opacity: 0.18 },
    clouded: { color: "#ffffff", opacity: 0.3 },
    toxic: { color: "#b6ff5c", opacity: 0.25 },
    "gas-giant": { color: "#f2c78c", opacity: 0.15 },
  };

const FALLBACK_COLOR = "#8a8a8a";

const averageColor = (hexes: string[]) => {
  if (hexes.length === 0) return FALLBACK_COLOR;
  const mixed = new Color(0, 0, 0);
  for (const hex of hexes) {
    mixed.add(new Color(hex));
  }
  mixed.multiplyScalar(1 / hexes.length);
  return `#${mixed.getHexString()}`;
};

const average = (values: number[], fallback: number) =>
  values.length > 0
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : fallback;

export const derivePlanetAppearance = (
  characteristics: PlanetCharacteristic[],
): PlanetAppearance => {
  const surfaces = characteristics
    .map((characteristic) => surfaceStyles[characteristic])
    .filter((style): style is SurfaceStyle => Boolean(style));

  const color = averageColor(surfaces.map((style) => style.color));
  const roughness = average(
    surfaces.map((style) => style.roughness),
    0.8,
  );
  const metalness = average(
    surfaces.map((style) => style.metalness ?? 0),
    0,
  );

  const isGlowing = characteristics.includes("glowing");
  const isVolcanic = characteristics.includes("volcanic");
  const emissive = isGlowing ? color : isVolcanic ? "#ff4500" : "#000000";
  const emissiveIntensity = isGlowing ? 1.2 : isVolcanic ? 0.5 : 0;

  const atmosphere =
    characteristics
      .map((characteristic) => atmosphereStyles[characteristic])
      .find((style): style is AtmosphereStyle => Boolean(style)) ?? null;

  return {
    color,
    emissive,
    emissiveIntensity,
    roughness,
    metalness,
    atmosphereColor: atmosphere?.color ?? null,
    atmosphereOpacity: atmosphere?.opacity ?? 0,
    hasRings: characteristics.includes("ringed"),
  };
};

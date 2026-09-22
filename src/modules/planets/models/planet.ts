import { z } from "zod";

import type { Entity } from "~/modules/shared/models/entity";
import { PLANET_CHARACTERISTICS } from "./planet-characteristic";

/** Distance from the sun in astronomical units (1 AU = Earth's orbit). */
export const PLANET_DISTANCE_AU = { min: 0.1, max: 10, step: 0.1 } as const;

export const PLANET_SIZE = { min: 1, max: 10, step: 1 } as const;

export const planetSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Give your planet a name.")
    .max(40, "Keep the name under 40 characters."),
  description: z
    .string()
    .trim()
    .max(280, "Keep the description under 280 characters.")
    .default(""),
  distanceAu: z
    .number({ error: "Enter a distance from the sun." })
    .min(
      PLANET_DISTANCE_AU.min,
      "Any closer and the sun would swallow it (min 0.1 AU).",
    )
    .max(
      PLANET_DISTANCE_AU.max,
      "That is beyond the edge of the system (max 10 AU).",
    ),
  size: z.number().min(PLANET_SIZE.min).max(PLANET_SIZE.max),
  characteristics: z
    .array(z.enum(PLANET_CHARACTERISTICS))
    .min(1, "Pick at least one characteristic."),
});

/** Raw form values before validation and defaults are applied. */
export type PlanetFormInput = z.input<typeof planetSchema>;

/** Validated, normalized planet values. */
export type PlanetValues = z.output<typeof planetSchema>;

export type Planet = Entity & PlanetValues;

export const defaultPlanetFormValues: PlanetFormInput = {
  name: "",
  description: "",
  // Intentionally empty so the number input starts blank.
  distanceAu: undefined as unknown as number,
  size: 4,
  characteristics: [],
};

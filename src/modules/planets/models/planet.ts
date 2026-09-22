import { z } from "zod";

import type { Entity } from "~/modules/shared/models/entity";
import { PLANET_CHARACTERISTICS } from "./planet-characteristic";

/** Distance from the sun in astronomical units (1 AU = Earth's orbit). */
export const PLANET_DISTANCE_AU = { min: 0.1, max: 10, step: 0.1 } as const;

export const PLANET_SIZE = { min: 1, max: 10, step: 1 } as const;

export const planetSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50, "Name must be 50 characters or fewer"),
  description: z.string().max(280, "Description must be 280 characters or fewer"),
  distanceAu: z
    .number({ message: "Enter a distance" })
    .min(PLANET_DISTANCE_AU.min, `Distance must be at least ${PLANET_DISTANCE_AU.min} AU`)
    .max(PLANET_DISTANCE_AU.max, `Distance must be at most ${PLANET_DISTANCE_AU.max} AU`),
  size: z
    .number()
    .int()
    .min(PLANET_SIZE.min)
    .max(PLANET_SIZE.max),
  characteristics: z.array(z.enum(PLANET_CHARACTERISTICS)),
});

export type PlanetValues = z.infer<typeof planetSchema>;

export type Planet = Entity & PlanetValues;

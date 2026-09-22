import { useState, type FormEvent } from "react";

import { Button } from "~/modules/shared/components/button";
import {
  Field,
  FieldError,
  FieldHint,
  FieldLabel,
  Input,
  Textarea,
} from "~/modules/shared/components/field";
import { formatAuAsKm } from "~/modules/shared/lib/format";
import { PLANET_SIZE, planetSchema, type PlanetValues } from "../models/planet";
import type { PlanetCharacteristic } from "../models/planet-characteristic";
import { CharacteristicPicker } from "./characteristic-picker";

type PlanetFormProps = {
  onSubmit: (values: PlanetValues) => void;
  onCancel: () => void;
};

type FieldErrors = Partial<Record<keyof PlanetValues, string>>;

export const PlanetForm = ({ onSubmit, onCancel }: PlanetFormProps) => {
  // Each input is a plain controlled component: React state holds the value
  // and the input's onChange writes back to it.
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  // Kept as a string so the number input can start (and be cleared to) blank.
  const [distanceAu, setDistanceAu] = useState("");
  const [size, setSize] = useState(4);
  const [characteristics, setCharacteristics] = useState<
    PlanetCharacteristic[]
  >([]);
  const [errors, setErrors] = useState<FieldErrors>({});

  const parsedDistance = Number.parseFloat(distanceAu);
  const hasDistance = !Number.isNaN(parsedDistance);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = planetSchema.safeParse({
      name,
      description,
      distanceAu: parsedDistance,
      size,
      characteristics,
    });

    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof PlanetValues;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Field>
        <FieldLabel htmlFor="planet-name">Name</FieldLabel>
        <Input
          id="planet-name"
          name="name"
          placeholder="Kepler-442b"
          autoComplete="off"
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        {errors.name ? <FieldError>{errors.name}</FieldError> : null}
      </Field>

      <Field>
        <FieldLabel htmlFor="planet-description">Description</FieldLabel>
        <Textarea
          id="planet-description"
          name="description"
          placeholder="A tidally locked world with a single vast ocean."
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        {errors.description ? (
          <FieldError>{errors.description}</FieldError>
        ) : null}
      </Field>

      <Field>
        <FieldLabel htmlFor="planet-distance">Distance from Sun (AU)</FieldLabel>
        <Input
          id="planet-distance"
          name="distanceAu"
          type="number"
          inputMode="decimal"
          placeholder="1.0"
          value={distanceAu}
          onChange={(event) => setDistanceAu(event.target.value)}
        />
        <FieldHint>
          {hasDistance
            ? `About ${formatAuAsKm(parsedDistance)}.`
            : "1 AU is Earth's distance from the sun. Enter 0.1 to 10."}
        </FieldHint>
        {errors.distanceAu ? (
          <FieldError>{errors.distanceAu}</FieldError>
        ) : null}
      </Field>

      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor="planet-size">Size</FieldLabel>
          <span className="text-sm tabular-nums text-ink-muted">
            {size} / {PLANET_SIZE.max}
          </span>
        </div>
        <input
          id="planet-size"
          name="size"
          type="range"
          min={PLANET_SIZE.min}
          max={PLANET_SIZE.max}
          step={PLANET_SIZE.step}
          value={size}
          onChange={(event) => setSize(event.target.valueAsNumber)}
        />
        <FieldHint>1 is a small moon-like body, 10 is a gas giant.</FieldHint>
      </Field>

      <Field>
        <FieldLabel>Planetary Characteristics</FieldLabel>
        <CharacteristicPicker
          value={characteristics}
          onChange={setCharacteristics}
        />
        <FieldHint>
          Combine traits to shape the planet&apos;s appearance.
        </FieldHint>
      </Field>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Planet</Button>
      </div>
    </form>
  );
};

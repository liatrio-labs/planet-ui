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
import {
  PLANET_DISTANCE_AU,
  PLANET_SIZE,
  type PlanetValues,
} from "../models/planet";
import type { PlanetCharacteristic } from "../models/planet-characteristic";
import { CharacteristicPicker } from "./characteristic-picker";

type PlanetFormProps = {
  onSubmit: (values: PlanetValues) => void;
  onCancel: () => void;
};

type PlanetFormErrors = {
  name?: string;
  distanceAu?: string;
};

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
  const [errors, setErrors] = useState<PlanetFormErrors>({});

  const parsedDistance = Number.parseFloat(distanceAu);
  const hasDistance = !Number.isNaN(parsedDistance);

  const validate = (): PlanetFormErrors => {
    const nextErrors: PlanetFormErrors = {};

    if (name.trim() === "") {
      nextErrors.name = "Name is required.";
    }

    if (!hasDistance) {
      nextErrors.distanceAu = "Distance is required.";
    } else if (
      parsedDistance < PLANET_DISTANCE_AU.min ||
      parsedDistance > PLANET_DISTANCE_AU.max
    ) {
      nextErrors.distanceAu = `Enter a distance between ${PLANET_DISTANCE_AU.min} and ${PLANET_DISTANCE_AU.max} AU.`;
    }

    return nextErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      distanceAu: parsedDistance,
      size,
      characteristics,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <Field>
        <FieldLabel htmlFor="planet-name">Name</FieldLabel>
        <Input
          id="planet-name"
          name="name"
          placeholder="Kepler-442b"
          autoComplete="off"
          autoFocus
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (errors.name) {
              setErrors((current) => ({ ...current, name: undefined }));
            }
          }}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "planet-name-error" : undefined}
        />
        {errors.name ? (
          <FieldError id="planet-name-error">{errors.name}</FieldError>
        ) : null}
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
      </Field>

      <Field>
        <FieldLabel htmlFor="planet-distance">Distance from Sun (AU)</FieldLabel>
        <Input
          id="planet-distance"
          name="distanceAu"
          type="number"
          inputMode="decimal"
          placeholder="1.0"
          min={PLANET_DISTANCE_AU.min}
          max={PLANET_DISTANCE_AU.max}
          step={PLANET_DISTANCE_AU.step}
          value={distanceAu}
          onChange={(event) => {
            setDistanceAu(event.target.value);
            if (errors.distanceAu) {
              setErrors((current) => ({ ...current, distanceAu: undefined }));
            }
          }}
          aria-invalid={Boolean(errors.distanceAu)}
          aria-describedby={
            errors.distanceAu ? "planet-distance-error" : "planet-distance-hint"
          }
        />
        {errors.distanceAu ? (
          <FieldError id="planet-distance-error">
            {errors.distanceAu}
          </FieldError>
        ) : (
          <FieldHint id="planet-distance-hint">
            {hasDistance
              ? `About ${formatAuAsKm(parsedDistance)}.`
              : "1 AU is Earth's distance from the sun. Enter 0.1 to 10."}
          </FieldHint>
        )}
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

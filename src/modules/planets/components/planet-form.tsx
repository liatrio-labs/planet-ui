import { Controller, useForm } from "react-hook-form";

import { Button } from "~/modules/shared/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "~/modules/shared/components/ui/field";
import { Input } from "~/modules/shared/components/ui/input";
import { Slider } from "~/modules/shared/components/ui/slider";
import { Textarea } from "~/modules/shared/components/ui/textarea";
import { formatAuAsKm } from "~/modules/shared/lib/format";
import {
  defaultPlanetFormValues,
  PLANET_DISTANCE_AU,
  PLANET_SIZE,
  type PlanetValues,
} from "../models/planet";
import { CharacteristicPicker } from "./characteristic-picker";

type PlanetFormProps = {
  onSubmit: (values: PlanetValues) => void;
  onCancel: () => void;
};

export const PlanetForm = ({ onSubmit, onCancel }: PlanetFormProps) => {
  const form = useForm<PlanetValues>({
    defaultValues: defaultPlanetFormValues,
  });

  const distanceAu = form.watch("distanceAu");
  const size = form.watch("size") ?? PLANET_SIZE.min;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6"
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name="name"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="planet-name">Name</FieldLabel>
              <Input
                {...field}
                id="planet-name"
                placeholder="Kepler-442b"
                autoComplete="off"
                autoFocus
              />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="description"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="planet-description">Description</FieldLabel>
              <Textarea
                {...field}
                id="planet-description"
                placeholder="A tidally locked world with a single vast ocean."
                rows={3}
              />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="distanceAu"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="planet-distance">
                Distance from Sun (AU)
              </FieldLabel>
              <Input
                id="planet-distance"
                type="number"
                inputMode="decimal"
                min={PLANET_DISTANCE_AU.min}
                max={PLANET_DISTANCE_AU.max}
                step={PLANET_DISTANCE_AU.step}
                placeholder="1.0"
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={field.value ?? ""}
                onChange={(event) => {
                  const next = event.target.valueAsNumber;
                  field.onChange(Number.isNaN(next) ? undefined : next);
                }}
              />
              <FieldDescription>
                {typeof distanceAu === "number" && !Number.isNaN(distanceAu)
                  ? `About ${formatAuAsKm(distanceAu)}.`
                  : "1 AU is Earth's distance from the sun. Enter 0.1 to 10."}
              </FieldDescription>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="size"
          render={({ field }) => (
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="planet-size">Size</FieldLabel>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {size} / {PLANET_SIZE.max}
                </span>
              </div>
              <Slider
                id="planet-size"
                min={PLANET_SIZE.min}
                max={PLANET_SIZE.max}
                step={PLANET_SIZE.step}
                value={[field.value ?? PLANET_SIZE.min]}
                onValueChange={([next]) => field.onChange(next)}
                onBlur={field.onBlur}
              />
              <FieldDescription>
                1 is a small moon-like body, 10 is a gas giant.
              </FieldDescription>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="characteristics"
          render={({ field }) => (
            <Field>
              <FieldLabel>Planetary Characteristics</FieldLabel>
              <CharacteristicPicker
                value={field.value ?? []}
                onChange={field.onChange}
              />
              <FieldDescription>
                Combine traits to shape the planet&apos;s appearance.
              </FieldDescription>
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Save Planet
        </Button>
      </div>
    </form>
  );
};

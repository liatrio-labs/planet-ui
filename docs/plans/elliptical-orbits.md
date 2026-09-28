# Elliptical Orbits

Change planet orbits from perfect circles to ellipses, with a user-controllable
eccentricity, and render the true elliptical path.

## Context

The simulation is already Newtonian: `PlanetBody` applies an inverse-square pull
toward the origin every physics step (`useBeforePhysicsStep` in
`src/modules/solar-system/components/planet-body.tsx`). A circle is just the
`e = 0` special case of an ellipse under that force law, so **no change to the
force model is required**. Orbits are circular today only because the body is
seeded with the exact circular speed `sqrt(mu / r)` (`circularOrbitSpeed` in
`src/modules/planets/lib/orbit.ts`).

The work is therefore: (1) add an eccentricity input, (2) seed the initial
state from the vis-viva equation instead of the circular-speed shortcut, and
(3) draw an ellipse instead of a `ringGeometry`.

There is no persistence (`planets.store.ts` is in-memory Zustand, no `persist`
middleware), so no data migration is needed.

## Model

Let `a` = semi-major axis (scene units), `e` = eccentricity, `mu` =
`GRAVITATIONAL_PARAMETER`.

- Periapsis: `rp = a * (1 - e)`; apoapsis: `ra = a * (1 + e)`
- Vis-viva at periapsis: `vp = sqrt((mu / a) * ((1 + e) / (1 - e)))`
- Period: `T = 2 * PI * sqrt(a^3 / mu)`
- Semi-minor axis: `b = a * sqrt(1 - e^2)`; focal offset: `c = a * e`

Seed each planet **at periapsis**, with velocity perpendicular to the radius.
The existing `startAngleFromId(planet.id)` becomes the *argument of periapsis*,
so the same angle orients both the body's start point and the drawn ellipse.

The sun sits at a focus, not the centre, so the rendered ellipse must be
offset by `c` along the periapsis direction (toward apoapsis, i.e. at angle
`omega + PI`).

## Steps

### 1. Data model - `src/modules/planets/models/planet.ts`

- Add `export const PLANET_ECCENTRICITY = { min: 0, max: 0.8, step: 0.05 } as const;`
  (cap below 1; `0.8` keeps periapsis speeds sane for the fixed physics
  timestep - above ~0.9 Rapier's integrator visibly drifts at periapsis).
- Add `eccentricity: number;` to `PlanetValues`.
- Rename nothing else: `distanceAu` keeps its meaning but now maps to the
  **semi-major axis** rather than a circle radius. Document that in the
  existing doc comment on `PLANET_DISTANCE_AU`.

### 2. Orbit math - `src/modules/planets/lib/orbit.ts`

Keep `SUN_RADIUS`, `GRAVITATIONAL_PARAMETER`, `auToSceneDistance`,
`sizeToRadius`, `minOrbitRadius`, `startAngleFromId` unchanged. Then:

- Keep `circularOrbitSpeed` (still the `e = 0` case; used by tests and as a
  sanity reference) and add:
  - `periapsisDistance = (a, e) => a * (1 - e)`
  - `apoapsisDistance = (a, e) => a * (1 + e)`
  - `semiMinorAxis = (a, e) => a * Math.sqrt(1 - e * e)`
  - `periapsisSpeed = (a, e) => Math.sqrt((GRAVITATIONAL_PARAMETER / a) * ((1 + e) / (1 - e)))`
- Change `orbitalPeriodSeconds` to take the semi-major axis:
  `(a) => 2 * Math.PI * Math.sqrt((a * a * a) / GRAVITATIONAL_PARAMETER)`
  (identical to today's value when `e = 0`, so no caller breaks).
- Add a single **shared resolver** so the scene and the body cannot disagree:

  ```ts
  export type ResolvedOrbit = {
    semiMajorAxis: number;
    semiMinorAxis: number;
    eccentricity: number;
    /** Argument of periapsis, radians, in the XZ plane. */
    argumentOfPeriapsis: number;
    /** Scene position of the periapsis (where the body is seeded). */
    periapsisPosition: [number, number, number];
    /** Velocity at periapsis, tangent to the orbit. */
    periapsisVelocity: [number, number, number];
    /** Ellipse centre = sun focus offset by a*e away from periapsis. */
    center: [number, number, number];
  };

  export const resolveOrbit = (planet: Planet): ResolvedOrbit => { ... };
  ```

  Inside `resolveOrbit`:
  - `e = clamp(planet.eccentricity ?? 0, PLANET_ECCENTRICITY.min, PLANET_ECCENTRICITY.max)`
    (the `?? 0` keeps any planet created before this change valid).
  - **Clamp on periapsis, not on `a`** - this is the easy bug. Today's guard is
    `Math.max(auToSceneDistance(au), minOrbitRadius(r))`. It must become
    `a = Math.max(auToSceneDistance(au), minOrbitRadius(r) / (1 - e))`, otherwise
    a high-eccentricity planet dives into the sun at periapsis.
  - `omega = startAngleFromId(planet.id)`.
  - `periapsisPosition = [cos(omega) * rp, 0, sin(omega) * rp]`.
  - `periapsisVelocity = [sin(omega) * vp, 0, -cos(omega) * vp]` - same
    counter-clockwise tangent convention as the current code.
  - `center = [-cos(omega) * a * e, 0, -sin(omega) * a * e]`.

  Note `resolveOrbit` needs `sizeToRadius(planet.size)` for the clamp, so it
  takes the whole `Planet` (or `{ id, size, distanceAu, eccentricity }`).

### 3. Body seeding - `src/modules/solar-system/components/planet-body.tsx`

- Replace the inline `useMemo` orbit math with a call to `resolveOrbit(planet)`;
  set `position` from `periapsisPosition` and `linearVelocity` from
  `periapsisVelocity`. Drop the now-unused `circularOrbitSpeed`,
  `auToSceneDistance`, `minOrbitRadius`, `startAngleFromId` imports.
- Keep `radius`, `angularVelocity`, and `appearance` derivation as-is.
- Leave `useBeforePhysicsStep` **unchanged** - the inverse-square force already
  produces the ellipse. Update its doc comment ("seeded with a circular-orbit
  velocity" -> "seeded at periapsis with its vis-viva velocity").
- If visible precession appears at high `e`, add a fixed `timeStep={1 / 120}` to
  `<Physics>` in `solar-system-scene.tsx`. Verify visually before changing it.

### 4. Orbit path rendering - `src/modules/solar-system/components/orbit-ring.tsx`

`ringGeometry` can only draw a circle, so replace it.

- New props: `{ semiMajorAxis, semiMinorAxis, rotation, center }` (drop `radius`).
- Build the path with `three`'s `EllipseCurve`:
  `new EllipseCurve(0, 0, semiMajorAxis, semiMinorAxis, 0, 2 * Math.PI, false, 0)`
  then `.getPoints(180)`, mapped to `new Vector3(p.x, 0, p.y)` inside a `useMemo`.
- Render with drei's `<Line points={points} color="#ffffff" transparent
  opacity={0.12} lineWidth={1} />`, wrapped in a `<group position={center}
  rotation-y={-rotation} />` so the ellipse is oriented by the argument of
  periapsis and the sun lands on the focus.
  - Sign check: the curve's local `+x` axis must point at periapsis. Since the
    XZ mapping is `(x, y) -> (x, 0, y)`, a scene angle `omega` about `+Y`
    corresponds to `rotation-y={-omega}`. Verify with a single high-`e` planet -
    the body should visibly start at the *close* end of the drawn ellipse.
- Alternative if drei's `<Line>` (line2-based) proves awkward to unit test:
  a `<line>` with `<bufferGeometry>` + `setFromPoints` and `<lineBasicMaterial>`.
  Prefer drei's `<Line>` for consistent width; it is already a dependency.
- Consider renaming the file/component to `orbit-path.tsx` / `OrbitPath` since
  it is no longer a ring. Update imports in `solar-system-scene.tsx` and rename
  the test file alongside it.

### 5. Scene wiring - `src/modules/solar-system/components/solar-system-scene.tsx`

Replace the inline radius computation in the `planets.map(...)` orbit-ring block
with `resolveOrbit(planet)` and spread the resolved values into `<OrbitPath>`.
This removes the duplicated clamp logic that currently lives in both the scene
and `planet-body.tsx`.

### 6. Form control - `src/modules/planets/components/planet-form.tsx`

- Add `const [eccentricity, setEccentricity] = useState(0);`
- Add a `<Field>` after the Size field, modelled on the existing size slider:
  - `<FieldLabel htmlFor="planet-eccentricity">Orbit Shape</FieldLabel>`
  - readout `<span>` showing `eccentricity.toFixed(2)`
  - `<input type="range" id="planet-eccentricity" name="eccentricity"
    min={PLANET_ECCENTRICITY.min} max={PLANET_ECCENTRICITY.max}
    step={PLANET_ECCENTRICITY.step} value={eccentricity}
    onChange={(event) => setEccentricity(event.target.valueAsNumber)} />`
  - `<FieldHint>` that is dynamic and useful: at `0` say "A perfect circle.";
    otherwise report periapsis/apoapsis in AU using `formatAu` from
    `~/modules/shared/lib/format`, e.g. "Ranges from 0.7 AU to 1.3 AU."
    (guard on `hasDistance`, which the file already computes).
- Include `eccentricity` in the `onSubmit` payload.
- `docs/CONTRIBUTING.md` calls for Zod form validation, but `zod` is not a
  dependency and this form uses plain controlled state. Follow the existing
  file's pattern; do not add a dependency (the repo is local-only).

### 7. List display - `src/modules/planets/components/planet-list-item.tsx`

Extend the metadata line so eccentricity is visible without opening the form.
Only render the extra segment when `planet.eccentricity > 0`, e.g.
`e {planet.eccentricity.toFixed(2)}`, to keep circular planets uncluttered.

### 8. Tests

- **New** `src/modules/planets/lib/orbit.test.ts` (none exists today):
  - `resolveOrbit` with `e = 0` reproduces the old values exactly -
    the magnitude of `periapsisPosition` equals `auToSceneDistance(au)` and the
    magnitude of `periapsisVelocity` equals `circularOrbitSpeed(r)`. This is the
    key regression guard.
  - `periapsisSpeed` exceeds `circularOrbitSpeed` for `e > 0`.
  - Specific orbital energy `v^2/2 - mu/r` equals `-mu/(2a)` at periapsis.
  - The clamp keeps periapsis at or above `minOrbitRadius(sizeToRadius(size))`
    for `distanceAu = 0.1, size = 10, e = 0.8`.
  - `periapsisVelocity` dotted with `periapsisPosition` is 0 (perpendicular).
- `src/modules/solar-system/components/orbit-ring.test.tsx`: rewrite. The
  current assertions on `ringGeometry.parameters` no longer apply. Assert the
  generated point set instead: max absolute x is close to `a`, max absolute z is
  close to `b` before rotation, every y is 0, plus the group's `position` and
  `rotation-y`.
- `src/modules/solar-system/components/planet-body.test.tsx`: the
  "seeds a dynamic, undamped rigid body on a circular orbit" case (around line
  92) computes the expected position/velocity inline - update it to use
  `resolveOrbit`, and add an eccentric case asserting the body starts at
  `a(1-e)` with the faster periapsis speed. The force-direction tests (around
  lines 223-249) need no change.
- `src/modules/solar-system/components/solar-system-scene.test.tsx`: the
  `OrbitRing` mock (around line 45) takes `{ radius }`; change it to the new
  props and update "matches each orbit ring radius to the body's actual orbit"
  (around line 141) to compare against `resolveOrbit`.
- `src/modules/planets/components/planet-form.test.tsx`: add the eccentricity
  slider to "renders all fields with their defaults", add a bounds test
  mirroring "constrains the size slider to PLANET_SIZE bounds", and add
  `eccentricity: 0` to the expected payload in "submits the collected values".
- `src/modules/planets/store/planets.store.test.ts` and
  `add-planet-dialog.test.tsx`: add `eccentricity` to any `PlanetValues`
  fixtures the compiler flags.

### 9. Verify

- `npm run typecheck` - the new required `eccentricity` field will surface every
  fixture that needs updating.
- `npm test`
- `npm run dev` and check visually: a planet at `e = 0` still traces the drawn
  path exactly; at `e = 0.6` the body speeds up at periapsis, slows at apoapsis,
  stays on the drawn ellipse over several revolutions (no drift or precession),
  and the sun sits at a focus rather than the centre.

## Risks

- **Path/body mismatch.** If the rendered ellipse and the seeded state are
  derived separately they will drift apart. Routing both through `resolveOrbit`
  is the mitigation, and the `e = 0` regression test is the guard.
- **Integrator error at high eccentricity.** A fixed-timestep integrator loses
  accuracy where the body moves fastest. Capping `e` at `0.8` and, if needed,
  raising the physics timestep keeps the orbit closed.
- **Sun collision.** Handled by clamping on periapsis rather than on `a`.

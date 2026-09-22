# Planet UI

Build a custom solar system and watch it orbit in real time. Add planets with a
name, description, distance from the sun, size, and a mix of planetary
characteristics, then see them rendered in a 3D, physics-driven scene.

Everything runs locally in the browser. There is no backend and no network
access at runtime.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

Other scripts:

```bash
npm run typecheck   # React Router typegen + tsc
npm run build       # production build (SPA mode) into ./build
npm run start       # serve the production build
```

## How It Works

- **Side pane** lists the sun and every planet you have added. **Add Planet**
  opens a modal form built with React Hook Form.
- **Characteristics** (rocky, oceans, gas giant, icy, volcanic, desert, toxic,
  clouded, ringed, glowing) are blended into a material, optional atmosphere,
  and optional ring system.
- **Physics**: each planet is a Rapier dynamic rigid body seeded with a
  circular-orbit velocity. Every physics step applies the sun's gravitational
  pull (`a = μ / r²`), so orbits emerge from the simulation. Distance is entered
  in astronomical units (0.1 to 10 AU) and compressed with a square-root scale
  so inner and outer planets fit on screen.
- **Camera**: drag to orbit, scroll to zoom.

## Tech Stack

- React 19 + React Router v8 (framework mode, SPA)
- Tailwind CSS v4 (no component library; small hand-rolled primitives in `src/modules/shared/components`)
- React Hook Form
- React Three Fiber, Drei, and Rapier
- Zustand

## Project Structure

```
src/
├── root.tsx                # document shell, error boundary
├── routes.ts               # route config
├── routes/home.tsx         # index route
└── modules/
    ├── app/                # layout and side pane
    ├── planets/            # planet models, store, form, list
    │   ├── components/
    │   ├── lib/            # orbit math, appearance derivation
    │   ├── models/         # planet types + characteristic catalog
    │   └── store/          # Zustand store
    ├── solar-system/       # R3F canvas, sun, planet bodies, physics
    └── shared/             # shared UI primitives, env config, models/utils
```

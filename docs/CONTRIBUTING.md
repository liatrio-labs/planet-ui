# CONTIBUTING TO PLANET UI

## Scope

- Local only, no network access or external services should be used

## Technology

- Zod for form validation
- Tailwind CSS only for styling, no component library. Shared primitives (button, modal, form fields) live in `src/modules/shared/components` and wrap native HTML elements
- React Three Fiber/Drei/Rapier for 3D solar system canvas and physics
- Zustand for state management

## Coding Standards

- Modular code structure with `src/modules/<module>`, `src/modules/app/` (main app component, layout, etc.) and `src/modules/shared` (shared models, env config), with sub-modules created as necessary to break down components/code
- Use `src/modules/shared/env.config.ts` to map environment variables and expose as single object as needed across application
- Models for each module stored relative to module under `<module>/models` directory
- Prefer arrow functions (e.g. `const doThing = (arg) => {}` or `export const MyComponent = ({myProp}) => {}`) over function declarations (e.g. DO NOT USE `function MyFunction` to delcare functions or components)
- One component per file, keep components small and break down early
- React files should be named following convention of `<name>.<purpose>.<extension>` e.g. `planet.component.ts` (React component) or `planet.store.ts` (state management store)

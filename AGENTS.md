# Planet UI

Users can create a custom solar system and view a real-time visual, physics-based models of the custom solar system.

## Goal

- Users land on the home page to view side pane with sun/planets and solar system rendering with single sun rendered in "space" as the default
- User clicks "Add Planet" button in "Solar System" side pane
- Floating, fixed modal form shows up to customize the planet including: Name, Description, Distance from Sun (in AU, 0.1 through 10), Size, Planetary Characteristics (pick list of various planetary characteristics that determine appearance of planet e.g. `rocky` and `oceans` may look similar to Earth)
- User clicks "Save Planet"
- User should immediately see solar system rendering updated with the new planet rotating around the sun in 3D space in real time

## Scope

- Local only, no network access or external services should be used

## Technology

- Zod for form validation
- Use `shadcn@latest` as component library
- React Hook Form for custom forms
- React Three Fiber/Drei/Rapier for 3D solar system canvas and physics
- Zustand for state management

## Coding Standards

- Modular code structure with `src/modules/<module>`, `src/modules/app/` (main app component, layout, etc.) and `src/modules/shared` (shared models, env config), with sub-modules created as necessary to break down components/code
- Use `src/modules/shared/env.config.ts` to map environment variables and expose as single object as needed across application
- Models for each module stored relative to module under `<module>/models` directory
- Prefer arrow functions (e.g. `const doThing = (arg) => {}` or `export const MyComponent = ({myProp}) => {}`) over function declarations (e.g. DO NOT USE `function MyFunction`)
- One component per file, keep components small and break down early
- React files should be named following convention of `<name>.<purpose>.<extension>` e.g. `planet.component.ts` (React component) or `planet.store.ts` (state management store)

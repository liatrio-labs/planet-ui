/**
 * A frame-rate friendly registry of where each body currently is in the scene.
 *
 * Planet positions change every physics step, so they are deliberately kept
 * out of React state. Bodies register a position getter on mount and the
 * camera reads it directly inside its frame loop.
 */

export type BodyPosition = { x: number; y: number; z: number };

type PositionGetter = () => BodyPosition;

const registry = new Map<string, PositionGetter>();

export const registerBody = (id: string, getPosition: PositionGetter) => {
  registry.set(id, getPosition);
  return () => {
    if (registry.get(id) === getPosition) registry.delete(id);
  };
};

export const getBodyPosition = (id: string): BodyPosition | null =>
  registry.get(id)?.() ?? null;

export const clearBodyRegistry = () => registry.clear();

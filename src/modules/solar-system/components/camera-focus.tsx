import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { MathUtils, Vector3 } from "three";

import { SUN_ID, usePlanetsStore } from "~/modules/planets/store/planets.store";
import { getBodyPosition } from "../lib/body-registry";

type FocusControls = {
  target: Vector3;
  update: () => void;
};

/** Higher values snap to the target faster; ~6 settles within a second. */
const FOLLOW_LAMBDA = 6;

const ORIGIN = { x: 0, y: 0, z: 0 };

/**
 * Keeps the orbit controls' target glued to the focused body. The camera is
 * moved by the same offset as the target, so the user's chosen zoom and angle
 * survive both the initial glide and following a moving planet.
 */
export const CameraFocus = () => {
  const focusedBodyId = usePlanetsStore((state) => state.focusedBodyId);
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as FocusControls | null;
  const desired = useRef(new Vector3());
  const previous = useRef(new Vector3());

  useFrame((_, delta) => {
    if (!focusedBodyId || !controls) return;

    const position =
      focusedBodyId === SUN_ID ? ORIGIN : getBodyPosition(focusedBodyId);
    if (!position) return;

    desired.current.set(position.x, position.y, position.z);
    previous.current.copy(controls.target);

    const t = 1 - Math.exp(-FOLLOW_LAMBDA * delta);
    controls.target.x = MathUtils.lerp(previous.current.x, desired.current.x, t);
    controls.target.y = MathUtils.lerp(previous.current.y, desired.current.y, t);
    controls.target.z = MathUtils.lerp(previous.current.z, desired.current.z, t);

    camera.position.add(controls.target.clone().sub(previous.current));
    controls.update();
  });

  return null;
};

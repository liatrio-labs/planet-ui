import { Line } from "@react-three/drei";
import { useMemo } from "react";
import { EllipseCurve, Vector3 } from "three";

/** Number of segments used to approximate the ellipse. */
export const ORBIT_PATH_SEGMENTS = 180;

/**
 * Points tracing an ellipse of the given axes in the XZ plane, centred on the
 * origin with periapsis along local +x.
 */
export const ellipsePathPoints = (
  semiMajorAxis: number,
  semiMinorAxis: number,
  segments = ORBIT_PATH_SEGMENTS,
) =>
  new EllipseCurve(0, 0, semiMajorAxis, semiMinorAxis, 0, Math.PI * 2, false, 0)
    .getPoints(segments)
    .map((point) => new Vector3(point.x, 0, point.y));

type OrbitPathProps = {
  semiMajorAxis: number;
  semiMinorAxis: number;
  /** Argument of periapsis in radians, measured in the XZ plane. */
  rotation: number;
  /** Ellipse centre; offset from the sun so the sun sits at a focus. */
  center: [number, number, number];
};

/**
 * The faint ellipse a planet traces. Drawn centred on the ellipse's geometric
 * centre and rotated so its local +x axis points at periapsis, which puts the
 * sun (the origin) on a focus.
 */
export const OrbitPath = ({
  semiMajorAxis,
  semiMinorAxis,
  rotation,
  center,
}: OrbitPathProps) => {
  const points = useMemo(
    () => ellipsePathPoints(semiMajorAxis, semiMinorAxis),
    [semiMajorAxis, semiMinorAxis],
  );

  return (
    <group position={center} rotation-y={-rotation}>
      <Line points={points} color="#ffffff" transparent opacity={0.12} lineWidth={1} />
    </group>
  );
};

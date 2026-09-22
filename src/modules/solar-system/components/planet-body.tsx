import {
  BallCollider,
  RigidBody,
  useBeforePhysicsStep,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useEffect, useMemo, useRef } from "react";

import {
  circularOrbitSpeed,
  GRAVITATIONAL_PARAMETER,
  auToSceneDistance,
  minOrbitRadius,
  sizeToRadius,
  startAngleFromId,
} from "~/modules/planets/lib/orbit";
import { derivePlanetAppearance } from "~/modules/planets/lib/planet-appearance";
import type { Planet } from "~/modules/planets/models/planet";
import { registerBody } from "../lib/body-registry";
import { PlanetAtmosphere } from "./planet-atmosphere";
import { PlanetLabel } from "./planet-label";
import { PlanetRings } from "./planet-rings";

type PlanetBodyProps = {
  planet: Planet;
};

/**
 * A dynamic rigid body seeded with a circular-orbit velocity. Each physics step
 * we apply the sun's gravitational pull (a = mu / r^2) so the orbit emerges from
 * the simulation rather than from a scripted path.
 */
export const PlanetBody = ({ planet }: PlanetBodyProps) => {
  const bodyRef = useRef<RapierRigidBody>(null);

  const { radius, position, linearVelocity, angularVelocity, appearance } =
    useMemo(() => {
      const planetRadius = sizeToRadius(planet.size);
      const orbitRadius = Math.max(
        auToSceneDistance(planet.distanceAu),
        minOrbitRadius(planetRadius),
      );
      const angle = startAngleFromId(planet.id);
      const speed = circularOrbitSpeed(orbitRadius);

      return {
        radius: planetRadius,
        position: [
          Math.cos(angle) * orbitRadius,
          0,
          Math.sin(angle) * orbitRadius,
        ] as [number, number, number],
        // Tangent to the orbit (counter-clockwise when viewed from above).
        linearVelocity: [
          Math.sin(angle) * speed,
          0,
          -Math.cos(angle) * speed,
        ] as [number, number, number],
        angularVelocity: [0, 0.4 + planet.size * 0.05, 0] as [
          number,
          number,
          number,
        ],
        appearance: derivePlanetAppearance(planet.characteristics),
      };
    }, [planet]);

  // Expose the live position so the camera can centre on and follow this body.
  useEffect(
    () =>
      registerBody(planet.id, () => {
        const body = bodyRef.current;
        return body ? body.translation() : { x: 0, y: 0, z: 0 };
      }),
    [planet.id],
  );

  useBeforePhysicsStep(() => {
    const body = bodyRef.current;
    if (!body) return;

    const { x, y, z } = body.translation();
    const distanceSquared = x * x + y * y + z * z;
    if (distanceSquared < 1e-6) return;

    const distance = Math.sqrt(distanceSquared);
    const acceleration = GRAVITATIONAL_PARAMETER / distanceSquared;
    const force = acceleration * body.mass();

    body.resetForces(true);
    body.addForce(
      {
        x: (-x / distance) * force,
        y: (-y / distance) * force,
        z: (-z / distance) * force,
      },
      true,
    );
  });

  return (
    <RigidBody
      ref={bodyRef}
      type="dynamic"
      colliders={false}
      position={position}
      linearVelocity={linearVelocity}
      angularVelocity={angularVelocity}
      linearDamping={0}
      angularDamping={0}
      canSleep={false}
    >
      <BallCollider args={[radius]} mass={planet.size} />
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial
          color={appearance.color}
          emissive={appearance.emissive}
          emissiveIntensity={appearance.emissiveIntensity}
          roughness={appearance.roughness}
          metalness={appearance.metalness}
        />
      </mesh>
      {appearance.atmosphereColor && (
        <PlanetAtmosphere
          planetRadius={radius}
          color={appearance.atmosphereColor}
          opacity={appearance.atmosphereOpacity}
        />
      )}
      {appearance.hasRings && (
        <PlanetRings planetRadius={radius} color="#c8b89a" />
      )}
      <PlanetLabel name={planet.name} planetRadius={radius} />
    </RigidBody>
  );
};

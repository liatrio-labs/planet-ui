import { useFrame } from "@react-three/fiber";
import { BallCollider, RigidBody } from "@react-three/rapier";
import { useRef } from "react";
import type { Mesh } from "three";

import { SUN_RADIUS } from "~/modules/planets/lib/orbit";

export const Sun = () => {
  const surfaceRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (surfaceRef.current) {
      surfaceRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group>
      <RigidBody type="fixed" colliders={false}>
        <BallCollider args={[SUN_RADIUS]} />
        <mesh ref={surfaceRef}>
          <sphereGeometry args={[SUN_RADIUS, 64, 64]} />
          <meshStandardMaterial
            color="#ffb347"
            emissive="#ff8a00"
            emissiveIntensity={2.2}
            toneMapped={false}
          />
        </mesh>
      </RigidBody>
      {/* Soft corona halo */}
      <mesh>
        <sphereGeometry args={[SUN_RADIUS * 1.25, 32, 32]} />
        <meshBasicMaterial color="#ff9a1f" transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <pointLight color="#fff1d6" intensity={3.5} decay={0} />
    </group>
  );
};

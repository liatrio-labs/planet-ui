import { DoubleSide } from "three";

type OrbitRingProps = {
  radius: number;
};

export const OrbitRing = ({ radius }: OrbitRingProps) => (
  <mesh rotation-x={-Math.PI / 2}>
    <ringGeometry args={[radius - 0.03, radius + 0.03, 160]} />
    <meshBasicMaterial color="#ffffff" transparent opacity={0.12} side={DoubleSide} depthWrite={false} />
  </mesh>
);

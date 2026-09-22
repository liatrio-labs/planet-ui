import { DoubleSide } from "three";

type PlanetRingsProps = {
  planetRadius: number;
  color: string;
};

export const PlanetRings = ({ planetRadius, color }: PlanetRingsProps) => (
  <mesh rotation-x={-Math.PI / 2.4}>
    <ringGeometry args={[planetRadius * 1.5, planetRadius * 2.4, 96]} />
    <meshStandardMaterial
      color={color}
      transparent
      opacity={0.6}
      side={DoubleSide}
      roughness={0.9}
    />
  </mesh>
);

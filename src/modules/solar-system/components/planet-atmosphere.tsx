import { BackSide } from "three";

type PlanetAtmosphereProps = {
  planetRadius: number;
  color: string;
  opacity: number;
};

export const PlanetAtmosphere = ({
  planetRadius,
  color,
  opacity,
}: PlanetAtmosphereProps) => (
  <mesh>
    <sphereGeometry args={[planetRadius * 1.12, 32, 32]} />
    <meshStandardMaterial
      color={color}
      transparent
      opacity={opacity}
      side={BackSide}
      depthWrite={false}
      roughness={1}
    />
  </mesh>
);

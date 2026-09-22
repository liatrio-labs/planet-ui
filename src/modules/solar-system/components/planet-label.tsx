import { Html } from "@react-three/drei";

type PlanetLabelProps = {
  name: string;
  planetRadius: number;
};

export const PlanetLabel = ({ name, planetRadius }: PlanetLabelProps) => (
  <Html
    position={[0, planetRadius + 0.6, 0]}
    center
    distanceFactor={40}
    zIndexRange={[10, 0]}
    style={{ pointerEvents: "none" }}
  >
    <span className="rounded-full bg-black/50 px-2 py-0.5 text-xs whitespace-nowrap text-white/90 backdrop-blur-sm">
      {name}
    </span>
  </Html>
);

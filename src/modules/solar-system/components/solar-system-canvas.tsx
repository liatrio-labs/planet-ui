import { Canvas } from "@react-three/fiber";

import { SolarSystemScene } from "./solar-system-scene";

export const SolarSystemCanvas = () => (
  <Canvas
    dpr={[1, 2]}
    camera={{ position: [0, 42, 78], fov: 50, near: 0.1, far: 2000 }}
    gl={{ antialias: true }}
    className="size-full"
  >
    <SolarSystemScene />
  </Canvas>
);

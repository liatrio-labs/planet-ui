import { OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";

import { resolveOrbit } from "~/modules/planets/lib/orbit";
import { usePlanetsStore } from "~/modules/planets/store/planets.store";
import { CameraFocus } from "./camera-focus";
import { OrbitPath } from "./orbit-path";
import { PlanetBody } from "./planet-body";
import { SpaceBackground } from "./space-background";
import { Sun } from "./sun";

export const SolarSystemScene = () => {
  const planets = usePlanetsStore((state) => state.planets);

  return (
    <>
      <SpaceBackground />
      <ambientLight intensity={0.35} />

      {planets.map((planet) => {
        const orbit = resolveOrbit(planet);
        return (
          <OrbitPath
            key={`orbit-${planet.id}`}
            semiMajorAxis={orbit.semiMajorAxis}
            semiMinorAxis={orbit.semiMinorAxis}
            rotation={orbit.argumentOfPeriapsis}
            center={orbit.center}
          />
        );
      })}

      <Physics gravity={[0, 0, 0]}>
        <Sun />
        {planets.map((planet) => (
          <PlanetBody key={planet.id} planet={planet} />
        ))}
      </Physics>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={8}
        maxDistance={260}
        maxPolarAngle={Math.PI * 0.85}
      />
      <CameraFocus />
    </>
  );
};

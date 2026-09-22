import { OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";

import {
  auToSceneDistance,
  minOrbitRadius,
  sizeToRadius,
} from "~/modules/planets/lib/orbit";
import { usePlanetsStore } from "~/modules/planets/store/planets.store";
import { OrbitRing } from "./orbit-ring";
import { PlanetBody } from "./planet-body";
import { SpaceBackground } from "./space-background";
import { Sun } from "./sun";

export const SolarSystemScene = () => {
  const planets = usePlanetsStore((state) => state.planets);

  return (
    <>
      <SpaceBackground />
      <ambientLight intensity={0.35} />

      {planets.map((planet) => (
        <OrbitRing
          key={`orbit-${planet.id}`}
          radius={Math.max(
            auToSceneDistance(planet.distanceAu),
            minOrbitRadius(sizeToRadius(planet.size)),
          )}
        />
      ))}

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
    </>
  );
};

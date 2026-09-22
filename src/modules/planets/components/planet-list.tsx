import { usePlanetsStore } from "../store/planets.store";
import { PlanetListEmptyState } from "./planet-list-empty-state";
import { PlanetListItem } from "./planet-list-item";

export const PlanetList = () => {
  const planets = usePlanetsStore((state) => state.planets);
  const removePlanet = usePlanetsStore((state) => state.removePlanet);

  if (planets.length === 0) {
    return <PlanetListEmptyState />;
  }

  return (
    <ul className="flex flex-col gap-2">
      {planets.map((planet) => (
        <PlanetListItem key={planet.id} planet={planet} onRemove={removePlanet} />
      ))}
    </ul>
  );
};

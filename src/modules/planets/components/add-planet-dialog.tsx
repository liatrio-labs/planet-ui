import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "~/modules/shared/components/button";
import { Modal } from "~/modules/shared/components/modal";
import type { PlanetValues } from "../models/planet";
import { usePlanetsStore } from "../store/planets.store";
import { PlanetForm } from "./planet-form";

export const AddPlanetDialog = () => {
  const [open, setOpen] = useState(false);
  const addPlanet = usePlanetsStore((state) => state.addPlanet);

  const handleSubmit = (values: PlanetValues) => {
    addPlanet(values);
    setOpen(false);
  };

  return (
    <>
      <Button className="w-full" onClick={() => setOpen(true)}>
        <PlusIcon />
        Add Planet
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Planet"
        description="Describe a new world. It will start orbiting the sun as soon as you save it."
      >
        <PlanetForm onSubmit={handleSubmit} onCancel={() => setOpen(false)} />
      </Modal>
    </>
  );
};

import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "~/modules/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/modules/shared/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <PlusIcon />
          Add Planet
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Planet</DialogTitle>
          <DialogDescription>
            Describe a new world. It will start orbiting the sun as soon as you
            save it.
          </DialogDescription>
        </DialogHeader>
        <PlanetForm onSubmit={handleSubmit} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

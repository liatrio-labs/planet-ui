import { OrbitIcon } from "lucide-react";

export const PlanetListEmptyState = () => (
  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-10 text-center">
    <OrbitIcon className="size-8 text-muted-foreground/70" />
    <p className="text-sm font-medium">No planets yet</p>
    <p className="text-xs text-muted-foreground">
      Your sun is lonely. Add a planet to set it in orbit.
    </p>
  </div>
);

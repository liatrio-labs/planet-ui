import { SolarSystemCanvas } from "~/modules/solar-system/components/solar-system-canvas";
import { SolarSystemPane } from "./solar-system-pane";

export const AppLayout = () => (
  <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
    <SolarSystemPane />
    <main className="relative min-w-0 flex-1 bg-[#02020a]">
      <SolarSystemCanvas />
      <p className="pointer-events-none absolute bottom-3 right-4 text-xs text-white/40">
        Drag to orbit · scroll to zoom
      </p>
    </main>
  </div>
);

import { SolarSystemCanvas } from "~/modules/solar-system/components/solar-system-canvas";
import { SolarSystemPane } from "./solar-system-pane";

export const AppLayout = () => (
  <div className="flex h-screen w-screen overflow-hidden">
    <SolarSystemPane />
    <main className="relative min-w-0 flex-1 bg-space">
      <SolarSystemCanvas />
      <p className="pointer-events-none absolute bottom-3 right-4 text-xs text-white/40">
        Click a body to focus · drag to orbit · scroll to zoom
      </p>
    </main>
  </div>
);

import type { Route } from "./+types/home";
import { AppLayout } from "~/modules/app/app-layout";
import { env } from "~/modules/shared/env.config";

export const meta = (_: Route.MetaArgs) => [
  { title: env.appName },
  {
    name: "description",
    content: "Build a custom solar system and watch it orbit in real time.",
  },
];

const Home = () => <AppLayout />;

export default Home;

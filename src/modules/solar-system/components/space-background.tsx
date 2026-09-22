import { Stars } from "@react-three/drei";

export const SpaceBackground = () => (
  <>
    <color attach="background" args={["#02020a"]} />
    <Stars radius={300} depth={80} count={6000} factor={4} saturation={0} fade speed={0.4} />
  </>
);

"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";
import Spiral from "./Spiral";
import Wave from "./Wave";
import Truchet from "./Truchet";
import { Grid, OrbitControls, Stats } from "@react-three/drei";
import Raymarch from "./Raymarch";
import RaymarchWithAA from "./RaymarchWithAA";
import Plane3 from "./Plane3";
import NoiseGradient from "./NoiseGradient";
import Dispersion from "./Dispersion/Dispersion-study";
import FBOParticles from "./particle/ParticleText";
import ParticleImage from "./particleOnImage/particleImage";
// new THREE.Vector3((255, 246, 207))
const Scene = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5] }} dpr={[1, 2]} gl={{}} flat>
      <color attach={"background"} args={["black"]} />
      <ambientLight intensity={1.0} />
      <Dispersion />
      <OrbitControls />
      {/* <Grid /> */}
      <Stats />
    </Canvas>
  );
};
export default Scene;

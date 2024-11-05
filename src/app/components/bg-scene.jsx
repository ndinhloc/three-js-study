"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";

import Wave from "./bg-wave";

const Scene = () => {
  return (
    <Canvas
      camera={{ zoom: 1, position: [0, 12.5, 20] }}
      gl={{ antialias: true }}
      flat
      linear
    >
      <color attach="background" args={["white"]} />
      <Suspense fallback={null}>
        <Wave />
      </Suspense>
     
    </Canvas>
  );
};
export default Scene;

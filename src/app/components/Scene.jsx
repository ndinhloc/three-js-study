"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ScrollControls } from "@react-three/drei";

import { useRef, useMemo, Suspense, useEffect } from "react";
import * as THREE from "three";
import { Grid, OrbitControls, Stats, useTexture } from "@react-three/drei";

import LensScene from "./LensScene";
const Scene = ({ imgList, ...props }) => {
  
  return (
    <Canvas camera={{ position: [0, 0, 200] }} dpr={[1, 1]} orthographic flat>
      <color attach={"background"} args={["black"]} />
      <ambientLight intensity={1.0} />
      <Suspense fallback={null}>
        <LensScene imgList={imgList} />
      </Suspense>
      {/* <OrbitControls /> */}
      {/* <Stats /> */}
    </Canvas>
  );
};
export default Scene;

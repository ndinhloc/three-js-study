import { Line } from "@react-three/drei";
import React, { useMemo } from "react";
import * as THREE from "three";
function Curve() {
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-6, 1.5, -2),
        new THREE.Vector3(-3, 0.5, -1),
        new THREE.Vector3(-3, 0, 2),
        new THREE.Vector3(-2, 0, 3),
        new THREE.Vector3(0, 0, 2.75),
        new THREE.Vector3(1, 0.5, 0 ),
        new THREE.Vector3(5, 1.5, 0),
      ],
      false,
      "catmullrom",
      0.5
    );
  }, []);
  const linePoints = useMemo(() => {
    return curve.getPoints(100);
  }, [curve]);
  return (
    <mesh>
      <Line points={linePoints} color={"white"} lineWidth={1}></Line>
    </mesh>
  );
}

export default Curve;

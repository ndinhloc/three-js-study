import {
  Box,
  MeshTransmissionMaterial,
  Plane,
  Sphere,
  Torus,
  useTexture,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Physics, RigidBody, CuboidCollider, quat } from "@react-three/rapier";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import Dispersion from "../Dispersion/Dispersion-study";
const BallTable = () => {
  const tex = useTexture("/bg.jpg");
  const width = window.innerWidth;
  const height = window.innerHeight;
  const ballRadius = Math.floor(height / 16);
  const tableRef = useRef();
  useFrame((state) => {
    const { clock, pointer } = state;
    tableRef.current.setNextKinematicRotation(
      new THREE.Quaternion(pointer.y * 0.1, 0, pointer.x * 0.1)
    );
  });
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight
        position={[20, 200, 0]}
        intensity={10}
        color={new THREE.Color("0xffffff")}
      />
      <mesh position={[0, -200, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial side={THREE.DoubleSide} map={tex} />
      </mesh>
      <Physics debug>
        <RigidBody
          colliders={"ball"}
          gravityScale={100}
          position={[-100, 0, 0]}
        >
          <Dispersion />
        </RigidBody>
        {/* <RigidBody colliders={"ball"} gravityScale={100} position={[100, 0, 0]}>
          <Sphere args={[100]}>
            <MeshTransmissionMaterial
              thickness={20}
              chromaticAberration={0.5}
            />
          </Sphere>
        </RigidBody> */}

        {/* floor */}
        <RigidBody type="kinematicPosition" colliders={false} ref={tableRef}>
          <CuboidCollider
            position={[0, -102, 0]}
            args={[width / 2, 0.5, height / 2]}
          />

          {/* wall */}
          <CuboidCollider
            position={[-width / 2, 50, 0]}
            args={[0.5, 100, height / 2]}
          />
          <CuboidCollider
            position={[0, 50, -height / 2]}
            args={[width / 2, 100, 0.5]}
          />
          <CuboidCollider
            position={[width / 2, 50, 0]}
            args={[0.5, 100, height / 2]}
          />
          <CuboidCollider
            position={[0, 50, height / 2]}
            args={[width / 2, 100, 0.5]}
          />
          <CuboidCollider
            position={[0, 100, 0]}
            args={[width / 2, 0.5, height / 2]}
          />
        </RigidBody>
      </Physics>
    </>
  );
};
export default BallTable;

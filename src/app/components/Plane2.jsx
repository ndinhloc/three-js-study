import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture, Line } from "@react-three/drei";
import { useControls } from "leva";

import * as THREE from "three";

const Plane2 = () => {
  const state = useThree();
  const orb1 = useRef(null);
  const orb2 = useRef(null);

  const curve1 = new THREE.EllipseCurve(4, 4, 4, 6, 0, 2 * Math.PI, true, 0);

  const listPoint1 = curve1.getPoints(100);
  const geometry1 = new THREE.BufferGeometry().setFromPoints(listPoint1);
  const material1 = new THREE.LineBasicMaterial({ color: 0xffffff });

  const curve2 = new THREE.EllipseCurve(4, 4, 4, 6, 0, 2 * Math.PI, true, 0);
  const listPoint2 = curve1.getPoints(100);
  const geometry2 = new THREE.BufferGeometry().setFromPoints(listPoint2);
  const material2 = new THREE.LineBasicMaterial({ color: 0xfff000 });

  const $mesh = useRef();
  const { viewport } = useThree();
  const shaderArgs = useMemo(
    () => ({
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */ `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          vec3 pos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
        }
      `,
      fragmentShader: /* glsl */ `
      uniform float uTime;
      const float PI = 3.1415;      
      varying vec2 vUv;
      void main() {
        float t = uTime;
        vec2 st = -1.0 + 2.0 *vUv;
        
        st = vec2(st.x,st.y);
        
        
        gl_FragColor = vec4(st,0.0,1.0);
      }
      `,
    }),
    []
  );
  let v1 = new THREE.Vector3();
  let v2 = new THREE.Vector3();
  useFrame((_, delta) => {
    let t = (state.clock.getElapsedTime() * 0.5) % 1;
    let t2 = (state.clock.getElapsedTime() * 0.5 + 0.5) % 1;
    curve1.getPointAt(t, v1);
    v1 = new THREE.Vector3(v1.x - 6, v1.y - 4, v1.z);
    curve2.getPointAt(t2, v2);
    v2 = new THREE.Vector3(v2.x - 2, v2.y - 4, v2.z);

    orb1.current.position.copy(v1);
    orb2.current.position.copy(v2);
  });
  return (
    <>
      <group>
        <group ref={orb1}>
          <pointLight args={[0xffffff, 100, 100]} />
          <mesh>
            <circleGeometry args={[0.5, 16]} />
            <meshStandardMaterial
              emissiveIntensity={1}
              emissive={new THREE.Color(0.2, 0.2, 1)}
            />
          </mesh>
        </group>
        <mesh ref={orb2}>
          <circleGeometry args={[0.5, 16]} />
          <meshStandardMaterial
            emissiveIntensity={1}
            emissive={new THREE.Color(0.2, 0.2, 1)}
          />
        </mesh>
      </group>
    </>
  );
};

export default Plane2;

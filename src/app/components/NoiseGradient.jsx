import { useEffect, useMemo, useRef } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";

import { useFBO, useTexture } from "@react-three/drei";
import * as THREE from "three";

const NoiseGradient = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const $mesh = useRef();

  const shaderArgs = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(width, height) },
      },
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
      uniform vec2 uRes;
      const float PI = 3.1415;
      const float twopi = 6.28318531; 
      
      varying vec2 vUv;

      float hash21(vec2 p)
      {
        vec3 p3  = fract(vec3(p.xyx) * .1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);

      }
      void main() {
        vec2 uv = (gl_FragCoord.xy -0.5 * uRes.xy)/uRes.y;
        // uv -= uTime*0.1;
        uv.x *= sin(uTime);
        vec2 gv = fract(uv)-0.5;
        vec2 id = floor(uv);
        vec3 col = vec3(0.);
        float n = hash21(id);
        
        
        
        
        col = vec3(uv.x);


        gl_FragColor = vec4(col,1.);
      }
      `,
    }),
    []
  );

  useFrame((state, delta) => {
    $mesh.current.material.uniforms.uTime.value += delta * 1.3;
  });
  return (
    <>
      <mesh ref={$mesh}>
        <planeGeometry args={[width, height]} />
        <shaderMaterial args={[shaderArgs]} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
};

export default NoiseGradient;

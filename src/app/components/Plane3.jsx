import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture, Line } from "@react-three/drei";
import { useControls } from "leva";

import * as THREE from "three";

const Plane3 = () => {
  const { viewport } = useThree();
  const mesh = useRef();
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
        vec2 f = vec2(1.,1.);
        vec2 u = vUv;
        vec4 color = vec4(0.);
        color = color + length(u = 9. * (u + u - f) / f.y) - 6.;

        for (float i, t = .1 * uTime; i++ < 9.; color += .5 * abs(f.x+f.y) * color.x) {
            u *= mat2(cos(t * cos(i) + i + vec4(0,11,33,0))),
            f = cos(u.yx - cos(f)),
            u += .5 * f + t;
        }
        color = exp(2. / exp(1e-3 * color * color * vec4(7,3,1,0)) - 2.);  
        float alpha = length(color) > 0.0 ? 1.0 : 0.0;
        gl_FragColor = (color);
      }
      `,
    }),
    []
  );
  useFrame((_, delta) => {
    mesh.current.material.uniforms.uTime.value += delta;
  });

  return (
    <>
      <mesh ref={mesh}>
        <planeGeometry args={[1, 1, 3, 3]} />
        <shaderMaterial args={[shaderArgs]} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
};

export default Plane3;

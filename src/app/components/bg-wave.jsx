import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Wave() {
  const ref = useRef(null);
  const controlRef = useRef(null);
  const shaderArgs = useMemo(
    () => ({
      uniforms: {
        color: { value: new THREE.Vector3(0.855, 0.855, 0.855) },

        uTime: { value: 0.0 },
      },
      vertexShader: `
            attribute float scale;
           
            uniform float uTime;

            void main() {
                
                vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                gl_PointSize = scale * ( 300.0 / - mvPosition.z );

                gl_Position = projectionMatrix * mvPosition;
            }`,
      fragmentShader: `
            uniform vec3 color;

            void main() {

                if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;

                gl_FragColor = vec4( color, 1.0 );

            }`,
    }),
    []
  );

  const countX = 50;
  const countY = 50;
  const { position, scale } = useMemo(() => {
    const scale = new Float32Array(countX * countY);

    const position = new Float32Array(countX * countY * 3);
    for (let i = 0; i < countX * countY; i++) {
      let x = (i % countX) - 25;
      let z = Math.floor(i / countY) - 25;
      let y = 0;
      position.set([x, y, z], i * 3);
      scale.set(1, i);
    }
    return { position, scale };
  }, [countX, countY]);
  let count = 0;
  useFrame((state) => {
    controlRef.current.object.position.x = THREE.MathUtils.lerp(
      controlRef.current.object.position.x,
      -state.pointer.x * 12.5,
      0.1
    );
    controlRef.current.object.position.y = THREE.MathUtils.lerp(
      controlRef.current.object.position.y,
      (state.pointer.y + 1) * 6.25,
      0.05
    );
    for (let i = 0; i < countX * countY; i++) {
      let i3 = i * 3;
      ref.current.geometry.attributes.position.array[i3 + 1] =
        Math.sin(((i % countX) + count) * 0.3) * 0.8 +
        Math.sin((Math.floor(i / countY) + count) * 0.5) * 0.8;
      ref.current.geometry.attributes.scale.array[i] =
        (Math.sin(((i % countX) + count) * 0.3) + 1) * 0.2 +
        (Math.sin((Math.floor(i / countY) + count) * 0.5) + 1) * 0.2;
      ref.current.geometry.attributes.position.needsUpdate = true;
      ref.current.geometry.attributes.scale.needsUpdate = true;
    }
    count += 0.1;
    return null;
  });
  return (
    <>
      <OrbitControls ref={controlRef} enableDamping={false} enablePan={false} />
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={position.length / 3}
            array={position}
            itemSize={3}
          ></bufferAttribute>
          <bufferAttribute
            attach="attributes-scale"
            count={countX * countY}
            itemSize={1}
            array={scale}
          ></bufferAttribute>
        </bufferGeometry>
        <shaderMaterial args={[shaderArgs]}></shaderMaterial>
      </points>
    </>
  );
}

export default Wave;

import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";

function ParticleImage() {
  const ref = useRef(null);
  const eventPlane = useRef(null);
  const tex = useTexture("/test.jpg");
  const multiplier = 20;
  const countX = 16 * multiplier;
  const countY = 9 * multiplier;
  const { pointer } = useThree();

  const { position } = useMemo(() => {
    let vertices = [];
    for (let i = 0; i < countX; i++) {
      for (let j = 0; j < countY; j++) {
        let x = i - countX / 2;
        let y = j - countY / 2;
        let z = 0;
        let point = [x, y, z];
        vertices.push(...point);
      }
    }
    const position = new Float32Array(vertices);
    return { position };
  }, [countX, countY]);
  const shaderArgs = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0.0 },
        uTex: { value: tex },
        uCountX: { value: countX },
        uCountY: { value: countY },
        uMouseX: { value: 0.0 },
        uMouseY: { value: 0.0 },
      },
      vertexShader: /* glsl */ `
            uniform float uTime;
            varying vec2 vUv;
            uniform float uMouseX;
            uniform float uMouseY;

            void main() {
                vUv = position.xy;
                float dist = distance(vec2(uMouseX, uMouseY), position.xy);
                float strength = smoothstep(50., 0.0, dist);
                vec3 displacedPosition = position + normalize(vec3(position.xy - vec2(uMouseX, uMouseY), 10.0)) *10.* strength;
                vec4 mvPosition = modelViewMatrix * vec4( displacedPosition, 1.0 );
                gl_PointSize = 3.5;

                gl_Position = projectionMatrix * mvPosition;
            }`,
      fragmentShader: /* glsl */ `
            uniform sampler2D uTex;
            varying vec2 vUv;
            uniform float uCountX;
            uniform float uCountY;
            void main() {
                float offsetX = vUv.x/uCountX;
                float offsetY = vUv.y/uCountY;
                vec2 texCoord = vec2(offsetX,offsetY);
                texCoord += 0.5;
                vec3 col = texture(uTex,texCoord ).rgb;
                if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;
                gl_FragColor = vec4( col, 1.0 );
            }`,
    }),
    []
  );
  //   let vec = new THREE.Vector3();

  useFrame((state) => {
    const { camera, raycaster, clock } = state;
    raycaster.setFromCamera(pointer, camera);
    let pointerWorld = new THREE.Vector3(pointer.x, pointer.y, 0.5);
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // Normal is along z-axis, d = 0 for z = 0 plane
    const intersectPoint = new THREE.Vector3();

    // Get the intersection point of the ray with the z = 0 plane
    raycaster.ray.intersectPlane(planeZ, intersectPoint);
    pointerWorld.unproject(camera);
    ref.current.material.uniforms.uMouseX.value = intersectPoint.x;
    ref.current.material.uniforms.uMouseY.value = intersectPoint.y;
    ref.current.material.uniforms.uTime.value = clock.elapsedTime;
    return null;
  });
  return (
    <>
      <points ref={ref}>
        <bufferGeometry center={true}>
          <bufferAttribute
            attach="attributes-position"
            count={position.length / 3}
            array={position}
            itemSize={3}
          ></bufferAttribute>
        </bufferGeometry>
        <shaderMaterial args={[shaderArgs]}></shaderMaterial>
      </points>
      {/* <mesh position={[0, 0, -1]} ref={eventPlane}>
        <planeGeometry args={[countX, countY, 2, 2]} />
        <meshBasicMaterial color={"white"} />
      </mesh> */}
    </>
  );
}

export default ParticleImage;

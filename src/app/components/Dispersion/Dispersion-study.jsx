import { useEffect, useMemo, useRef } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useFBO, useTexture, Decal } from "@react-three/drei";
import * as THREE from "three";

const Dispersion = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const tex = useTexture("/bg.jpg");
  const background = useRef();
  const mesh = useRef();
  const mainRenderTarget = useFBO();
  const backsideRenderTarget = useFBO();
  const shaderArgs = useMemo(
    () => ({
      uniforms: {
        uTex: { value: null },
        uRes: {
          value: new THREE.Vector2(width, height).multiplyScalar(
            Math.min(window.devicePixelRatio, 2)
          ),
        },
        uIorR: { value: 1.15 },
        uIorG: { value: 1.18 },
        uIorB: { value: 1.22 },
        uRefractPow: { value: 0.4 },
        uChromaticAbrr: { value: 0.5 },
        uSat: { value: 1.08 },
        uDiff: { value: 0.2 },
        uSpec: { value: 40 },
        uLight: { value: new THREE.Vector3(-1.0, 1.0, 1.0) },
        uFres: { value: 8 },
      },
      vertexShader: /* glsl */ `
      varying vec3 worldNormal;
      varying vec3 eyeVector;

      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vec4 mvPosition = viewMatrix * worldPos;
    
        gl_Position = projectionMatrix * mvPosition;
        eyeVector = normalize(worldNormal.xyz - cameraPosition);
        vec3 transformedNormal = normalMatrix * normal;
        worldNormal = normalize(transformedNormal);
      }
      `,
      fragmentShader: /* glsl */ `
      uniform vec2 uRes;
      uniform sampler2D uTex;
      varying vec3 worldNormal;
      varying vec3 eyeVector;
      uniform float uIorR;
      uniform float uIorG;
      uniform float uIorB;
      uniform float uRefractPow;
      uniform float uChromaticAbrr;
      uniform float uSat;
      uniform float uDiff;
      uniform float uSpec;
      uniform vec3 uLight;
      uniform float uFres;

      const int SAMPLE_LOOP = 16;

      float fresnel(vec3 eyeVector, vec3 worldNormal, float power) {
        float fresnelFactor = abs(dot(eyeVector, worldNormal));
        return pow(1.0-fresnelFactor, power);
      }

      float specular(vec3 light, float shininess, float diffuness){
        vec3 normal = worldNormal;
        vec3 lightVector = normalize(-light);
        vec3 haflVector = normalize(lightVector + eyeVector);
        float diff = dot(normal,lightVector);
        diff = max(0.0,diff);

        float normalDotHalfVec = dot(normal,haflVector);
        normalDotHalfVec *= normalDotHalfVec; 
        float spec = pow(normalDotHalfVec, shininess);
        return spec + diff*diffuness;
      }

      vec3 sat(vec3 rgb, float intensity){
        vec3 luminance = vec3(0.2125, 0.7154, 0.0721);
        vec3 grayscale = vec3(dot(rgb,luminance));
        return mix(grayscale,rgb,intensity);
      }

      void main() {
        float iorRatio = 1.0/1.33;
        float iorRatioR = 1.0/uIorR;
        float iorRatioG = 1.0/uIorG;
        float iorRatioB = 1.0/uIorB;
        vec2 uv = gl_FragCoord.xy / uRes.xy;
        vec3 normal = worldNormal;
        vec3 color = vec3(.0);
       for(int i = 0; i<SAMPLE_LOOP;i++)
        { 
          float slide = float(i)/float(SAMPLE_LOOP)*0.1;
          vec3 refractVecR = refract(eyeVector, normal, iorRatioR);
          vec3 refractVecG = refract(eyeVector, normal, iorRatioG);
          vec3 refractVecB = refract(eyeVector, normal, iorRatioB);

          color.r += texture2D(uTex,uv + refractVecR.xy * (uRefractPow+slide*1.0)*uChromaticAbrr).r;
          color.g += texture2D(uTex,uv + refractVecG.xy * (uRefractPow+slide*2.0)*uChromaticAbrr).g;
          color.b += texture2D(uTex,uv + refractVecB.xy * (uRefractPow+slide*3.0)*uChromaticAbrr).b;
          
          color = sat(color,uSat);
        }
          // color = vec3(1.)-color *0.4;
        color /= float(SAMPLE_LOOP);
        float lighting = specular(uLight,uSpec,uDiff);
        color += lighting;
        // float f = fresnel(eyeVector, normal, uFres);
        // color.rgb += f * vec3(1.0);
        gl_FragColor = vec4(color,1.0);}
      `,
    }),
    [height, width]
  );

  useFrame((state) => {
    const { gl, scene, camera, pointer, clock, raycaster } = state;

    mesh.current.visible = false;

    gl.setRenderTarget(mainRenderTarget);

    gl.render(scene, camera);

    mesh.current.material.uniforms.uTex.value = mainRenderTarget.texture;

    mesh.current.visible = true;
    gl.setRenderTarget(null);

    raycaster.setFromCamera(pointer, camera);
    let pointerWorld = new THREE.Vector3(pointer.x, pointer.y, 0.5);
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // Normal is along z-axis, d = 0 for z = 0 plane
    const intersectPoint = new THREE.Vector3();

    // Get the intersection point of the ray with the z = 0 plane
    raycaster.ray.intersectPlane(planeZ, intersectPoint);
    pointerWorld.unproject(camera);
    mesh.current.position.x = intersectPoint.x;
    mesh.current.position.y = intersectPoint.y;
    // ref.current.material.uniforms.uTime.value = clock.elapsedTime;
    return null;
  });
  return (
    <>
      {/* <mesh ref={background} position={[0, 0, -50]}>
        <planeGeometry args={[width, height, 2, 2]} />
        <meshBasicMaterial side={THREE.DoubleSide} map={tex} />
      </mesh> */}
      <mesh ref={mesh} scale={[1, 1, 0.25]} position={[0, 0, 200]}>
        <icosahedronGeometry args={[200, 20]} />
        <shaderMaterial args={[shaderArgs]} />
      </mesh>
    </>
  );
};

export default Dispersion;

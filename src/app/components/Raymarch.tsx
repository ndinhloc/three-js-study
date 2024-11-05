import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture, Line } from "@react-three/drei";
import { useControls } from "leva";

import * as THREE from "three";
const DPR = 0.75;
const Raymarch = () => {
  const { viewport } = useThree();
  const mesh = useRef<any>();
  const shaderArgs = useMemo(
    () => ({
      uniforms: {
        uTime: new THREE.Uniform(0.0),
        uResolution: new THREE.Uniform(new THREE.Vector2()),
        uMouse: new THREE.Uniform(new THREE.Vector2()),
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
        uniform vec2 uMouse;
        uniform float uTime;
        uniform vec2 uResolution;
        #define MAX_STEPS 100
        #define MAX_DIST 100.
        #define SURF_DIST .001
        #define TAU 6.283185
        #define PI 3.141592
        #define S smoothstep
        
        mat2 Rot(float a) {
            float s=sin(a), c=cos(a);
            return mat2(c, -s, s, c);
        }

        float smin( float a, float b, float k )
        {
            k *= 4.0;
            float x = (b-a)/k;
            float g = (x> 1.0) ? x :
                    (x<-1.0) ? 0.0 :
                    (x*(2.0+x)+1.0)/4.0;
            return b - k * g;
        }
        float sdRoundBox( vec3 p, vec3 b, float r )
        {
          vec3 q = abs(p) - b + r;
          return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
        }
        
        float sdSphere(vec3 p, float r){
          float d = length(p) - r;
          return d;
        }
        float sdRoundedCylinder( vec3 p, float ra, float rb, float h )
        {
          vec2 d = vec2( length(p.xz)-2.0*ra+rb, abs(p.y) - h );
          return min(max(d.x,d.y),0.0) + length(max(d,0.0)) - rb;
        }
        float GetDist(vec3 p) {
          float ground = p.y + 1.;
          float box = sdRoundBox(p, vec3(1.), 0.1);
          float sphere = sdSphere(p -vec3(sin(uTime),uMouse.x*4.,cos(uTime - PI)),0.4);
          float rc = sdRoundedCylinder(p, 2.,.05,.1);
          float d = smin(rc,ground,0.4);
          // float d1 = smin(d,sphere,0.4);
          
          return rc;
        }
        float RayMarch(vec3 ro, vec3 rd) {
          float dO=0.;
    
          for(int i=0; i<MAX_STEPS; i++) {
            vec3 p = ro + rd*dO;
              float dS = GetDist(p);
              dO += dS;
              if(dO>MAX_DIST || abs(dS)<SURF_DIST) break;
          }
          
          return dO;
        }   
        vec3 GetRayDir(vec2 uv, vec3 p, vec3 l, float z) {
          vec3 
              f = normalize(l-p),
              r = normalize(cross(vec3(0,1,0), f)),
              u = cross(f,r),
              c = f*z,
              i = c + uv.x*r + uv.y*u;
          return normalize(i);
        }
        vec3 GetNormal(vec3 p) {
          vec2 e = vec2(.001, 0);
          vec3 n = GetDist(p) - 
          vec3(GetDist(p-e.xyy), GetDist(p-e.yxy),GetDist(p-e.yyx));
    
          return normalize(n);
        }
      
        void main() {
            vec2 uv = gl_FragCoord.xy/uResolution.xy;
            vec2 m = uMouse.xy;

            uv -= 0.5;
            vec3 surfaceColor = vec3(1.,1.,1.);
            uv.x *= uResolution.x / uResolution.y;
            vec3 lightPos = vec3(5.0,5.0,5.);
            
            vec3 ro = vec3(0., 10., 10.);
            ro.yz *= Rot(m.y*PI+1.);
            ro.xz *= Rot(-m.x*TAU);
            
            vec3 rd = GetRayDir(uv, ro, vec3(0,0.,0), 1.);
            vec3 col = vec3(0);
          
            float d = RayMarch(ro, rd);

            if(d<MAX_DIST) {
                vec3 p = ro + rd * d;
                vec3 n = GetNormal(p);
                vec3 r = reflect(rd, n);
                float cd = length(p);
                float dif = dot(n, normalize(lightPos))*.5+.5;
                vec3 viewRay = normalize(ro-p);
                col += dif;
                col /= cd;
                
            }
            
            col = pow(col, vec3(.4545));	
            gl_FragColor = vec4(col, 1.0);
        }
`,
    }),
    []
  );
  useFrame((state) => {
    const { clock, pointer } = state;
    mesh.current.material.uniforms.uTime.value = clock.getElapsedTime();
    mesh.current.material.uniforms.uResolution.value = new THREE.Vector2(
      window.innerWidth * DPR,
      window.innerHeight * DPR
    );
    mesh.current.material.uniforms.uMouse.value = new THREE.Vector2(
      pointer.x,
      pointer.y
    );
  });

  return (
    <>
      <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial args={[shaderArgs]} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
};

export default Raymarch;

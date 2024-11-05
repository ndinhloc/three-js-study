import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture, Line } from "@react-three/drei";
import { useControls } from "leva";

import * as THREE from "three";
const DPR = 0.75;
const RaymarchWithAA = () => {
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
        #define MAX_STEPS 50
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

        vec2 opU( vec2 d1, vec2 d2 )
        {
          return (d1.x < d2.x) ? d1 : d2;
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
        vec2 map(vec3 p) {
          vec2 res = vec2(1e10, 0.);
         
          vec2 rc1 = vec2(sdRoundedCylinder(p + vec3(5.,.0,-5.0), 2.,.05,.1),.5);
          vec2 rc2 = vec2(sdRoundedCylinder(p + vec3(5.,-.5,-5.),1.5,0.05,.1),1.5);
          vec2 rc3 = vec2(sdRoundedCylinder(p + vec3(5.,-1.,-5.),1.,0.05,.1),2.5);
          // float d = smin(rc1,rc2,0.2);
          // float d1 = smin(d,sphere,0.4);
          res = opU(rc1,rc2);
          res = opU(res,rc3);
          
          return res;
        }
        vec2 RayMarch(vec3 ro, vec3 rd) {
          float dO=0.;
          float id = 0.;
          vec2 res = vec2(0.);
    
          for(int i=0; i<MAX_STEPS; i++) {
            vec3 p = ro + rd*dO;
              res = map(p);
              dO += res.x;
              id = res.y;
              if(dO>MAX_DIST || abs(res.x)<SURF_DIST) break;
          }
          
          return vec2(dO,id);
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
            vec2 e = vec2(1.0, -1.0) * 0.0005; // epsilon
    return normalize(
      e.xyy * map(p + e.xyy).x +
      e.yyx * map(p + e.yyx).x +
      e.yxy * map(p + e.yxy).x +
      e.xxx * map(p + e.xxx).x);
        }
      
        void main() {
            vec2 m = uMouse.xy;

            vec3 lightPos = vec3(5.0,5.0,5.);
            vec3 tot = vec3(0.);
            
            vec3 ro = vec3(0.1, 10., .1);
            // ro.yz *= Rot(m.y*PI+1.);
            // ro.xz *= Rot(-m.x*TAU);
            for( int m=0; m<2; m++ ){
                for( int n=0; n<2; n++ ) {   
                    vec2 o = vec2(float(m),float(n)) / float(2) - 0.5;
                    vec2 p = (-uResolution.xy + 2.0*(gl_FragCoord.xy+o))/uResolution.y;
                    
                    vec3 rd = GetRayDir(p, ro, vec3(0.,0.,0.), 2.);
                    
                
                    vec2 res = RayMarch(ro, rd);
                    float d = res.x;
                    float id = res.y;

                    vec3 col = vec3(0.);
                    if(d<MAX_DIST) {
                        vec3 p = ro + rd * d;
                        vec3 n = GetNormal(p);
                        vec3 r = reflect(rd, n);
                        float cd = length(p);
                        float dif = clamp( dot(n,lightPos - p), 0.0, 1.0 );
                        if (id > 0.) col = dif *  vec3(0.282, 0.274, 0.592);
                        if (id > 1.) col = dif * vec3(1.,0.854,0.2);
                        if (id > 2.) col = dif * vec3(0.9, .188, .372);
                        float amb = 0.5 + 0.5*dot(n,vec3(0.0,1.0,0.0));
                        col *= amb;
                        // col = sqrt(col);
                        tot += col;
                    }
                }
            }
            tot /= 4.;
            
            gl_FragColor = vec4(tot, 1.0);
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

export default RaymarchWithAA;

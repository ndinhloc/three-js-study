import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useScroll, useTransform } from "framer-motion";

import { useFBO, useTexture } from "@react-three/drei";
import * as THREE from "three";

const NoiseGradient = () => {
  const { gl } = useThree();
  useLayoutEffect(() => {
    gl.setPixelRatio(1);
  }, []);
  const width = window.innerWidth;
  const height = window.innerHeight;
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const onMouseMove = (e) => {
    mouseX.current = e.clientX - width / 2;
    mouseY.current = -e.clientY + height / 2;
  };
  useEffect(() => {
    document.body.addEventListener("mousemove", onMouseMove);
  }, []);
  const $mesh = useRef();
  const mainRef = useRef(document.querySelector("main"));
  const { scrollYProgress } = useScroll({ container: mainRef });
  const progress = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const indexRange = useTransform(progress, [2, 6], [0, 2.9]);

  const shaderArgs = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(width, height) },
        uMouse: { value: new THREE.Vector2(0, 0) },
        color1: { value: new THREE.Vector3(0.89, 0.34, 0.11) },
        color2: { value: new THREE.Vector3(0.56, 0.64, 0.64) },
        color3: { value: new THREE.Vector3(0.16, 0.26, 0.47) },
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
      uniform vec2 uMouse;
      uniform vec3 color1;
      uniform vec3 color2;
      uniform vec3 color3;
      const float PI = 3.1415;
      const float twopi = 6.28318531; 
            //	Simplex 3D Noise 
      //	by Ian McEwan, Ashima Arts
      //
      vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

      float snoise(vec3 v){ 
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

      // First corner
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 =   v - i + dot(i, C.xxx) ;

      // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );

        //  x0 = x0 - 0. + 0.0 * C 
        vec3 x1 = x0 - i1 + 1.0 * C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1. + 3.0 * C.xxx;

      // Permutations
        i = mod(i, 289.0 ); 
        vec4 p = permute( permute( permute( 
                  i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

      // Gradients
      // ( N*N points uniformly over a square, mapped onto an octahedron.)
        float n_ = 1.0/7.0; // N=7
        vec3  ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );

        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);

      //Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

      // Mix final noise value  
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                      dot(p2,x2), dot(p3,x3) ) );
      }
      float N(vec2 u, float o){
        float t = (uTime + o) * 2.;
        float n = snoise(vec3((u.x -uMouse.x) * .9 + t, (u.y-uMouse.y) * .9 - t, t));
        return snoise(vec3(n * .2, n * .7, t * .1));
      }
      float C(vec2 u, float n, float s, float z) {
        return smoothstep(smoothstep(.1, s, length(u-uMouse)), 0., length(u * vec2(z * 0.8, z) + n * .1) - .38);
      }
      const vec3 black = vec3(0.0);
      
      void main() {
        vec2 uv = (gl_FragCoord.xy -0.5 * uRes.xy)/uRes.y;
        
        float n = .08 * snoise(vec3(uv * 300., uTime * .2));
        
        float noise = snoise(vec3((uv.x + uMouse.y*.2)*0.5+111.,(uv.y + uMouse.x * .5)*0.6 + 88.,length(uMouse*0.1)));
        float pattern =1.- smoothstep(0.,.5,length(noise));
       
        vec3 col = vec3(0.);
        float n1 = smoothstep(0.1, .7, pattern);
        vec3 color = mix(black, color1, n1);
        
        float n2 = smoothstep(0.02, 0.3, pattern);
        col = mix(col, color1, n2);
      
        float n3 = smoothstep(0.2, 0.8, pattern);
        col= mix(col, color2, n3);
      
        float n4 = smoothstep(0.6 , .9, pattern);
        col = mix(col, color3, n4);

        col = mix(vec3(n*.1+.9),n + col,0.9);
        
        gl_FragColor = vec4(col,1.);
      }
      `,
    }),
    []
  );
  let mouseVec = new THREE.Vector2(0, 0);

  useFrame((state, delta) => {
    $mesh.current.material.uniforms.uTime.value += delta * 0.05;
    mouseVec.x = mouseX.current / width;
    mouseVec.y = mouseY.current / height;
    $mesh.current.material.uniforms.uMouse.value = mouseVec;
    if (progress.get() < 1.6) {
      //color1
      $mesh.current.material.uniforms.color1.value.x = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color1.value.x,
        0.89,
        0.2
      );
      $mesh.current.material.uniforms.color1.value.y = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color1.value.y,
        0.34,
        0.2
      );
      $mesh.current.material.uniforms.color1.value.z = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color1.value.z,
        0.11,
        0.2
      );
      //color2
      $mesh.current.material.uniforms.color2.value.x = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color2.value.x,
        0.56,
        0.2
      );
      $mesh.current.material.uniforms.color2.value.y = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color2.value.y,
        0.64,
        0.2
      );
      $mesh.current.material.uniforms.color2.value.z = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color2.value.z,
        0.64,
        0.2
      );
      //color3
      $mesh.current.material.uniforms.color3.value.x = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color3.value.x,
        0.16,
        0.2
      );
      $mesh.current.material.uniforms.color3.value.y = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color3.value.y,
        0.26,
        0.2
      );
      $mesh.current.material.uniforms.color3.value.z = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color3.value.z,
        0.47,
        0.2
      );
    }
    if (
      Math.floor(indexRange.get()) == 0 &&
      progress.get() > 1.6 &&
      progress.get() < 3.6
    ) {
      //color1
      $mesh.current.material.uniforms.color1.value.x = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color1.value.x,
        0.0,
        0.1
      );
      $mesh.current.material.uniforms.color1.value.y = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color1.value.y,
        1,
        0.1
      );
      $mesh.current.material.uniforms.color1.value.z = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color1.value.z,
        26 / 255,
        0.1
      );
      //color2
      $mesh.current.material.uniforms.color2.value.x = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color2.value.x,
        0.0,
        0.1
      );
      $mesh.current.material.uniforms.color2.value.y = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color2.value.y,
        1,
        0.1
      );
      $mesh.current.material.uniforms.color2.value.z = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color2.value.z,
        26 / 255,
        0.1
      );
      //color3 rgb(49,55,253)
      $mesh.current.material.uniforms.color3.value.x = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color3.value.x,
        49 / 255,
        0.1
      );
      $mesh.current.material.uniforms.color3.value.y = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color3.value.y,
        55 / 255,
        0.1
      );
      $mesh.current.material.uniforms.color3.value.z = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color3.value.z,
        253 / 255,
        0.1
      );
    }
    if (Math.floor(indexRange.get()) == 1 && progress.get() > 3.6) {
      //color1 rgb(70,95,21)
      $mesh.current.material.uniforms.color1.value.x = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color1.value.x,
        70 / 255,
        0.2
      );
      $mesh.current.material.uniforms.color1.value.y = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color1.value.y,
        95 / 255,
        0.2
      );
      $mesh.current.material.uniforms.color1.value.z = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color1.value.z,
        21 / 255,
        0.2
      );
      //color2 rgb(151,149,71)
      $mesh.current.material.uniforms.color2.value.x = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color2.value.x,
        151 / 255,
        0.1
      );
      $mesh.current.material.uniforms.color2.value.y = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color2.value.y,
        149 / 255,
        0.1
      );
      $mesh.current.material.uniforms.color2.value.z = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color2.value.z,
        71 / 255,
        0.1
      );
      //color3 rgb(172,171,128) rgb(73,174,240)
      $mesh.current.material.uniforms.color3.value.x = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color3.value.x,
        172 / 255,
        0.1
      );
      $mesh.current.material.uniforms.color3.value.y = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color3.value.y,
        171 / 255,
        0.1
      );
      $mesh.current.material.uniforms.color3.value.z = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color3.value.z,
        128 / 255,
        0.1
      );
    }
    if (Math.floor(indexRange.get()) == 2 && progress.get() > 5.6) {
      //color1 rgb(73,174,240)
      $mesh.current.material.uniforms.color1.value.x = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color1.value.x,
        73 / 255,
        0.2
      );
      $mesh.current.material.uniforms.color1.value.y = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color1.value.y,
        174 / 255,
        0.2
      );
      $mesh.current.material.uniforms.color1.value.z = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color1.value.z,
        240 / 255,
        0.2
      );
      //color2 rgb(218,149,227)
      $mesh.current.material.uniforms.color2.value.x = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color2.value.x,
        218 / 255,
        0.1
      );
      $mesh.current.material.uniforms.color2.value.y = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color2.value.y,
        149 / 255,
        0.1
      );
      $mesh.current.material.uniforms.color2.value.z = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color2.value.z,
        227 / 255,
        0.1
      );
      //color3 rgb(130,86,255)
      $mesh.current.material.uniforms.color3.value.x = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color3.value.x,
        130 / 255,
        0.1
      );
      $mesh.current.material.uniforms.color3.value.y = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color3.value.y,
        86 / 255,
        0.1
      );
      $mesh.current.material.uniforms.color3.value.z = THREE.MathUtils.lerp(
        $mesh.current.material.uniforms.color3.value.z,
        255 / 255,
        0.1
      );
    }
    console.log(indexRange.get());
  });
  return (
    <>
      <mesh ref={$mesh} position={[0, 0, -100]}>
        <planeGeometry args={[width, height]} />
        <shaderMaterial args={[shaderArgs]} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
};

export default NoiseGradient;

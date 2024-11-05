import { useEffect, useMemo, useRef } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useFBO, useTexture } from "@react-three/drei";
import * as THREE from "three";
import fullScreenTriangle from "./fullScreenTriangle";

const Wave = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const $mesh = useRef();
  const $finalMesh = useRef();
  const tex = useTexture("/SuccessKid.jpg");
  const bufferA = useFBO();
  const sceneA = new THREE.Scene();
  const shaderArgs = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(width, height) },
        uTex: { value: tex },
        uTexRes: {
          value: new THREE.Vector2(
            tex.source.data.width,
            tex.source.data.height
          ),
        },
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
      uniform sampler2D uTex;    
      uniform vec2 uTexRes;
      varying vec2 vUv;

      float posTri(float x)
      {
          return abs(fract(x - .5) - .5) * 2.;
      }
      void main() {
        vec2 uv = gl_FragCoord.xy/uRes.xy;

        float wave = fract(uv.y *50.+uTime);

        vec2 pos = gl_FragCoord.xy -0.5 * uRes.xy;

        float l=length(pos);

        float slope = 15.;

        float ang=atan(pos.y,pos.x)+5.0*uTime;

        float r= posTri(wave);

        vec3 spi = vec3(r);

        vec3 col = texture(uTex,gl_FragCoord.xy/uRes.xy,0.5 * log2(slope / (uRes.x / uTexRes.x))).rgb;
        
        float d = clamp(dot(col.xyz, vec3(-0.5, 1.0, -0.5)), 0.0, 1.0);
        
        col = mix(col, vec3(1.5), 1.8 * d);
        
        col = clamp(vec3(dot(col, vec3(1.0 / 3.0))), 0.0, 1.0);
        
        float b = 0.7 * (1.0 - col.x) + 0.35;
        
        float c = clamp(spi.x - 1.0 + b, 0.0, 1.0);
        
        c = b - (b - c) * (b - c) / b / b;
        
        vec4 color = vec4(1.-c,1.-c,1.-c,1.0);

        gl_FragColor = vec4(1.-c,1.-c,1.-c, 1.0);
      }
      `,
    }),
    []
  );

  const finalShaderArgs = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(width, height) },
        uTex: { value: null },
        uTexRes: {
          value: new THREE.Vector2(
            tex.source.data.width,
            tex.source.data.height
          ),
        },
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
    
    uniform sampler2D uTex;    
  
    varying vec2 vUv;

    vec3 getCol(vec2 fc) {
        return texture(uTex,fc/uRes.xy).xyz;
    }

    float getVal(vec2 fc) {
        return dot(getCol(fc),vec3(1./3.));
    }
                  
    vec2 getGrad(vec2 fc, float eps) {
        vec2 e=vec2(eps,0);
        return vec2(getVal(fc+e.xy)-getVal(fc-e.xy),
                getVal(fc+e.yx)-getVal(fc-e.yx))/eps;
    }
    void main() {
      vec2 uv = gl_FragCoord.xy / uRes.xy;

      vec3 col=texture(uTex,uv).xyz;

      vec3 light = normalize(vec3(.5,.5,2));

      vec2 e=vec2(1.4,0);

     vec3 n=normalize(vec3(getGrad(gl_FragCoord.xy,1.4),1.));

      float spec = dot(reflect(vec3(0,0,-1),n),light);

      float diff = clamp(dot(light,n),0.,1.);

      float h = smoothstep(.5,1.,col.x);

      float shin = mix(1.,200.,1.-h);

      spec = pow(clamp(spec,0.,1.),shin)*shin/100.;

      col = mix(vec3(0.47,.02,.02),vec3(1,.97,.9)*.7+0.3,h);
      
      float vignette=cos(1.7*length((gl_FragCoord.xy-.5*uRes.xy)/uRes.x));

      gl_FragColor.xyz = (col*diff + 0.8*spec)*vignette;

      gl_FragColor.a = 1.0;
    }
    `,
    }),
    []
  );

  useFrame((state, delta) => {
    const { gl, scene, camera } = state;
    gl.setRenderTarget(bufferA);
    gl.render(sceneA, camera);
    $mesh.current.material.uniforms.uTime.value += delta * 1.3;

    $finalMesh.current.material.uniforms.uTex.value = bufferA.texture;

    gl.setRenderTarget(null);
  });
  return (
    <>
      {createPortal(
        <mesh ref={$mesh}>
          <planeGeometry args={[width, height]} />
          <shaderMaterial args={[shaderArgs]} side={THREE.DoubleSide} />
        </mesh>,
        sceneA
      )}
      <mesh ref={$finalMesh}>
        <planeGeometry args={[width, height]} />
        <shaderMaterial args={[finalShaderArgs]} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
};

export default Wave;

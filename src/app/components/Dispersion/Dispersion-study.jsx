import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useFBO, useTexture, Text } from "@react-three/drei";
import * as THREE from "three";
import { useScroll, useTransform } from "framer-motion";

class ImgCircleMaterial extends THREE.ShaderMaterial {
  constructor(numTextures) {
    super({
      uniforms: {
        uProgress: { value: 0 },
        uTex: { value: null },
        uRes: { value: { x: 1, y: 1 } },
        uImageRes: {
          value: {
            x: 0,
            y: 0,
          },
        },
        uViewProgress: { value: 0 },
        uIndex: { value: null },
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
      #define NUM_TEXTURES ${numTextures}
      uniform sampler2D uTex[NUM_TEXTURES];
      uniform vec2 uRes;
      uniform vec2 uImageRes[NUM_TEXTURES];
      uniform int uIndex;
      uniform float uProgress;
      uniform float uViewProgress;
      varying vec2 vUv;
      
      vec2 CoverUV(vec2 u, vec2 s, vec2 i) {
        float rs = s.x / s.y; // Aspect screen size
        float ri = i.x / i.y; // Aspect image size
        vec2 st = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x); // New st
        vec2 o = (rs < ri ? vec2((st.x - s.x) / 2.0, 0.0) : vec2(0.0, (st.y - s.y) / 2.0)) / st; // Offset
        return u * s / st + o;
      }

        void main() {

          vec2 uv = CoverUV(vUv, uRes, uImageRes[uIndex]);
          if(uProgress >= 0. && uProgress < 4.) {
            float progress = floor(uProgress)>=3.?fract(uProgress):0.;
            vec4 tex1 = texture2D(uTex[0], uv);
            vec4 tex2 = texture2D(uTex[1], uv);

            float displace1 = (tex1.r + tex1.g + tex1.b)*0.33;
            float displace2 = (tex2.r + tex2.g + tex2.b)*0.33;
            
            vec4 t1 = texture2D(uTex[0], vec2(uv.x, uv.y + progress * (displace2 * 0.3)));
            vec4 t2 = texture2D(uTex[1], vec2(uv.x, uv.y + (1.0 - progress) * (displace1 * 0.3)));

            vec3 finalTex = mix(t1, t2, progress).rgb;
            gl_FragColor = vec4(finalTex,uViewProgress);
            
            // gl_FragColor = mix(tex1,tex2,floor(uProgress)>=3.?fract(uProgress):0.);
          }
          if(uProgress >= 4.) {
            float progress = floor(uProgress)>=5.?fract(uProgress):0.;
            vec4 tex1 = texture2D(uTex[1], uv);
            vec4 tex2 = texture2D(uTex[2], uv);

            float displace1 = (tex1.r + tex1.g + tex1.b)*0.33;
            float displace2 = (tex2.r + tex2.g + tex2.b)*0.33;
            
            vec4 t1 = texture2D(uTex[1], vec2(uv.x, uv.y + progress * (displace2 * 0.3)));
            vec4 t2 = texture2D(uTex[2], vec2(uv.x, uv.y + (1.0 - progress) * (displace1 * 0.3)));

            gl_FragColor = mix(t1, t2, progress);
          }
          if(uProgress >= 6.) {
            vec4 tex1 = texture2D(uTex[2], uv);

            gl_FragColor = tex1;
          }
        }
      `,
    });
  }
}

const ImgCircle = forwardRef((props, ref) => {
  const { viewport } = useThree();
  const radius = viewport.width / 6;

  const mainRef = useRef(document.querySelector("main"));
  const { scrollYProgress } = useScroll({ container: mainRef });

  const progress = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const viewProgress = useTransform(progress, [1, 2, 7, 8], [0, 1, 1, 0]);
  const indexRange = useTransform(progress, [2, 6], [0, 2.9]);

  const texturesRes = props.textures.map(
    (e) => new THREE.Vector2(e.source.data.width, e.source.data.height)
  );

  const testMaterial = useMemo(
    () => new ImgCircleMaterial(props.textures.length),
    [props.textures.length]
  );
  testMaterial.uniforms.uTex.value = props.textures;
  testMaterial.uniforms.uImageRes.value = texturesRes;

  useFrame((state) => {
    testMaterial.uniforms.uIndex.value = Math.floor(indexRange.get());
    testMaterial.uniforms.uProgress.value = progress.get();
    testMaterial.uniforms.uViewProgress.value = viewProgress.get();
    // console.log(testMaterial.uniforms.uViewProgress.value);

    return null;
  });
  return (
    <>
      <mesh ref={ref} position={[-viewport.width, 0, 10]} {...props}>
        <circleGeometry args={[radius, 32]} />

        <primitive object={testMaterial} attach="material" />
      </mesh>
    </>
  );
});

const Dispersion = ({ imgList, ...props }) => {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  useEffect(() => {
    setHeight(window.innerHeight);
    setWidth(window.innerWidth);
  }, [window.innerWidth, window.innerHeight]);
  const mesh = useRef();
  const mainRenderTarget = useFBO();
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const onMouseMove = (e) => {
    mouseX.current = e.clientX - width / 2;
    mouseY.current = -e.clientY + height / 2;
  };

  const textures = useTexture(imgList);
  const text1 = useRef();
  const text2 = useRef();
  const textSection = useRef();
  const gallerySection = useRef();
  useEffect(() => {
    document.body.addEventListener("mousemove", onMouseMove);
  }, []);
  //scroll progress
  const mainRef = useRef(document.querySelector("main"));
  const { scrollYProgress, scrollY } = useScroll({ container: mainRef });

  const progress = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const viewProgress = useTransform(progress, [1, 2, 7, 8], [0, 1, 1, 0]);
  const indexRange = useTransform(progress, [2, 6], [0, 2.9]);
  const textOpacity = useTransform(progress, [0, 1.2], [1, 0]);
  const textOffset = useTransform(progress, [0, 2], [0, 250]);

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
        uDiff: { value: 0.1 },
        uSpec: { value: 40 },
        uLight: { value: new THREE.Vector3(-1.0, -1.0, 1.0) },
        uFres: { value: 8 },
        uGalleryView: { value: false },
        uViewProgress: { value: 0 },
        uTime: { value: 0 },
        uWidth: { value: width },
      },
      vertexShader: /* glsl */ `
      varying vec3 worldNormal;
      varying vec3 eyeVector;
      uniform float uTime;
      uniform bool uGalleryView;
      uniform float uViewProgress;
      uniform float uWidth;
      vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      
      vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      
      vec4 permute(vec4 x) {
           return mod289(((x*34.0)+1.0)*x);
      }
      
      vec4 taylorInvSqrt(vec4 r)
      {
        return 1.79284291400159 - 0.85373472095314 * r;
      }
      
      float snoise(vec3 v)
        {
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
      
        //   x0 = x0 - 0.0 + 0.0 * C.xxx;
        //   x1 = x0 - i1  + 1.0 * C.xxx;
        //   x2 = x0 - i2  + 2.0 * C.xxx;
        //   x3 = x0 - 1.0 + 3.0 * C.xxx;
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
        vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
      
      // Permutations
        i = mod289(i);
        vec4 p = permute( permute( permute(
                   i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      
      // Gradients: 7x7 points over a square, mapped onto an octahedron.
      // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
        float n_ = 0.142857142857; // 1.0/7.0
        vec3  ns = n_ * D.wyz - D.xzx;
      
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
      
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
      
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
      
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
      
        //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
        //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
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

      void main() {
        vec3 pos = position;
        float size = mix(1.,uWidth/12.+10.,uViewProgress);
        pos += normal*size;
        if(uGalleryView == true) {
          float proximity = clamp(dot(normalize(normal),vec3(0,0,1)),0.,1.);
          float noise = snoise(pos *0.004+uTime);
          pos += normal * noise * 100. * proximity ;
        }
        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
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

      const int SAMPLE_LOOP = 8;

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
    const { gl, scene, camera, clock } = state;
    mesh.current.material.uniforms.uWidth.value = width;
    mesh.current.material.uniforms.uTime.value = clock.getElapsedTime();

    mesh.current.visible = false;

    text1.current.visible = false;
    text2.current.visible = true;
    gallerySection.current.visible = true;
    gl.setRenderTarget(mainRenderTarget);
    gl.render(scene, camera);

    mesh.current.material.uniforms.uTex.value = mainRenderTarget.texture;
    text1.current.visible = true;
    text2.current.visible = false;
    mesh.current.visible = true;
    gallerySection.current.visible = false;

    textSection.current.position.y = scrollY.get();
    gallerySection.current.position.y = scrollY.get() - height;
    gallerySection.current.scale.x = viewProgress.get();
    gallerySection.current.scale.y = viewProgress.get();
    if (textSection.current.position.y > height) {
      textSection.current.visible = false;
    } else {
      textSection.current.visible = true;
    }
    mesh.current.material.uniforms.uViewProgress.value = viewProgress.get();
    if (progress.get() < 2 || progress.get() >= 7) {
      gallerySection.current.visible = false;
      mesh.current.material.uniforms.uGalleryView.value = false;
      mesh.current.position.x = THREE.MathUtils.lerp(
        mesh.current.position.x,
        mouseX.current,
        0.1
      );
      mesh.current.position.y = THREE.MathUtils.lerp(
        mesh.current.position.y,
        mouseY.current,
        0.1
      );
    }

    if (progress.get() >= 1.7 && progress.get() < 7) {
      mesh.current.position.y = THREE.MathUtils.lerp(
        mesh.current.position.y,
        Math.sin(clock.elapsedTime) * 30,
        0.1
      );
      mesh.current.position.x = THREE.MathUtils.lerp(
        mesh.current.position.x,
        Math.floor(indexRange.get()) % 2 == 0
          ? -width / 4 + Math.cos(clock.elapsedTime) * 30
          : width / 4 + Math.cos(clock.elapsedTime) * 30,
        0.1
      );
      gallerySection.current.position.x = mesh.current.position.x;
      gallerySection.current.position.y = mesh.current.position.y;
      if (progress.get() == 2.5) gallerySection.current.visible = true;
      mesh.current.material.uniforms.uGalleryView.value = true;
    }
    if (scrollYProgress.get() == 1) {
      mesh.current.visible = false;
    }
    text1.current.children[0].fillOpacity = textOpacity.get();
    text1.current.children[1].fillOpacity = textOpacity.get();
    text1.current.children[2].fillOpacity = textOpacity.get();
    text2.current.children[0].fillOpacity = textOpacity.get();
    text2.current.children[1].fillOpacity = textOpacity.get();
    text2.current.children[2].fillOpacity = textOpacity.get();
    text1.current.children[0].position.x = -textOffset.get();
    text1.current.children[1].position.x = 120 + textOffset.get();
    text1.current.children[2].position.x = -70 - textOffset.get();
    text2.current.children[0].position.x = -180 - textOffset.get();
    text2.current.children[1].position.x = 180 + textOffset.get();
    text2.current.children[2].position.x = -70 - textOffset.get();

    gl.setRenderTarget(null);
    return null;
  });
  return (
    <>
      <ImgCircle ref={gallerySection} textures={textures} />
      <mesh ref={mesh} scale={[1, 1, 0.25]} position={[0, 0, 50]}>
        <icosahedronGeometry args={[width / 12, 20]} />
        <shaderMaterial args={[shaderArgs]} />
      </mesh>

      <group ref={textSection}>
        <group ref={text1}>
          <Text
            position={new THREE.Vector3(0, 125, 0)}
            fontSize={width / 18}
            font="/fonts/NotoSerif-Regular.ttf"
          >
            {`The quick brown fox`}
          </Text>
          <Text
            position={new THREE.Vector3(0, 0, 0)}
            fontSize={width / 18}
            font="/fonts/NotoSerif-Regular.ttf"
          >
            {`jumps over`}
          </Text>
          <Text
            position={new THREE.Vector3(-70, -125, 0)}
            fontSize={width / 18}
            font="/fonts/NotoSerif-Regular.ttf"
          >
            {`the lazy dog`}
          </Text>
        </group>
        <group ref={text2}>
          <Text
            position={new THREE.Vector3(-180, 125, 0)}
            fontSize={width / 18}
            font="/fonts/NotoSerifJP-Regular.ttf"
          >
            {`素早い茶色の`}
          </Text>
          <Text
            position={new THREE.Vector3(180, 0, 0)}
            fontSize={width / 18}
            font="/fonts/NotoSerifJP-Regular.ttf"
          >
            {`キツネが怠惰な犬`}
          </Text>
          <Text
            position={new THREE.Vector3(-70, -125, 0)}
            fontSize={width / 18}
            font="/fonts/NotoSerifJP-Regular.ttf"
          >
            {`を飛び越える`}
          </Text>
        </group>
      </group>
    </>
  );
};

export default Dispersion;

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function OceanSurface() {
  const materialRef = useRef();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 }
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  const vertexShader = `
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 pos = position;
      pos.z += sin(pos.x * 0.5 + uTime) * 0.15 + cos(pos.y * 0.5 + uTime) * 0.15;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      vec3 color1 = vec3(0.012, 0.075, 0.149); // #031326
      vec3 color2 = vec3(0.047, 0.290, 0.431); // #0c4a6e
      float mixVal = sin(vUv.x * 20.0 + uTime) * 0.5 + 0.5;
      vec3 finalColor = mix(color1, color2, mixVal);
      gl_FragColor = vec4(finalColor, 0.85);
    }
  `;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[200, 200, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

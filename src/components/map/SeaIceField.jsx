import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTelemetry } from '../../context/TelemetryContext';
import * as THREE from 'three';

export default function SeaIceField() {
  const { layers, seaIce } = useTelemetry() || { layers: { seaIce: true } };
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
    varying vec2 vUv;
    varying vec3 vPos;
    void main() {
      vUv = uv;
      vPos = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vPos;

    float rand(vec2 n) { 
      return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
    }

    float noise(vec2 p){
      vec2 ip = floor(p);
      vec2 u = fract(p);
      u = u*u*(3.0-2.0*u);
      float res = mix(
        mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x),
        mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), u.y);
      return res*res;
    }

    void main() {
      // Procedural SIC mapping
      float n = noise(vPos.xy * 0.1 + vec2(uTime * 0.05));
      float sic = n; 
      vec4 color = vec4(0.0);
      if (sic < 0.15) {
        color = vec4(0.0, 0.0, 0.0, 0.0);
      } else if (sic < 0.40) {
        color = vec4(0.6, 0.8, 1.0, 0.4);
      } else if (sic < 0.70) {
        color = vec4(0.8, 0.9, 1.0, 0.7);
      } else {
        color = vec4(1.0, 1.0, 1.0, 0.9);
      }
      gl_FragColor = color;
    }
  `;

  if (!layers?.seaIce) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
      <planeGeometry args={[150, 150, 32, 32]} />
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

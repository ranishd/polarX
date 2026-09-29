import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

export default function AtmosphericEffects() {
  const pointsRef = useRef();

  const particleCount = 2000;
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const spd = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = Math.random() * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
      spd[i] = Math.random() * 0.05 + 0.02;
    }
    return [pos, spd];
  }, []);

  useFrame(() => {
    if (pointsRef.current) {
      const p = pointsRef.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        p[i * 3 + 1] -= speeds[i]; // move down
        p[i * 3] += Math.sin(p[i * 3 + 1] * 0.1) * 0.02; // slight horizontal drift
        if (p[i * 3 + 1] < 0) {
          p[i * 3 + 1] = 40; // reset to top
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Southern Sky Stars */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Snow Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.15} color="#ffffff" transparent opacity={0.6} sizeAttenuation={true} />
      </points>

      {/* Aurora Australis - Subtle Background Ribbon */}
      <mesh position={[0, 30, -50]} rotation={[0, 0, 0]}>
        <planeGeometry args={[200, 20, 32, 8]} />
        <meshBasicMaterial 
          color="#10b981" 
          transparent 
          opacity={0.15} 
          side={THREE.DoubleSide} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>
    </group>
  );
}

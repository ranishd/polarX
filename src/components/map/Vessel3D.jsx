import React, { useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useTelemetry } from '../../context/TelemetryContext';
import { latLonTo3D } from '../../utils/polarProjection';
import * as THREE from 'three';
import { Navigation } from 'lucide-react';

export default function Vessel3D() {
  const telemetry = useTelemetry();
  const vessel = telemetry?.vessel;
  const radarRef = useRef();

  useFrame(({ clock }) => {
    if (radarRef.current) {
      radarRef.current.rotation.y = clock.getElapsedTime() * 2;
    }
  });

  if (!vessel) return null;
  
  const lat = vessel.position?.lat ?? -62.45;
  const lon = vessel.position?.lon ?? 28.3;
  const [x, y, z] = latLonTo3D(lat, lon);
  const headingRad = (vessel.heading || 0) * (Math.PI / 180);

  return (
    <group position={[x, y, z]} rotation={[0, -headingRad, 0]}>
      {/* Hull */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.8, 0.4, 2.5]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      
      {/* Superstructure */}
      <mesh position={[0, 0.8, 0.5]}>
        <boxGeometry args={[0.6, 0.5, 1]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      
      {/* Bridge */}
      <mesh position={[0, 1.0, 0.8]}>
        <boxGeometry args={[0.5, 0.2, 0.2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Forward Ice Radar Cone */}
      <mesh ref={radarRef} position={[0, 0.6, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[4, 8, 32, 1, true, 0, Math.PI / 3]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.15} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      
      {/* Heading Line */}
      <mesh position={[0, 0.5, -3]}>
        <boxGeometry args={[0.05, 0.05, 4]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
      
      {/* Floating Info */}
      <Html distanceFactor={15} position={[0, 2, 0]} center>
        <div className="frost-panel px-3 py-1 text-xs whitespace-nowrap shadow-cryo-glow flex items-center gap-2">
          <Navigation size={12} className="text-cyan-400" />
          <span className="text-white font-bold">{vessel.name || 'ICE-BREAKER'}</span>
          <span className="text-cyan-400 font-mono">{(vessel.speedKts || 0).toFixed(1)} kts</span>
        </div>
      </Html>
    </group>
  );
}

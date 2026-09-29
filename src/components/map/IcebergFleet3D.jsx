import React from 'react';
import { Float, Line, Html } from '@react-three/drei';
import { useTelemetry } from '../../context/TelemetryContext';
import { latLonTo3D } from '../../utils/polarProjection';
import * as THREE from 'three';

const ThreatColors = {
  HIGH: '#ef4444',
  MODERATE: '#f59e0b',
  LOW: '#06b6d4'
};

export default function IcebergFleet3D() {
  const telemetry = useTelemetry();
  const icebergs = telemetry?.icebergs || [];
  const layers = telemetry?.layers || {};

  if (!layers.icebergs || icebergs.length === 0) return null;

  return (
    <group>
      {icebergs.map((berg, idx) => {
        const lat = berg.position?.lat ?? -65;
        const lon = berg.position?.lon ?? 20;
        const [x, y, z] = latLonTo3D(lat, lon);
        const threatColor = ThreatColors[berg.threatLevel] || ThreatColors.LOW;
        
        // Convert trajectory or create mock path
        const trajPoints = berg.trajectory 
          ? berg.trajectory.map(pt => new THREE.Vector3(...latLonTo3D(pt.lat, pt.lon)))
          : [new THREE.Vector3(x, y, z), new THREE.Vector3(x + 1, y, z - 2)];

        return (
          <group key={idx} position={[x, y, z]}>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
              {/* Above Water Tabular Block */}
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[1.2, 1, 1.2]} />
                <meshStandardMaterial color="#ffffff" emissive="#e0f2fe" emissiveIntensity={0.2} />
              </mesh>
              
              {/* Massive Keel */}
              <mesh position={[0, -2, 0]}>
                <coneGeometry args={[1.8, 4, 4]} rotation={[Math.PI, 0, 0]} />
                <meshStandardMaterial 
                  color="#0c4a6e" 
                  emissive={threatColor} 
                  emissiveIntensity={0.4} 
                  transparent 
                  opacity={0.4} 
                />
              </mesh>
            </Float>

            {/* Drift Trajectory */}
            <Line points={trajPoints} color={threatColor} lineWidth={2} transparent opacity={0.6} />
            
            <Html distanceFactor={15} center position={[0, 1.5, 0]}>
              <div className="badge-caution bg-gray-900/80 text-xs px-2 py-1 rounded border border-gray-700 shadow-berg-glow">
                {berg.id || `BERG-${idx}`}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

import React, { useMemo } from 'react';
import { Line, Html } from '@react-three/drei';
import { latLonTo3D } from '../../utils/polarProjection';
import * as THREE from 'three';

export default function PolarGrid() {
  const lats = [-60, -65, -70, -75];
  const lons = Array.from({ length: 24 }, (_, i) => i * 15);

  const latLines = useMemo(() => {
    return lats.map(lat => {
      const points = [];
      for (let lon = 0; lon <= 360; lon += 5) {
        points.push(new THREE.Vector3(...latLonTo3D(lat, lon)));
      }
      return { lat, points };
    });
  }, [lats]);

  const lonLines = useMemo(() => {
    return lons.map(lon => {
      const points = [
        new THREE.Vector3(...latLonTo3D(-55, lon)),
        new THREE.Vector3(...latLonTo3D(-80, lon))
      ];
      return { lon, points };
    });
  }, [lons]);

  return (
    <group position={[0, 0.1, 0]}>
      {/* Latitude Rings */}
      {latLines.map((line, i) => (
        <group key={`lat-${i}`}>
          <Line points={line.points} color="#ffffff" opacity={0.15} transparent lineWidth={1} />
          <Html position={line.points[0]} center>
            <div className="text-[10px] text-white/50 font-mono select-none">{line.lat}°S</div>
          </Html>
        </group>
      ))}
      
      {/* Longitude Radials */}
      {lonLines.map((line, i) => (
        <Line key={`lon-${i}`} points={line.points} color="#ffffff" opacity={0.15} transparent lineWidth={1} />
      ))}
    </group>
  );
}

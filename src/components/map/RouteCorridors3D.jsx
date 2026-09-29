import React from 'react';
import { Line } from '@react-three/drei';
import { useTelemetry } from '../../context/TelemetryContext';
import { latLonTo3D } from '../../utils/polarProjection';
import * as THREE from 'three';

export default function RouteCorridors3D() {
  const telemetry = useTelemetry();
  const routes = telemetry?.routes || [];
  const layers = telemetry?.layers || { routes: true };

  if (!layers.routes || routes.length === 0) return null;

  return (
    <group>
      {routes.map((route, idx) => {
        if (!route.waypoints) return null;
        
        const points = route.waypoints.map(wp => new THREE.Vector3(...latLonTo3D(wp.lat, wp.lon)));
        
        let color = '#f59e0b'; // Amber (CAUTION)
        let lineWidth = 2;
        let opacity = 0.7;
        let dashed = false;

        if (route.status === 'APPROVED') {
          color = '#10b981'; // Green
          lineWidth = 3;
          opacity = 1;
        } else if (route.status === 'BLOCKED') {
          color = '#ef4444'; // Red
          opacity = 0.6;
          dashed = true;
        }

        return (
          <group key={idx}>
            <Line
              points={points}
              color={color}
              lineWidth={lineWidth}
              transparent
              opacity={opacity}
              dashed={dashed}
              dashScale={50}
              dashSize={0.5}
              dashOffset={0.2}
            />
            {points.map((pt, pIdx) => (
              <mesh key={pIdx} position={pt}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial color={color} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

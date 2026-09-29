import React from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useTelemetry } from '../../context/TelemetryContext';
import { latLonToVector3, EARTH_RADIUS } from '../../utils/polarProjection';

export default function IcebergMarkers3D() {
  const { icebergs, layers } = useTelemetry();

  if (!layers?.icebergs || !icebergs || icebergs.length === 0) return null;

  return (
    <group>
      {icebergs.map((berg) => {
        const lat = berg.position?.lat ?? -65;
        const lon = berg.position?.lon ?? 20;
        const pos = latLonToVector3(lat, lon, EARTH_RADIUS + 0.1);

        const normal = pos.clone().normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          normal
        );

        const isCritical = berg.id === 'A-23A' || berg.threatLevel === 'HIGH';

        return (
          <group key={berg.id} position={pos} quaternion={quat}>
            {/* ── 3D Iceberg Prism (Above Water) ── */}
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.22, 0.30, 0.2, 6]} />
              <meshStandardMaterial
                color="#f0f9ff"
                roughness={0.4}
                metalness={0.1}
              />
            </mesh>

            {/* ── Submerged Hydrodynamic Keel (Under Water: ~90% mass) ── */}
            <mesh position={[0, -0.12, 0]}>
              <cylinderGeometry args={[0.28, 0.08, 0.28, 6]} />
              <meshStandardMaterial
                color="#0284c7"
                roughness={0.2}
                metalness={0.1}
                transparent
                opacity={0.5}
                depthWrite={false}
              />
            </mesh>

            {/* ── 10nm Proximity Hazard Perimeter Ring (For A-23A) ── */}
            {isCritical && (
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.75, 0.85, 32]} />
                <meshBasicMaterial
                  color="#0284c7"
                  transparent
                  opacity={0.5}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

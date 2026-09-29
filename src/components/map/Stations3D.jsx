import React, { memo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { latLonToVector3, EARTH_RADIUS } from '../../utils/polarProjection';

const maitriPos = latLonToVector3(-70.77, 11.73, EARTH_RADIUS + 0.08);
const normal = maitriPos.clone().normalize();
const quat = new THREE.Quaternion().setFromUnitVectors(
  new THREE.Vector3(0, 1, 0),
  normal
);

function Stations3D() {
  return (
    <group position={maitriPos} quaternion={quat}>
      {/* ── Base Target Beacon Rings ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.32, 24]} />
        <meshBasicMaterial color="#0284c7" side={THREE.DoubleSide} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.48, 24]} />
        <meshBasicMaterial color="#0284c7" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Vertical Light Column ── */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 6]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} />
      </mesh>

      {/* ── Clean Destination Tag ── */}
      <Html pointerEvents="none" position={[0, 0.75, 0]} center>
        <div className="pointer-events-none select-none bg-[#edf6fd]/95 border border-sky-300 px-2 py-0.5 rounded-full shadow-sm text-sky-950 text-[11px] font-sans font-medium flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
          <span className="font-semibold text-sky-950">Maitri Station</span>
          <span className="text-slate-400 font-normal">·</span>
          <span className="text-sky-800 text-[10px]">Destination</span>
        </div>
      </Html>
    </group>
  );
}

export default memo(Stations3D);

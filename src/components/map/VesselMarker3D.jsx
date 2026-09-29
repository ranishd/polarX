import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useTelemetry } from '../../context/TelemetryContext';
import { useOptics } from '../../context/OpticsContext';
import { latLonToVector3, EARTH_RADIUS } from '../../utils/polarProjection';

export default function VesselMarker3D() {
  const { vessel, layers, scenario } = useTelemetry();
  const { activeCam, vesselViewActive } = useOptics();
  const radarRef = useRef();
  const scanSweepRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (radarRef.current) {
      radarRef.current.rotation.y = t * 3.5; // Radar antenna spinning
    }
    if (scanSweepRef.current) {
      // Forward radar fan sweep line oscillating
      scanSweepRef.current.rotation.z = Math.sin(t * 1.8) * 0.45;
    }
  });

  const position = useMemo(() => {
    const lat = vessel?.position?.lat ?? -62.45;
    const lon = vessel?.position?.lon ?? 28.30;
    return latLonToVector3(lat, lon, EARTH_RADIUS + 0.12);
  }, [vessel?.position?.lat, vessel?.position?.lon]);

  const orientation = useMemo(() => {
    const normal = position.clone().normalize();
    const up = new THREE.Vector3(0, 1, 0);
    let north = up.clone().sub(normal.clone().multiplyScalar(up.dot(normal))).normalize();
    if (north.lengthSq() < 0.001) north = new THREE.Vector3(0, 0, 1);
    const east = new THREE.Vector3().crossVectors(normal, north).normalize();

    // Vessel heading in radians (clockwise from North)
    const headingDeg = vessel?.heading ?? 198;
    const headingRad = (headingDeg * Math.PI) / 180;

    // Heading direction on tangent plane
    const forward = north.clone().multiplyScalar(Math.cos(headingRad))
      .add(east.clone().multiplyScalar(Math.sin(headingRad))).normalize();

    const right = new THREE.Vector3().crossVectors(forward, normal).normalize();

    // X = right (starboard), Y = normal (up), Z = -forward (so -Z points forward to bow)
    const m = new THREE.Matrix4().makeBasis(right, normal, forward.clone().negate());
    return new THREE.Quaternion().setFromRotationMatrix(m);
  }, [position, vessel?.heading]);

  if (!vessel) return null;

  const isSensorLoss = scenario?.active === 'sensor_loss';

  return (
    <group position={position} quaternion={orientation}>
      {/* ── 1. REALISTIC POLAR RESEARCH VESSEL HULL (RV MAITRI-01) ── */}
      <group scale={[0.7, 0.7, 0.7]}>
        {/* Main Hull Body (Navy Steel with Ice-Strengthened Bow) */}
        <mesh position={[0, 0.08, 0.05]} castShadow>
          <boxGeometry args={[0.26, 0.16, 0.85]} />
          <meshStandardMaterial
            color="#0f2942"
            roughness={0.4}
            metalness={0.3}
          />
        </mesh>

        {/* Tapered Icebreaker Bow Wedge */}
        <mesh position={[0, 0.08, -0.5]} rotation={[0, Math.PI, 0]} castShadow>
          <coneGeometry args={[0.13, 0.28, 4]} />
          <meshStandardMaterial
            color="#0c4a6e"
            roughness={0.35}
            metalness={0.25}
          />
        </mesh>

        {/* Red Waterline Stripe */}
        <mesh position={[0, 0.01, 0.05]}>
          <boxGeometry args={[0.265, 0.025, 0.86]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>

        {/* Main Deck Plate (Slate Gray) */}
        <mesh position={[0, 0.165, 0.05]}>
          <boxGeometry args={[0.25, 0.01, 0.82]} />
          <meshStandardMaterial color="#64748b" roughness={0.6} />
        </mesh>

        {/* Forward Deck Winch / Hatch */}
        <mesh position={[0, 0.18, -0.28]}>
          <cylinderGeometry args={[0.04, 0.04, 0.03, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>

        {/* Superstructure Tier 1 (Cabin Quarters - Polar White) */}
        <mesh position={[0, 0.24, 0.05]}>
          <boxGeometry args={[0.2, 0.14, 0.42]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>

        {/* Superstructure Tier 2 (Navigation Bridge) */}
        <mesh position={[0, 0.33, -0.02]}>
          <boxGeometry args={[0.18, 0.07, 0.22]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.25} />
        </mesh>

        {/* Bridge Panoramic Windows (Icy Blue Tint) */}
        <mesh position={[0, 0.33, -0.132]}>
          <boxGeometry args={[0.17, 0.04, 0.01]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>

        {/* Radar Mast Pillar */}
        <mesh position={[0, 0.41, 0.02]}>
          <cylinderGeometry args={[0.012, 0.015, 0.12, 6]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.5} />
        </mesh>

        {/* Rotating Marine Radar Scanner Bar */}
        <group ref={radarRef} position={[0, 0.47, 0.02]}>
          <mesh>
            <boxGeometry args={[0.14, 0.015, 0.02]} />
            <meshStandardMaterial color="#0284c7" roughness={0.2} />
          </mesh>
        </group>

        {/* Exhaust Funnel */}
        <mesh position={[0, 0.32, 0.18]}>
          <cylinderGeometry args={[0.03, 0.035, 0.12, 8]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} />
        </mesh>

        {/* Aft Helipad Deck Circle */}
        <mesh position={[0, 0.172, 0.34]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.09, 16]} />
          <meshBasicMaterial color="#0284c7" transparent opacity={0.6} />
        </mesh>

        {/* Stern Propeller Wake Wash */}
        <mesh position={[0, -0.01, 0.9]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.28, 0.9]} />
          <meshBasicMaterial
            color="#bae6fd"
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* ── 2. FORWARD RADAR SWEEP FAN (60° Sector Arc, 12nm Sweep Ahead) ── */}
      {layers?.radarCone && (
        <group position={[0, 0.05, -0.4]}>
          {/* Main radar sector fan mesh */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            {/* args: innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength */}
            {/* Facing forward along -Z: in standard circle geometry, theta=0 is +X, theta=PI/2 is +Y, etc. */}
            <ringGeometry args={[0.1, 3.2, 32, 1, Math.PI * 0.33, Math.PI * 0.34]} />
            <meshBasicMaterial
              color="#0284c7"
              transparent
              opacity={isSensorLoss ? 0.06 : 0.14}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Range rings at 1nm, 2nm, 3nm scaled (0.8, 1.6, 2.4, 3.2) */}
          {[0.8, 1.6, 2.4, 3.2].map((r, idx) => (
            <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[r - 0.012, r, 32, 1, Math.PI * 0.33, Math.PI * 0.34]} />
              <meshBasicMaterial
                color="#38bdf8"
                transparent
                opacity={isSensorLoss ? 0.15 : 0.4}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          ))}

          {/* Oscillating Sweep Line across the arc */}
          <group ref={scanSweepRef}>
            <mesh position={[0, 0, -1.6]}>
              <boxGeometry args={[0.02, 0.01, 3.2]} />
              <meshBasicMaterial
                color="#7dd3fc"
                transparent
                opacity={isSensorLoss ? 0.2 : 0.6}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          </group>
        </group>
      )}

      {/* ── 3. CRISP HUD LABEL (Hidden in Chase/Vessel View for clean bridge immersion) ── */}
      {!vesselViewActive && activeCam !== 'chase' && (
        <Html pointerEvents="none" position={[0, 0.7, 0]} center>
          <div className="pointer-events-none select-none bg-[#edf6fd]/95 border border-sky-300 px-2 py-0.5 rounded-full shadow-md text-slate-800 text-[11px] font-sans font-medium flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            <span>{vessel.name || 'RV MAITRI-01'}</span>
            <span className="text-slate-400 font-normal">·</span>
            <span className="text-sky-700 font-mono text-[10px]">
              {vessel.speedKts?.toFixed(1)} kt
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

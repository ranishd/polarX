import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useTelemetry } from '../../context/TelemetryContext';
import { useOptics } from '../../context/OpticsContext';
import { latLonToVector3, getGreatCircleArc, EARTH_RADIUS } from '../../utils/polarProjection';

export default function ScenarioVisuals3D() {
  const { scenario, vessel, icebergs } = useTelemetry();
  const { activeCam, vesselViewActive } = useOptics();
  const activeScenarioId = scenario?.active;

  const beaconRef = useRef();
  const detourPulseRef = useRef();
  const blizzardRef = useRef();

  // Positions of vessel and A-23A on the globe
  const vesselPos = useMemo(() => {
    const lat = vessel?.position?.lat ?? -62.45;
    const lon = vessel?.position?.lon ?? 28.30;
    return latLonToVector3(lat, lon, EARTH_RADIUS + 0.14);
  }, [vessel?.position?.lat, vessel?.position?.lon]);

  const a23aBerg = useMemo(() => {
    return icebergs?.find((b) => b.id === 'A-23A') || icebergs?.[0] || {
      position: { lat: -65.0, lon: 20.0 },
    };
  }, [icebergs]);

  const a23aPos = useMemo(() => {
    const lat = a23aBerg?.position?.lat ?? -65.0;
    const lon = a23aBerg?.position?.lon ?? 20.0;
    return latLonToVector3(lat, lon, EARTH_RADIUS + 0.14);
  }, [a23aBerg]);

  // Conjunction hazard line (Vessel to A-23A)
  const hazardLinePoints = useMemo(() => {
    if (activeScenarioId !== 'berg_intercept') return [];
    return getGreatCircleArc(vesselPos, a23aPos, 24, 0.14);
  }, [activeScenarioId, vesselPos, a23aPos]);

  // Recommended Detour Line (curving gracefully to Starboard around A-23A)
  const detourCurvePoints = useMemo(() => {
    if (activeScenarioId !== 'berg_intercept' && !vesselViewActive) return [];
    const pStart = vesselPos;
    const pMid = latLonToVector3(-63.85, 27.20, EARTH_RADIUS + 0.15);
    const pEnd = latLonToVector3(-66.40, 22.80, EARTH_RADIUS + 0.15);

    const arc1 = getGreatCircleArc(pStart, pMid, 16, 0.15);
    const arc2 = getGreatCircleArc(pMid, pEnd, 16, 0.15);
    arc2.shift();
    return [...arc1, ...arc2];
  }, [activeScenarioId, vesselViewActive, vesselPos]);

  const detourCurve = useMemo(() => {
    if (detourCurvePoints.length < 2) return null;
    return new THREE.CatmullRomCurve3(detourCurvePoints);
  }, [detourCurvePoints]);

  // Blizzard storm particles (for 'storm' scenario)
  const blizzardParticles = useMemo(() => {
    const count = 350;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Scatter in a dome around the vessel
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = Math.random() * 3 + 0.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return positions;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Pulse beacon around A-23A
    if (beaconRef.current) {
      const scale = 1 + Math.sin(t * 4) * 0.25;
      beaconRef.current.scale.set(scale, scale, scale);
    }

    // Move photon along detour curve
    if (detourPulseRef.current && detourCurve) {
      const progress = (t * 0.25) % 1;
      const pt = detourCurve.getPointAt(progress);
      detourPulseRef.current.position.copy(pt);
    }

    // Blizzard particle motion
    if (blizzardRef.current && activeScenarioId === 'storm') {
      const positions = blizzardRef.current.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += 0.08; // High wind drift
        positions[i + 1] -= 0.04; // Falling snow
        if (positions[i + 1] < 0) positions[i + 1] = 3.0;
        if (positions[i] > 3) positions[i] = -3.0;
      }
      blizzardRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* ═══════════════════════════════════════════════════════════════
          SCENARIO 1: A-23A TRAJECTORY SURGE & DETOUR CORRIDOR
          ═══════════════════════════════════════════════════════════════ */}
      {activeScenarioId === 'berg_intercept' && (
        <group>
          {/* 1. Pulsing Hazard Conjunction Vector Line (Bow to A-23A) */}
          {hazardLinePoints.length > 0 && (
            <Line
              points={hazardLinePoints}
              color="#dc2626"
              lineWidth={3.5}
              dashed
              dashSize={0.3}
              gapSize={0.2}
              transparent
              opacity={0.9}
            />
          )}

          {/* 2. Concentric Warning Rings around A-23A */}
          <group position={a23aPos}>
            <mesh ref={beaconRef} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.85, 1.05, 32]} />
              <meshBasicMaterial
                color="#dc2626"
                transparent
                opacity={0.65}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* 3D Hazard Tag over A-23A */}
            <Html center pointerEvents="none" position={[0, 0.6, 0]}>
              <div className="bg-red-900/90 border border-red-500 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap animate-pulse flex items-center gap-1">
                <span>⚠️</span>
                <span>COLLISION HAZARD · CPA 1.8 NM</span>
              </div>
            </Html>
          </group>

          {/* 3. Conjunction Vector Midpoint Label */}
          {hazardLinePoints.length > 12 && (
            <group position={hazardLinePoints[Math.floor(hazardLinePoints.length / 2)]}>
              <Html center pointerEvents="none">
                <div className="bg-slate-900/90 border border-red-500/80 text-red-300 font-mono text-[9px] px-2 py-0.5 rounded shadow-md whitespace-nowrap">
                  CONJUNCTION VECTOR
                </div>
              </Html>
            </group>
          )}
        </group>
      )}

      {/* ── RECOMMENDED DETOUR LINE (Route Bravo bypass) ── */}
      {(activeScenarioId === 'berg_intercept' || vesselViewActive) && detourCurvePoints.length > 0 && (
        <group>
          {/* Curved Detour Ribbon */}
          <Line
            points={detourCurvePoints}
            color="#0284c7"
            lineWidth={3.8}
            transparent
            opacity={0.95}
          />

          {/* Animated Traveling Pulse along the detour curve */}
          <mesh ref={detourPulseRef}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>

          {/* 3D Detour Label along the arc (Concept from user mockup) */}
          {detourCurvePoints.length > 14 && (
            <group position={detourCurvePoints[Math.floor(detourCurvePoints.length * 0.55)]}>
              <Html center pointerEvents="none">
                <div className="bg-sky-950/90 border border-sky-400 text-sky-200 font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1">
                  <span>RECOMMENDED DETOUR LINE</span>
                  <span className="text-cyan-400 font-normal">· 18.4 NM CLEARANCE</span>
                </div>
              </Html>
            </group>
          )}
        </group>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SCENARIO 2: KATABATIC BLIZZARD GALE
          ═══════════════════════════════════════════════════════════════ */}
      {activeScenarioId === 'storm' && (
        <group position={vesselPos}>
          <points ref={blizzardRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={blizzardParticles.length / 3}
                array={blizzardParticles}
                itemSize={3}
              />
            </bufferGeometry>
            <pointsMaterial
              color="#f0f9ff"
              size={0.06}
              transparent
              opacity={0.8}
              depthWrite={false}
            />
          </points>

          {/* Storm Label */}
          <Html center pointerEvents="none" position={[0, 1.2, 0]}>
            <div className="bg-slate-900/90 border border-sky-400 text-sky-200 font-mono text-[10px] font-bold px-2.5 py-1 rounded shadow-lg whitespace-nowrap flex items-center gap-1.5 animate-pulse">
              <span>🌊</span>
              <span>KATABATIC GALE: 48 KT / 5.5M WAVES</span>
            </div>
          </Html>
        </group>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SCENARIO 3: SAR SATELLITE OUTAGE / SENSOR BLACKOUT
          ═══════════════════════════════════════════════════════════════ */}
      {activeScenarioId === 'sensor_loss' && (
        <group position={a23aPos}>
          {/* Expanded Trajectory Uncertainty Ellipse (+40% variance) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.2, 1.35, 32]} />
            <meshBasicMaterial
              color="#d97706"
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>

          <Html center pointerEvents="none" position={[0, 0.7, 0]}>
            <div className="bg-amber-950/90 border border-amber-500 text-amber-200 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded shadow-lg whitespace-nowrap animate-pulse flex items-center gap-1">
              <span>📡</span>
              <span>SAR OUTAGE · UNCERTAINTY ENVELOPE ±40%</span>
            </div>
          </Html>
        </group>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SCENARIO 4: RAPID PACK-ICE EXPANSION
          ═══════════════════════════════════════════════════════════════ */}
      {activeScenarioId === 'ice_freeze' && (
        <group position={vesselPos}>
          {/* Encroaching Ice Frost Perimeter */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -1.8]}>
            <planeGeometry args={[2.5, 3.2]} />
            <meshBasicMaterial
              color="#e0f2fe"
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>

          <Html center pointerEvents="none" position={[0, 0.8, -1.8]}>
            <div className="bg-sky-950/90 border border-cyan-400 text-cyan-200 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded shadow-lg whitespace-nowrap flex items-center gap-1">
              <span>❄️</span>
              <span>RAPID FREEZE · 75%+ PACK ICE ADVANCE</span>
            </div>
          </Html>
        </group>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SCENARIO 5: BUNKER FUEL EMERGENCY
          ═══════════════════════════════════════════════════════════════ */}
      {activeScenarioId === 'low_fuel' && (
        <group position={vesselPos}>
          {/* Fuel Safety Boundary Circle */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.2, 2.3, 32]} />
            <meshBasicMaterial
              color="#f59e0b"
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>

          <Html center pointerEvents="none" position={[0, 0.9, 0]}>
            <div className="bg-amber-950/90 border border-amber-500 text-amber-200 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded shadow-lg whitespace-nowrap flex items-center gap-1">
              <span>⛽</span>
              <span>FUEL FLOOR: 28% · ECO-DRIFT MANDATE</span>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

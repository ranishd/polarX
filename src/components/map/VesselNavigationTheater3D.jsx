import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useTelemetry } from '../../context/TelemetryContext';
import { useOptics } from '../../context/OpticsContext';

/* ═══════════════════════════════════════════════════════════════
   VesselNavigationTheater3D: Dedicated 3rd-Person Polar Vessel View
   Level Horizon, Realistic Research Ship, Radar Fan & Crisis Overlays
   ═══════════════════════════════════════════════════════════════ */

export default function VesselNavigationTheater3D() {
  const { vessel, scenario } = useTelemetry();
  const { mode } = useOptics();
  const controlsRef = useRef();

  const activeScenarioId = scenario?.active;
  const isSensorLoss = activeScenarioId === 'sensor_loss';
  const isStorm = activeScenarioId === 'storm';

  // Refs for animations
  const shipGroupRef = useRef();
  const radarScanRef = useRef();
  const antennaRef = useRef();
  const a23aBeaconRef = useRef();
  const detourPulseRef = useRef();
  const blizzardRef = useRef();

  // Ship base position: slightly offset left (-0.5) so it's centered in the open viewport
  const shipPos = [-0.5, 0, 0];

  // Iceberg A-23A position ahead in the fairway
  const a23aPos = [-0.2, 0, -11.5];

  // Camera initial setup in third-person stern perspective
  const { camera } = useThree();
  React.useEffect(() => {
    // Elevate behind stern, looking forward over the bow into the fairway
    camera.position.set(-0.5, 2.4, 5.2);
    camera.lookAt(-0.5, 0.8, -4.5);
    if (controlsRef.current) {
      controlsRef.current.target.set(-0.5, 0.8, -1.0);
      controlsRef.current.update();
    }
  }, [camera]);

  // Detour line points (curving smoothly to starboard around A-23A)
  const detourPoints = useMemo(() => {
    const points = [
      new THREE.Vector3(-0.5, 0.05, -1.8),
      new THREE.Vector3(-0.3, 0.05, -4.0),
      new THREE.Vector3(1.6, 0.05, -7.5),
      new THREE.Vector3(2.4, 0.05, -11.5),
      new THREE.Vector3(1.8, 0.05, -15.5),
      new THREE.Vector3(0.5, 0.05, -19.0),
    ];
    const curve = new THREE.CatmullRomCurve3(points);
    return {
      curve,
      linePoints: curve.getPoints(36),
    };
  }, []);

  // Hazard line points (straight collision line to A-23A)
  const hazardPoints = useMemo(() => {
    return [
      new THREE.Vector3(-0.5, 0.1, -1.8),
      new THREE.Vector3(a23aPos[0], 0.1, a23aPos[2]),
    ];
  }, [a23aPos]);

  // Procedural sea-ice floes scattered on the ocean
  const iceFloes = useMemo(() => {
    const floes = [];
    const count = 38;
    for (let i = 0; i < count; i++) {
      // Scatter on either side of the vessel's fairway
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = -0.5 + side * (1.8 + Math.random() * 8.5);
      const z = -20 + Math.random() * 26;
      const scale = 0.4 + Math.random() * 0.9;
      const rot = Math.random() * Math.PI;
      floes.push({ x, z, scale, rot });
    }
    return floes;
  }, []);

  // Blizzard particles for 'storm' scenario
  const blizzardParticles = useMemo(() => {
    const count = 400;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = Math.random() * 6;
      positions[i * 3 + 2] = -15 + Math.random() * 24;
    }
    return positions;
  }, []);

  // Per-frame animations
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Gentle hydrodynamic ship pitch & roll on the waves
    if (shipGroupRef.current) {
      const pitchAmp = isStorm ? 0.045 : 0.015;
      const rollAmp = isStorm ? 0.06 : 0.02;
      shipGroupRef.current.rotation.x = Math.sin(t * 1.6) * pitchAmp;
      shipGroupRef.current.rotation.z = Math.cos(t * 1.2) * rollAmp;
      shipGroupRef.current.position.y = Math.sin(t * 2.0) * (isStorm ? 0.05 : 0.02);
    }

    // Rotating marine radar antennas
    if (antennaRef.current) {
      antennaRef.current.rotation.y = t * 4.0;
    }

    // Oscillating forward radar fan sweep line
    if (radarScanRef.current) {
      radarScanRef.current.rotation.z = Math.sin(t * 2.0) * 0.52;
    }

    // Pulsing A-23A threat beacon
    if (a23aBeaconRef.current) {
      const scale = 1 + Math.sin(t * 5.0) * 0.2;
      a23aBeaconRef.current.scale.set(scale, scale, scale);
    }

    // Traveling detour line photon
    if (detourPulseRef.current && detourPoints.curve) {
      const prog = (t * 0.2) % 1;
      const pt = detourPoints.curve.getPointAt(prog);
      detourPulseRef.current.position.copy(pt);
    }

    // Blizzard storm particles
    if (blizzardRef.current && isStorm) {
      const arr = blizzardRef.current.geometry.attributes.position.array;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i] += 0.12; // Fast diagonal crosswind
        arr[i + 1] -= 0.06; // Downward snowfall
        arr[i + 2] += 0.04;
        if (arr[i + 1] < 0) arr[i + 1] = 6.0;
        if (arr[i] > 8) arr[i] = -8.0;
      }
      blizzardRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* ── 1. SOUTHERN OCEAN HORIZONTAL SURFACE ── */}
      <mesh position={[-0.5, -0.02, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color="#082846"
          roughness={0.2}
          metalness={0.3}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Horizon Fog Suggestion */}
      <mesh position={[-0.5, 4, -28]}>
        <planeGeometry args={[80, 16]} />
        <meshBasicMaterial
          color="#edf6fd"
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* ── 2. DETAILED POLAR RESEARCH VESSEL (ORV MAITRI-01) ── */}
      <group position={shipPos}>
        <group ref={shipGroupRef}>
          {/* ── HULL STRUCTURE ── */}
          {/* Main Hull Body (Navy Blue Ice-Strengthened Steel) */}
          <mesh position={[0, 0.28, 0]} castShadow>
            <boxGeometry args={[0.72, 0.44, 2.4]} />
            <meshStandardMaterial
              color="#0f2942"
              roughness={0.35}
              metalness={0.25}
            />
          </mesh>

          {/* Icebreaker Flared Bow Wedge (Tapering forward) */}
          <mesh position={[0, 0.32, -1.45]} rotation={[0, Math.PI, 0]} castShadow>
            <coneGeometry args={[0.38, 0.72, 4]} />
            <meshStandardMaterial
              color="#0c4a6e"
              roughness={0.3}
              metalness={0.25}
            />
          </mesh>

          {/* Underwater Bulbous Bow (Red) */}
          <mesh position={[0, 0.06, -1.5]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial color="#dc2626" roughness={0.4} />
          </mesh>

          {/* Waterline Boot-Topping Stripe (Crimson Red) */}
          <mesh position={[0, 0.08, -0.05]}>
            <boxGeometry args={[0.74, 0.06, 2.5]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>

          {/* Main Weather Deck (Non-skid Steel Slate) */}
          <mesh position={[0, 0.51, -0.05]}>
            <boxGeometry args={[0.68, 0.03, 2.35]} />
            <meshStandardMaterial color="#475569" roughness={0.6} />
          </mesh>

          {/* Forecastle Breakwater / Wave Shield */}
          <mesh position={[0, 0.58, -0.95]}>
            <boxGeometry args={[0.64, 0.12, 0.04]} />
            <meshStandardMaterial color="#0c4a6e" roughness={0.4} />
          </mesh>

          {/* ── SUPERSTRUCTURE & BRIDGE ── */}
          {/* Tier 1: Living Quarters Deckhouse (Polar White) */}
          <mesh position={[0, 0.74, 0.05]} castShadow>
            <boxGeometry args={[0.56, 0.42, 1.15]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.25} />
          </mesh>

          {/* Tier 2: Officer Deck & Electronics */}
          <mesh position={[0, 1.05, -0.05]} castShadow>
            <boxGeometry args={[0.52, 0.22, 0.8]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.2} />
          </mesh>

          {/* Tier 3: Navigation Bridge with Panoramic Windows */}
          <mesh position={[0, 1.25, -0.22]} castShadow>
            <boxGeometry args={[0.58, 0.18, 0.45]} />
            <meshStandardMaterial color="#ffffff" roughness={0.15} />
          </mesh>

          {/* Bridge Wings (Port & Starboard Lookout Platforms) */}
          <mesh position={[0, 1.24, -0.2]}>
            <boxGeometry args={[0.82, 0.04, 0.22]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
          </mesh>

          {/* Front Bridge Windows (Icy Blue Tint) */}
          <mesh position={[0, 1.27, -0.45]}>
            <boxGeometry args={[0.52, 0.09, 0.02]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>

          {/* ── MASTS, FUNNEL & SENSORS ── */}
          {/* Radar Mast Pillar */}
          <mesh position={[0, 1.5, -0.15]}>
            <cylinderGeometry args={[0.025, 0.035, 0.36, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.5} />
          </mesh>

          {/* Spinning X-Band Marine Radar Scanner */}
          <group ref={antennaRef} position={[0, 1.68, -0.15]}>
            <mesh>
              <boxGeometry args={[0.38, 0.035, 0.04]} />
              <meshStandardMaterial color="#0284c7" roughness={0.2} />
            </mesh>
          </group>

          {/* Twin Satellite Radomes (White Domes) */}
          <mesh position={[-0.16, 1.45, 0.15]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} />
          </mesh>
          <mesh position={[0.16, 1.45, 0.15]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} />
          </mesh>

          {/* Main Exhaust Funnel Stack (Navy & Red) */}
          <mesh position={[0, 1.08, 0.42]} rotation={[-0.1, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.36, 8]} />
            <meshStandardMaterial color="#0f2942" roughness={0.4} />
          </mesh>

          {/* ── AFT HELIDECK & OCEAN CRANE ── */}
          {/* Helipad Deck (Aft) */}
          <mesh position={[0, 0.54, 0.85]}>
            <boxGeometry args={[0.62, 0.03, 0.65]} />
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </mesh>

          {/* Helipad Painted Circle & 'H' */}
          <mesh position={[0, 0.56, 0.85]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.16, 0.22, 24]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>

          {/* Stern Oceanographic A-Frame Crane Gantry */}
          <mesh position={[0, 0.72, 1.15]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.42, 0.35, 0.03]} />
            <meshStandardMaterial color="#eab308" roughness={0.3} />
          </mesh>

          {/* Enclosed Orange Lifeboats on Davits (Port & Starboard) */}
          <mesh position={[-0.34, 0.88, 0.1]}>
            <boxGeometry args={[0.09, 0.12, 0.28]} />
            <meshStandardMaterial color="#ea580c" roughness={0.3} />
          </mesh>
          <mesh position={[0.34, 0.88, 0.1]}>
            <boxGeometry args={[0.09, 0.12, 0.28]} />
            <meshStandardMaterial color="#ea580c" roughness={0.3} />
          </mesh>

          {/* ── PROPELLER WAKE & BOW FOAM ── */}
          {/* Twin Stern Propeller Wake Wash */}
          <mesh position={[0, -0.01, 2.2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.9, 2.6]} />
            <meshBasicMaterial
              color="#bae6fd"
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>

          {/* Bow Wave Peeling Foam */}
          <mesh position={[-0.32, 0.01, -1.2]} rotation={[-Math.PI / 2, 0, 0.35]}>
            <planeGeometry args={[0.2, 0.8]} />
            <meshBasicMaterial color="#e0f2fe" transparent opacity={0.5} />
          </mesh>
          <mesh position={[0.32, 0.01, -1.2]} rotation={[-Math.PI / 2, 0, -0.35]}>
            <planeGeometry args={[0.2, 0.8]} />
            <meshBasicMaterial color="#e0f2fe" transparent opacity={0.5} />
          </mesh>
        </group>
      </group>

      {/* ── 3. FORWARD RADAR SECTOR FAN (Projecting 12nm Ahead) ── */}
      <group position={[-0.5, 0.04, -1.8]}>
        {/* Radar Cone Sector Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 9.5, 36, 1, Math.PI * 0.33, Math.PI * 0.34]} />
          <meshBasicMaterial
            color="#0284c7"
            transparent
            opacity={isSensorLoss ? 0.05 : 0.15}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* 4 Range Rings: 3nm, 6nm, 9nm, 12nm (scaled to 2.4, 4.8, 7.2, 9.5) */}
        {[2.4, 4.8, 7.2, 9.5].map((r, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r - 0.03, r, 36, 1, Math.PI * 0.33, Math.PI * 0.34]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={isSensorLoss ? 0.2 : 0.45}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ))}

        {/* Oscillating Radar Sweep Line */}
        <group ref={radarScanRef}>
          <mesh position={[0, 0, -4.8]}>
            <boxGeometry args={[0.04, 0.01, 9.5]} />
            <meshBasicMaterial
              color="#7dd3fc"
              transparent
              opacity={isSensorLoss ? 0.2 : 0.75}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>

      {/* ── 4. SCATTERED SEA-ICE FLOES (In the Southern Ocean) ── */}
      <group>
        {iceFloes.map((f, idx) => (
          <group key={idx} position={[f.x, 0.02, f.z]} rotation={[0, f.rot, 0]} scale={[f.scale, 0.12, f.scale]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.8, 1.0, 0.25, 7]} />
              <meshStandardMaterial
                color="#f8fafc"
                roughness={0.4}
                metalness={0.1}
              />
            </mesh>
            {/* Underwater Blue Ice Rim */}
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[1.05, 0.6, 0.25, 7]} />
              <meshBasicMaterial
                color="#0284c7"
                transparent
                opacity={0.35}
                depthWrite={false}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── 5. MASSIVE TABULAR ICEBERG A-23A (Ahead in Channel) ── */}
      <group position={a23aPos}>
        {/* Main Iceberg Plateau Body */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <cylinderGeometry args={[2.2, 2.8, 1.7, 8]} />
          <meshStandardMaterial
            color="#f0f9ff"
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>

        {/* Jagged Ice Pinnacle */}
        <mesh position={[0.4, 1.9, -0.3]}>
          <coneGeometry args={[1.1, 1.2, 6]} />
          <meshStandardMaterial color="#e0f2fe" roughness={0.35} />
        </mesh>

        {/* Deep Submerged Ice Keel (~90% mass) */}
        <mesh position={[0, -1.2, 0]}>
          <cylinderGeometry args={[2.8, 0.8, 2.4, 8]} />
          <meshStandardMaterial
            color="#0284c7"
            transparent
            opacity={0.45}
            roughness={0.2}
            depthWrite={false}
          />
        </mesh>

        {/* Hazard Reticle & Tag */}
        <Html center pointerEvents="none" position={[0, 2.7, 0]}>
          <div className="flex flex-col items-center">
            <div className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded shadow-lg whitespace-nowrap flex items-center gap-1.5 ${
              activeScenarioId === 'berg_intercept'
                ? 'bg-red-950/95 border border-red-500 text-red-200 animate-pulse'
                : 'bg-slate-900/90 border border-sky-400 text-sky-200'
            }`}>
              <span>🧊</span>
              <span>ICEBERG A-23A</span>
              <span className="text-slate-400 font-normal">|</span>
              <span className={activeScenarioId === 'berg_intercept' ? 'text-red-400 font-extrabold' : 'text-sky-400'}>
                CPA {activeScenarioId === 'berg_intercept' ? '1.8 nm' : '8.4 nm'}
              </span>
            </div>
            {activeScenarioId === 'berg_intercept' && (
              <span className="mt-0.5 px-2 py-0.2 rounded-full bg-red-600 text-white text-[9px] font-mono font-bold">
                ⚠️ COLLISION WARNING
              </span>
            )}
          </div>
        </Html>

        {/* Pulsing Beacon Ring (when A-23A scenario active) */}
        {activeScenarioId === 'berg_intercept' && (
          <mesh ref={a23aBeaconRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
            <ringGeometry args={[3.2, 3.6, 32]} />
            <meshBasicMaterial
              color="#dc2626"
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>

      {/* ── 6. CRISIS VISUAL RESPONSES ── */}
      {/* ── SCENARIO 1: A-23A TRAJECTORY SURGE ── */}
      {activeScenarioId === 'berg_intercept' && (
        <group>
          {/* Direct Collision Conjunction Vector (Dashed Red Line) */}
          <Line
            points={hazardPoints}
            color="#ef4444"
            lineWidth={4.0}
            dashed
            dashSize={0.4}
            gapSize={0.25}
            transparent
            opacity={0.95}
          />

          <Html center pointerEvents="none" position={[-0.35, 0.5, -6.5]}>
            <div className="bg-red-950/90 border border-red-500 text-red-200 font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap flex items-center gap-1 animate-pulse">
              <span>⚠️</span>
              <span>COLLISION VECTOR · CPA 1.8 NM</span>
            </div>
          </Html>
        </group>
      )}

      {/* ── RECOMMENDED DETOUR LINE (Always visible or in crisis) ── */}
      <group>
        <Line
          points={detourPoints.linePoints}
          color="#0284c7"
          lineWidth={4.2}
          transparent
          opacity={0.95}
        />

        {/* Traveling Detour Pulse */}
        <mesh ref={detourPulseRef}>
          <sphereGeometry args={[0.14, 12, 12]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        {/* 3D Label along Detour Arc */}
        <Html center pointerEvents="none" position={[1.8, 0.6, -9.5]}>
          <div className="bg-sky-950/90 border border-sky-400 text-sky-100 font-mono text-[10px] font-bold px-3 py-1 rounded-full shadow-xl whitespace-nowrap flex items-center gap-1.5">
            <span className="text-emerald-400">●</span>
            <span>RECOMMENDED DETOUR LINE</span>
            <span className="text-cyan-300 font-normal">· 18.4 NM CLEARANCE</span>
          </div>
        </Html>
      </group>

      {/* ── SCENARIO 2: KATABATIC BLIZZARD GALE ── */}
      {isStorm && (
        <group position={[-0.5, 0, 0]}>
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
              color="#f8fafc"
              size={0.1}
              transparent
              opacity={0.85}
              depthWrite={false}
            />
          </points>

          <Html center pointerEvents="none" position={[0, 2.2, -2.5]}>
            <div className="bg-sky-950/95 border border-sky-400 text-sky-200 font-mono text-[11px] font-bold px-3 py-1 rounded-xl shadow-xl whitespace-nowrap flex items-center gap-2 animate-pulse">
              <span>🌊</span>
              <span>KATABATIC GALE: 48 KT / 5.5M WAVES ACTIVE</span>
            </div>
          </Html>
        </group>
      )}

      {/* ── SCENARIO 3: SAR SATELLITE OUTAGE ── */}
      {isSensorLoss && (
        <group position={a23aPos}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[4.2, 4.6, 32]} />
            <meshBasicMaterial
              color="#d97706"
              transparent
              opacity={0.65}
              side={THREE.DoubleSide}
            />
          </mesh>
          <Html center pointerEvents="none" position={[0, 3.4, 0]}>
            <div className="bg-amber-950/90 border border-amber-500 text-amber-200 font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap animate-pulse">
              SAR DROPOUT: UNCERTAINTY ENVELOPE ±40%
            </div>
          </Html>
        </group>
      )}

      {/* ── SCENARIO 4: RAPID PACK-ICE EXPANSION ── */}
      {activeScenarioId === 'ice_freeze' && (
        <group position={[-0.5, 0.04, -6.5]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[6.5, 7.5]} />
            <meshBasicMaterial
              color="#e0f2fe"
              transparent
              opacity={0.45}
              depthWrite={false}
            />
          </mesh>
          <Html center pointerEvents="none" position={[0, 0.6, 0]}>
            <div className="bg-cyan-950/90 border border-cyan-400 text-cyan-200 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded shadow-lg whitespace-nowrap">
              ❄️ RAPID FREEZE: &gt;75% PACK ICE ADVANCE
            </div>
          </Html>
        </group>
      )}

      {/* ── SCENARIO 5: BUNKER FUEL EMERGENCY ── */}
      {activeScenarioId === 'low_fuel' && (
        <group position={shipPos}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
            <ringGeometry args={[6.8, 7.1, 36]} />
            <meshBasicMaterial
              color="#f59e0b"
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
          <Html center pointerEvents="none" position={[0, 2.0, 0]}>
            <div className="bg-amber-950/90 border border-amber-500 text-amber-200 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded shadow-lg whitespace-nowrap">
              ⛽ FUEL FLOOR: 28% · ECO-DRIFT MANDATE
            </div>
          </Html>
        </group>
      )}

      {/* ── 7. PRECISION 3RD-PERSON ORBIT CAMERA CONTROLS ── */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableRotate={true}
        rotateSpeed={0.65}
        enableZoom={true}
        zoomSpeed={0.8}
        enablePan={false}
        enableDamping={true}
        dampingFactor={0.08}
        minDistance={2.0} // Prevents clipping into ship hull
        maxDistance={22.0} // Allows broad tactical view of fairway and A-23A
        maxPolarAngle={Math.PI / 2 - 0.02} // Keeps camera above the ocean waterline!
      />
    </group>
  );
}

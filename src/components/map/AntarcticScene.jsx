import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import EarthGlobe3D from './EarthGlobe3D';
import VesselMarker3D from './VesselMarker3D';
import IcebergMarkers3D from './IcebergMarkers3D';
import RoutePathways3D from './RoutePathways3D';
import Stations3D from './Stations3D';
import RadarSweep3D from './RadarSweep3D';
import TacticalReticles from './TacticalReticles';
import ScenarioVisuals3D from './ScenarioVisuals3D';
import VesselNavigationTheater3D from './VesselNavigationTheater3D';
import { PolarOptics } from './PolarOptics';
import { CameraDirector } from '../../utils/cameraDirector';
import { useTelemetry } from '../../context/TelemetryContext';
import { useOptics } from '../../context/OpticsContext';

function CameraController({ controlsRef }) {
  const { camera } = useThree();
  const telemetry = useTelemetry();
  const telemetryRef = useRef(telemetry);
  telemetryRef.current = telemetry;
  const [director, setDirector] = useState(null);

  useEffect(() => {
    if (controlsRef.current) {
      setDirector(new CameraDirector(camera, controlsRef.current));
    }
  }, [camera, controlsRef]);

  useEffect(() => {
    if (!director) return;

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'f') director.startAnimation('route', telemetryRef.current);
      else if (key === 'o') director.startAnimation('orbital', telemetryRef.current);
      else if (key === ' ' || key === 'escape') director.startAnimation('reset', telemetryRef.current);
    };

    const handleCustomCommand = (e) => {
      const type = e.detail;
      if (['route', 'orbital', 'reset'].includes(type)) {
        director.startAnimation(type, telemetryRef.current);
      }
    };

    const handlePointerDown = () => {
      if (director && director.isAnimating) {
        director.cancel();
      }
    };
    
    const canvas = document.querySelector('canvas');
    if (canvas) canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('ice-camera-command', handleCustomCommand);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('ice-camera-command', handleCustomCommand);
      if (canvas) canvas.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [director]);

  useFrame((state, delta) => {
    if (director) {
      director.update(delta);
    }
  });

  return null;
}

function GlobalViewManager() {
  const controlsRef = useRef();
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 6, 36);
    camera.lookAt(0, 0, 0);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [camera]);

  return (
    <>
      <RadarSweep3D />

      {/* ── Operational Theater: Antarctica tilted up facing the eye-level camera ── */}
      <group rotation={[-Math.PI * 0.58, 0.15, -Math.PI * 0.05]}>
        <EarthGlobe3D />
        <Stations3D />
        <RoutePathways3D />
        <IcebergMarkers3D />
        <VesselMarker3D />
        <TacticalReticles />
        <ScenarioVisuals3D />
      </group>

      {/* ── Precision Global Camera Navigation: 360° Free Mouse Drag Rotation ── */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableRotate={true}
        rotateSpeed={0.8}
        enableZoom={true}
        zoomSpeed={1.0}
        enablePan={false}
        enableDamping={true}
        dampingFactor={0.06}
        minDistance={0.8}
        maxDistance={90.0}
      />

      <CameraController controlsRef={controlsRef} />
    </>
  );
}

export default function AntarcticScene() {
  const { vesselViewActive } = useOptics();

  return (
    <div className="canvas-hero-wrapper">
      <Canvas
        camera={{
          position: [0, 6, 36],
          fov: 38,
          near: 0.1,
          far: 350,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.25]}
      >
        {/* Soft cold polar ambient lighting */}
        <ambientLight intensity={0.85} color="#f0f9ff" />
        <directionalLight
          position={[25, 20, 35]}
          intensity={1.2}
          color="#f0f7fe"
        />
        <directionalLight
          position={[-25, -15, 20]}
          intensity={0.45}
          color="#bae6fd"
        />

        {/* ── DEDICATED CONDITIONAL 3D THEATER ── */}
        {vesselViewActive ? (
          /* True 3rd-Person Polar Vessel Navigation View */
          <VesselNavigationTheater3D />
        ) : (
          /* Strategic 3D Earth Globe Overview */
          <GlobalViewManager />
        )}

        <PolarOptics />
      </Canvas>
    </div>
  );
}

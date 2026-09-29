import React, { useMemo, memo } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS } from '../../utils/polarProjection';
import { useTelemetry } from '../../context/TelemetryContext';

function EarthGlobe3D() {
  const { layers } = useTelemetry();

  // Load authentic NASA Blue Marble Earth texture from local public folder
  const earthTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/earth-blue-marble.jpg');
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, []);

  return (
    <group>
      {/* ── Real Planet Earth Sphere with Blue Marble Imagery ── */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS, 48, 48]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* ── Geographic Sea-Ice Concentration Overlay (when enabled) ── */}
      {layers?.seaIce && (
        <mesh>
          <sphereGeometry args={[EARTH_RADIUS + 0.04, 48, 48]} />
          <meshBasicMaterial
            color="#bae6fd"
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* ── Soft Antarctic Atmospheric Halo ── */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS + 0.35, 36, 36]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

export default memo(EarthGlobe3D);

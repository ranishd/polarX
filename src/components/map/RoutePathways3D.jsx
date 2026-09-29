import React, { useMemo, useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { useTelemetry } from '../../context/TelemetryContext';
import { latLonToVector3, getGreatCircleArc, EARTH_RADIUS } from '../../utils/polarProjection';

function RoutePathways3D() {
  const { routes, layers } = useTelemetry();
  const photonCount = 5;
  const photonMeshes = useRef([]);

  // Compute smooth spherical arcs for each route along the Earth surface
  const routeCurves = useMemo(() => {
    if (!routes || routes.length === 0) return [];

    return routes.map((route) => {
      const waypoints = route.waypoints || [];
      if (waypoints.length < 2) return null;

      const fullArc = [];
      const altitude = route.status === 'APPROVED' ? 0.12 : 0.06;

      for (let i = 0; i < waypoints.length - 1; i++) {
        const p1 = latLonToVector3(waypoints[i].lat, waypoints[i].lon, EARTH_RADIUS);
        const p2 = latLonToVector3(waypoints[i + 1].lat, waypoints[i + 1].lon, EARTH_RADIUS);
        const arc = getGreatCircleArc(p1, p2, 20, altitude);
        if (i > 0) arc.shift();
        fullArc.push(...arc);
      }

      return {
        id: route.id,
        status: route.status,
        color: (route.status === 'APPROVED' || route.status === 'RECOMMENDED') ? '#0284c7' : route.status === 'BLOCKED' ? '#475569' : '#0369a1',
        points: fullArc,
        curve: new THREE.CatmullRomCurve3(fullArc),
      };
    }).filter(Boolean);
  }, [routes]);

  // Curve for recommended Route Bravo
  const bravoCurve = useMemo(() => {
    return routeCurves.find((r) => r.status === 'APPROVED' || r.status === 'RECOMMENDED')?.curve || null;
  }, [routeCurves]);

  useFrame(({ clock }) => {
    if (!bravoCurve) return;
    const time = clock.getElapsedTime() * 0.12;

    photonMeshes.current.forEach((mesh, index) => {
      if (!mesh) return;
      const progress = (time + index / photonCount) % 1;
      const point = bravoCurve.getPointAt(progress);
      mesh.position.copy(point);
    });
  });

  if (!layers?.routes || routeCurves.length === 0) return null;

  return (
    <group>
      {routeCurves.map((r) => {
        const isApproved = r.status === 'APPROVED' || r.status === 'RECOMMENDED';
        const isBlocked = r.status === 'BLOCKED';

        return (
          <group key={r.id}>
            {/* ── Route Arc Line ── */}
            <Line
              points={r.points}
              color={r.color}
              lineWidth={isApproved ? 3.5 : isBlocked ? 2.0 : 1.5}
              transparent
              opacity={isApproved ? 0.95 : isBlocked ? 0.75 : 0.4}
              dashed={isBlocked}
              dashSize={0.4}
              gapSize={0.25}
            />
          </group>
        );
      })}

      {/* ── Directional Flow Photons (Moving toward destination) ── */}
      {bravoCurve && (
        <group>
          {Array.from({ length: photonCount }).map((_, idx) => (
            <mesh
              key={idx}
              ref={(el) => (photonMeshes.current[idx] = el)}
            >
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

export default memo(RoutePathways3D);

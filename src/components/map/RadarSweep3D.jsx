import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTelemetry } from '../../context/TelemetryContext';
import { latLonToVector3, EARTH_RADIUS } from '../../utils/polarProjection';

const radarVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const radarFragmentShader = `
  uniform float time;
  varying vec2 vUv;
  
  void main() {
    // Center at 0.5, 0.5
    vec2 center = vec2(0.5, 0.5);
    vec2 pos = vUv - center;
    float dist = length(pos);
    
    // Circular bounds
    if (dist > 0.5) discard;
    
    // Angle in range [0, 2PI]
    float angle = atan(pos.y, pos.x);
    if (angle < 0.0) angle += 2.0 * 3.14159265;
    
    // Sweep beam rotation (2.5 seconds per revolution)
    float sweepSpeed = 2.0 * 3.14159265 / 2.5;
    float currentAngle = mod(time * sweepSpeed, 2.0 * 3.14159265);
    
    // Angle difference behind the sweep beam
    float angleDiff = currentAngle - angle;
    if (angleDiff < 0.0) angleDiff += 2.0 * 3.14159265;
    
    // Phosphor decay effect (exponential fade)
    float intensity = exp(-angleDiff * 2.0);
    
    // Beam leading edge bright line
    float beamEdge = smoothstep(0.0, 0.05, angleDiff) * smoothstep(0.1, 0.0, angleDiff);
    intensity = max(intensity, beamEdge * 2.0);
    
    // Range rings
    float ring1 = smoothstep(0.16, 0.165, dist) - smoothstep(0.165, 0.17, dist); // ~1/3
    float ring2 = smoothstep(0.32, 0.325, dist) - smoothstep(0.325, 0.33, dist); // ~2/3
    float ring3 = smoothstep(0.49, 0.495, dist) - smoothstep(0.495, 0.5, dist);  // Outer
    
    float ringIntensity = max(ring1, max(ring2, ring3)) * 0.3;
    
    // Colors: cyan (#22d3ee) fading to deep navy (#0c4a6e)
    vec3 cyan = vec3(0.133, 0.827, 0.933);
    vec3 navy = vec3(0.047, 0.29, 0.431);
    
    vec3 finalColor = mix(navy, cyan, intensity) + (cyan * ringIntensity);
    
    // Base transparency that decays behind the beam + rings
    float alpha = max(intensity * 0.8, ringIntensity * 0.5);
    alpha *= smoothstep(0.5, 0.49, dist); // Soft edge
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export default function RadarSweep3D() {
  const { vessel, icebergs, layers } = useTelemetry();
  const materialRef = useRef();
  const groupRef = useRef();
  
  const groupRotation = useMemo(() => new THREE.Euler(-Math.PI * 0.58, 0.15, -Math.PI * 0.05), []);
  const groupMatrix = useMemo(() => new THREE.Matrix4().makeRotationFromEuler(groupRotation), [groupRotation]);
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  if (!layers.radarCone || !vessel) return null;

  // Calculate vessel world position and normal
  const vesselLocalPos = latLonToVector3(vessel.position.lat, vessel.position.lon, EARTH_RADIUS + 0.05); // slight offset above surface
  const vesselWorldPos = vesselLocalPos.clone().applyMatrix4(groupMatrix);
  const normal = vesselWorldPos.clone().normalize();
  
  // Create rotation matrix to align flat circle with sphere tangent
  const up = new THREE.Vector3(0, 0, 1); // CircleGeometry default normal is Z
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
  const euler = new THREE.Euler().setFromQuaternion(quaternion);

  const radarRadius = 1.5;

  return (
    <group ref={groupRef}>
      {/* Radar Sweep Disc */}
      <mesh position={vesselWorldPos} rotation={euler}>
        <circleGeometry args={[radarRadius, 64]} />
        <shaderMaterial
          ref={materialRef}
          transparent={true}
          depthWrite={false}
          uniforms={{ time: { value: 0 } }}
          vertexShader={radarVertexShader}
          fragmentShader={radarFragmentShader}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Contact Blips */}
      {icebergs.map((iceberg, i) => {
        const iceLocal = latLonToVector3(iceberg.position.lat, iceberg.position.lon, EARTH_RADIUS + 0.06);
        const iceWorld = iceLocal.applyMatrix4(groupMatrix);
        
        // Check if within radar range (approximate distance in 3D)
        const dist = vesselWorldPos.distanceTo(iceWorld);
        if (dist > radarRadius) return null;

        return (
          <mesh key={iceberg.id || i} position={iceWorld}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#22d3ee" transparent opacity={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

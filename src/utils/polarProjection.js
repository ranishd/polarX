import * as THREE from 'three';

export const EARTH_RADIUS = 14;

/**
 * Maps latitude and longitude to 3D Cartesian coordinates on a sphere of given radius.
 * Matches Three.js standard SphereGeometry UV parameterization.
 * 
 * @param {number} lat - Latitude in degrees [-90, 90]
 * @param {number} lon - Longitude in degrees [-180, 180]
 * @param {number} radius - Sphere radius (default EARTH_RADIUS)
 * @returns {THREE.Vector3}
 */
export function latLonToVector3(lat, lon, radius = EARTH_RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Returns [x, y, z] array for convenience
 */
export function latLonTo3D(lat, lon, radius = EARTH_RADIUS) {
  const v = latLonToVector3(lat, lon, radius);
  return [v.x, v.y, v.z];
}

/**
 * Computes great circle arc interpolation between two spherical points.
 * 
 * @param {THREE.Vector3} p1 - Start point
 * @param {THREE.Vector3} p2 - End point
 * @param {number} segments - Number of segments along arc
 * @param {number} altitudeOffset - Height above base radius
 * @returns {THREE.Vector3[]}
 */
export function getGreatCircleArc(p1, p2, segments = 32, altitudeOffset = 0.12) {
  const points = [];
  const v1 = p1.clone().normalize();
  const v2 = p2.clone().normalize();
  const targetRadius = EARTH_RADIUS + altitudeOffset;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // Slerp along unit sphere
    const pt = new THREE.Vector3().lerpVectors(v1, v2, t).normalize().multiplyScalar(targetRadius);
    points.push(pt);
  }
  return points;
}

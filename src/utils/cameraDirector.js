import * as THREE from 'three';
import { latLonToVector3, EARTH_RADIUS } from './polarProjection';

export class CameraDirector {
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;
    this.animation = null;
    this.progress = 0;
    this.duration = 1;
    this.isAnimating = false;

    this.groupRotation = new THREE.Euler(-Math.PI * 0.58, 0.15, -Math.PI * 0.05);
    this.groupMatrix = new THREE.Matrix4().makeRotationFromEuler(this.groupRotation);

    this.curve = null;
    this.startPos = new THREE.Vector3();
    this.startTarget = new THREE.Vector3();
    this.endPos = new THREE.Vector3();
    this.endTarget = new THREE.Vector3();
    
    // Orbital parameters
    this.orbitalCenter = new THREE.Vector3();
    this.orbitRadius = 3.5;
    this.orbitHeight = 1.6;
    this.orbitSpeed = (Math.PI * 2) / 14; // 360 degrees in 14 seconds
  }

  // Get world position from lat/lon applying the group rotation
  getWorldPosition(lat, lon, radiusOffset = 0) {
    const localPos = latLonToVector3(lat, lon, EARTH_RADIUS + radiusOffset);
    return localPos.applyMatrix4(this.groupMatrix);
  }

  startAnimation(type, data) {
    if (!this.controls) return;
    this.controls.enabled = false;
    this.isAnimating = true;
    this.progress = 0;
    this.animation = type;
    this.startPos.copy(this.camera.position);
    this.startTarget.copy(this.controls.target);

    if (type === 'chase' && data?.vessel) {
      this.duration = 2.0; 
      const vPos = this.getWorldPosition(data.vessel.position.lat, data.vessel.position.lon);
      const headingRad = ((data.vessel.heading || 0) * Math.PI) / 180;
      const normal = vPos.clone().normalize();
      
      const up = new THREE.Vector3(0, 1, 0);
      let right = new THREE.Vector3().crossVectors(normal, up).normalize();
      if (right.lengthSq() < 0.001) right = new THREE.Vector3(1, 0, 0);
      const forward = new THREE.Vector3().crossVectors(right, normal).normalize();
      
      // Rotate forward vector by vessel heading
      forward.applyAxisAngle(normal, -headingRad);
      
      // Position camera right behind the vessel bridge
      this.endPos = vPos.clone()
        .add(normal.clone().multiplyScalar(0.85))
        .sub(forward.clone().multiplyScalar(2.2));
        
      // Look forward over the vessel bow into the ice corridor
      this.endTarget = vPos.clone()
        .add(forward.clone().multiplyScalar(5.5))
        .add(normal.clone().multiplyScalar(0.2));
    } 
    else if (type === 'route' && data?.routes) {
      this.duration = 7.0;
      const routeBravo = data.routes.find(r => r.status === 'RECOMMENDED' || r.status === 'APPROVED') || data.routes[1];
      if (routeBravo && routeBravo.waypoints) {
        const points = routeBravo.waypoints.map(wp => this.getWorldPosition(wp.lat, wp.lon, 1.2));
        this.curve = new THREE.CatmullRomCurve3(points);
      } else {
        this.cancel();
      }
    }
    else if (type === 'orbital' && data?.icebergs && data.icebergs.length > 0) {
      this.duration = 10;
      const iceberg = data.icebergs[0]; // A-23A
      this.orbitalCenter = this.getWorldPosition(iceberg.position.lat, iceberg.position.lon);
      this.orbitRadius = 3.2;
      this.orbitHeight = 1.5;
      this.endTarget.copy(this.orbitalCenter);
    }
    else if (type === 'reset') {
      this.duration = 1.5;
      this.endPos = new THREE.Vector3(0, 6, 36);
      this.endTarget = new THREE.Vector3(0, 0, 0);
    }
  }

  update(delta) {
    if (!this.isAnimating || !this.animation) return;

    this.progress += delta / this.duration;
    const t = Math.min(this.progress, 1);
    
    // Smooth cubic easing
    const easeT = t * t * (3 - 2 * t);

    if (this.animation === 'chase' || this.animation === 'reset') {
      this.camera.position.lerpVectors(this.startPos, this.endPos, easeT);
      const currentTarget = new THREE.Vector3().lerpVectors(this.startTarget, this.endTarget, easeT);
      this.camera.lookAt(currentTarget);
      this.controls.target.copy(currentTarget);
      
      if (this.progress >= 1) {
        this.camera.position.copy(this.endPos);
        this.camera.lookAt(this.endTarget);
        this.controls.target.copy(this.endTarget);
        if (this.animation === 'chase') {
          this.controls.minDistance = 0.5;
          this.controls.maxDistance = 25.0;
        } else {
          this.controls.target.set(0, 0, 0);
          this.controls.minDistance = 1.0;
          this.controls.maxDistance = 90.0;
        }
        this.cancel();
      }
    } 
    else if (this.animation === 'route' && this.curve) {
      if (this.progress >= 1) {
        this.cancel();
        return;
      }
      const camPos = this.curve.getPoint(easeT);
      this.camera.position.copy(camPos);
      
      const lookAheadT = Math.min(easeT + 0.08, 1);
      const lookPos = this.curve.getPoint(lookAheadT);
      this.camera.lookAt(lookPos);
      this.controls.target.copy(lookPos);
    }
    else if (this.animation === 'orbital') {
      const orbitProgress = this.progress; 
      const angle = orbitProgress * this.duration * this.orbitSpeed;
      const normal = this.orbitalCenter.clone().normalize();
      
      const up = new THREE.Vector3(0, 1, 0);
      let right = new THREE.Vector3().crossVectors(normal, up).normalize();
      if (right.lengthSq() < 0.001) right = new THREE.Vector3(1, 0, 0);
      const forward = new THREE.Vector3().crossVectors(right, normal).normalize();
      
      const orbitOffset = right.clone().multiplyScalar(Math.cos(angle) * this.orbitRadius)
        .add(forward.clone().multiplyScalar(Math.sin(angle) * this.orbitRadius));
        
      const targetCamPos = this.orbitalCenter.clone()
        .add(normal.clone().multiplyScalar(this.orbitHeight))
        .add(orbitOffset);
        
      if (this.progress < 1) {
        this.camera.position.lerpVectors(this.startPos, targetCamPos, easeT);
        const currentTarget = new THREE.Vector3().lerpVectors(this.startTarget, this.orbitalCenter, easeT);
        this.camera.lookAt(currentTarget);
        this.controls.target.copy(currentTarget);
      } else {
        this.camera.position.copy(targetCamPos);
        this.camera.lookAt(this.orbitalCenter);
        this.controls.target.copy(this.orbitalCenter);
      }
    }
  }

  cancel() {
    this.isAnimating = false;
    this.animation = null;
    if (this.controls) {
      this.controls.enabled = true;
    }
  }
}

import * as THREE from 'three';

export const ThermalShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2() },
    time: { value: 0.0 },
    intensity: { value: 1.0 },
    sensitivity: { value: 0.75 },
    bloom: { value: 0.65 },
    mode: { value: 0.0 },
    pixelation: { value: 1.5 },
    palette: { value: 1.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float time;
    uniform float intensity;
    uniform float sensitivity;
    uniform float bloom;
    uniform float mode;
    uniform float pixelation;
    uniform float palette;

    varying vec2 vUv;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    vec3 getCryoThermalColor(float t) {
      vec3 c = vec3(0.0);
      t = clamp(t, 0.0, 1.0);
      
      // Strict Color Theory: sub-zero cryo gradient (Midnight Ocean -> Deep Navy -> Arctic Azure -> Ice White)
      if (t < 0.25) {
        c = mix(vec3(0.015, 0.05, 0.10), vec3(0.05, 0.18, 0.32), t * 4.0);
      } else if (t < 0.6) {
        c = mix(vec3(0.05, 0.18, 0.32), vec3(0.15, 0.52, 0.78), (t - 0.25) / 0.35);
      } else if (t < 0.85) {
        c = mix(vec3(0.15, 0.52, 0.78), vec3(0.56, 0.84, 0.98), (t - 0.6) / 0.25);
      } else {
        c = mix(vec3(0.56, 0.84, 0.98), vec3(0.96, 0.98, 1.0), (t - 0.85) / 0.15);
      }
      return c;
    }

    void main() {
      vec2 uv = vUv;
      
      if (pixelation > 0.0) {
        vec2 gridSize = resolution / pixelation;
        uv = floor(uv * gridSize) / gridSize;
      }
      
      vec4 texColor = texture2D(tDiffuse, uv);
      
      float lum = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
      
      float heat = lum * sensitivity;
      
      if (lum > 0.8) {
        heat += bloom * (lum - 0.8);
      }
      
      if (mode > 0.5) {
        heat = 1.0 - heat;
      }
      
      vec3 finalColor;
      if (palette > 0.5) {
        finalColor = getCryoThermalColor(heat);
      } else {
        finalColor = vec3(heat);
      }
      
      finalColor += random(uv + time) * 0.05;
      
      vec2 p = uv * 2.0 - 1.0;
      float dist = length(p);
      finalColor *= smoothstep(1.5, 0.5, dist);
      
      gl_FragColor = mix(texColor, vec4(finalColor, 1.0), intensity);
    }
  `
};

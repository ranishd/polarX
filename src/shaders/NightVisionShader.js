import * as THREE from 'three';

export const NightVisionShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2() },
    time: { value: 0.0 },
    intensity: { value: 1.0 },
    gain: { value: 0.55 },
    bloom: { value: 0.3 },
    scanlineStr: { value: 1.0 },
    pixelation: { value: 2.5 }
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
    uniform float gain;
    uniform float bloom;
    uniform float scanlineStr;

    varying vec2 vUv;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv - 0.5;
      float r = length(uv);
      uv = uv * (1.0 + 0.2 * r * r);
      uv += 0.5;
      
      vec4 texColor = texture2D(tDiffuse, vUv);
      
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = mix(texColor, vec4(0.0, 0.0, 0.0, 1.0), intensity);
        return;
      }
      
      vec4 distTexColor = texture2D(tDiffuse, uv);
      float lum = dot(distTexColor.rgb, vec3(0.299, 0.587, 0.114));
      
      // Modern Polar Naval NVG (White/Cyan Phosphor intensifier - no AI neon green)
      vec3 phosphorColor = vec3(0.32, 0.78, 0.98);
      vec3 nvgColor = phosphorColor * (lum * gain * 2.0);
      
      if (lum > 0.7) {
        nvgColor += phosphorColor * bloom * (lum - 0.7);
      }
      
      nvgColor += random(uv * 100.0 + time) * 0.15;
      
      float scanline = sin(uv.y * resolution.y * 3.14159) * 0.04 * scanlineStr;
      nvgColor -= scanline;
      
      vec2 p = uv * 2.0 - 1.0;
      float dist = length(p);
      nvgColor *= smoothstep(1.0, 0.7, dist);
      
      gl_FragColor = mix(texColor, vec4(nvgColor, 1.0), intensity);
    }
  `
};

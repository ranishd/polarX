import * as THREE from 'three';

export const SARRadarShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2() },
    time: { value: 0.0 },
    intensity: { value: 1.0 },
    speckle: { value: 0.6 },
    edgeEnhance: { value: 0.5 }
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
    uniform float speckle;
    uniform float edgeEnhance;

    varying vec2 vUv;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv;
      
      vec4 texColor = texture2D(tDiffuse, uv);
      
      vec2 dx = vec2(1.0 / resolution.x, 0.0);
      vec2 dy = vec2(0.0, 1.0 / resolution.y);
      float lum = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
      
      float lumL = dot(texture2D(tDiffuse, uv - dx).rgb, vec3(0.299, 0.587, 0.114));
      float lumR = dot(texture2D(tDiffuse, uv + dx).rgb, vec3(0.299, 0.587, 0.114));
      float lumT = dot(texture2D(tDiffuse, uv + dy).rgb, vec3(0.299, 0.587, 0.114));
      float lumB = dot(texture2D(tDiffuse, uv - dy).rgb, vec3(0.299, 0.587, 0.114));
      
      float edge = abs(lumL - lumR) + abs(lumT - lumB);
      
      float sarVal = lum + edge * edgeEnhance;
      
      float noise = random(uv * 50.0 + time) * 2.0 - 1.0;
      sarVal += noise * speckle * sarVal; 
      
      vec3 water = vec3(0.012, 0.075, 0.149);
      vec3 ice = vec3(0.404, 0.910, 0.976);
      
      vec3 finalColor = mix(water, ice, clamp(sarVal, 0.0, 1.0));
      
      float lines = sin(uv.x * resolution.x * 0.1) * 0.02;
      finalColor -= lines;
      
      gl_FragColor = mix(texColor, vec4(finalColor, 1.0), intensity);
    }
  `
};

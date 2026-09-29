import { useEffect, useRef, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import * as THREE from 'three';

import { ThermalShader } from '../../shaders/ThermalShader';
import { NightVisionShader } from '../../shaders/NightVisionShader';
import { SARRadarShader } from '../../shaders/SARRadarShader';
import { useOptics } from '../../context/OpticsContext';

export function PolarOptics() {
  const { mode } = useOptics();
  const { gl, scene, camera, size } = useThree();
  
  const composer = useRef();
  const passRef = useRef();
  
  const shaders = useMemo(() => ({
    thermal: new ShaderPass(ThermalShader),
    nvg: new ShaderPass(NightVisionShader),
    sar: new ShaderPass(SARRadarShader)
  }), []);

  useEffect(() => {
    composer.current = new EffectComposer(gl);
    const renderPass = new RenderPass(scene, camera);
    composer.current.addPass(renderPass);

    const safeDpr = Math.min(window.devicePixelRatio || 1, 1.25);
    composer.current.setPixelRatio(safeDpr);
    composer.current.setSize(size.width, size.height);
    
    Object.values(shaders).forEach(pass => {
      if (pass.uniforms.resolution) {
        pass.uniforms.resolution.value.set(size.width, size.height);
      }
    });

    return () => {
      composer.current = null;
    };
  }, [gl, scene, camera]);

  useEffect(() => {
    if (!composer.current) return;
    
    const safeDpr = Math.min(window.devicePixelRatio || 1, 1.25);
    composer.current.setPixelRatio(safeDpr);
    composer.current.setSize(size.width, size.height);
    Object.values(shaders).forEach(pass => {
      if (pass.uniforms.resolution) {
        pass.uniforms.resolution.value.set(size.width, size.height);
      }
    });
  }, [size, shaders, gl]);

  const targetIntensity = useRef(0);
  const currentMode = useRef('optical');

  useEffect(() => {
    if (!composer.current) return;
    
    if (passRef.current && composer.current.passes.includes(passRef.current)) {
      if (mode === 'optical') {
        targetIntensity.current = 0;
      } else if (currentMode.current !== mode) {
        composer.current.removePass(passRef.current);
        passRef.current = shaders[mode];
        passRef.current.uniforms.intensity.value = 0;
        composer.current.addPass(passRef.current);
        targetIntensity.current = 1;
      }
    } else {
      if (mode !== 'optical') {
        passRef.current = shaders[mode];
        passRef.current.uniforms.intensity.value = 0;
        composer.current.addPass(passRef.current);
        targetIntensity.current = 1;
      }
    }
    
    currentMode.current = mode;
  }, [mode, shaders]);

  useFrame((state, delta) => {
    if (!composer.current) return;

    if (passRef.current) {
      const uIntensity = passRef.current.uniforms.intensity;
      if (uIntensity) {
        uIntensity.value = THREE.MathUtils.lerp(uIntensity.value, targetIntensity.current, delta * 5);
        
        if (targetIntensity.current === 0 && uIntensity.value < 0.01) {
          composer.current.removePass(passRef.current);
          passRef.current = null;
        }
      }
      
      if (passRef.current && passRef.current.uniforms.time) {
        passRef.current.uniforms.time.value = state.clock.elapsedTime;
      }
    }

    if (passRef.current) {
      composer.current.render();
    } else {
      gl.render(scene, camera);
    }
  }, 1);

  return null;
}

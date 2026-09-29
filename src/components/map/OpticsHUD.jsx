import React, { useEffect, useState } from 'react';
import { useOptics } from '../../context/OpticsContext';
import { Eye, Radio, Thermometer, Moon, Video, Compass, RotateCcw, Camera } from 'lucide-react';

export function OpticsHUD() {
  const { mode, setMode, activeCam, setActiveCam, enterVesselView } = useOptics();

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key === '1') setMode('optical');
      else if (key === '2') setMode('sar');
      else if (key === '3') setMode('thermal');
      else if (key === '4') setMode('nvg');
      else if (key === 'v') {
        enterVesselView();
      }
      else if (key === 'f') {
        setActiveCam('route');
        window.dispatchEvent(new CustomEvent('ice-camera-command', { detail: 'route' }));
      }
      else if (key === 'o') {
        setActiveCam('orbital');
        window.dispatchEvent(new CustomEvent('ice-camera-command', { detail: 'orbital' }));
      }
      else if (key === ' ' || key === 'escape') {
        setActiveCam('reset');
        window.dispatchEvent(new CustomEvent('ice-camera-command', { detail: 'reset' }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setMode, setActiveCam, enterVesselView]);

  const triggerCamera = (camType) => {
    if (camType === 'chase') {
      enterVesselView();
      return;
    }
    setActiveCam(camType);
    window.dispatchEvent(new CustomEvent('ice-camera-command', { detail: camType }));
  };

  const sensorModes = [
    { id: 'optical', key: '1', label: 'Optical Recon', band: 'VIS 380-750nm', icon: Eye },
    { id: 'sar', key: '2', label: 'SAR Radar', band: 'Sentinel-1 C-Band', icon: Radio },
    { id: 'thermal', key: '3', label: 'Cryo-IR', band: 'Sub-Zero 8-14µm', icon: Thermometer },
    { id: 'nvg', key: '4', label: 'Polar NVG', band: 'Gen-3+ Intensifier', icon: Moon },
  ];

  const cameraModes = [
    { id: 'chase', key: 'V', label: 'Bridge Chase', icon: Video },
    { id: 'route', key: 'F', label: 'Corridor Fly', icon: Compass },
    { id: 'orbital', key: 'O', label: 'A-23A Orbit', icon: Camera },
    { id: 'reset', key: 'Space', label: 'Reset View', icon: RotateCcw },
  ];

  return (
    <aside 
      aria-label="Tactical Sensors and Camera HUD"
      className="fixed top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[#edf6fd]/95 backdrop-blur-md border border-sky-200/90 shadow-md text-xs select-none max-w-[95vw] overflow-x-auto"
    >
      {/* ── Sensor Optics Group ── */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
          Optics:
        </span>
        {sensorModes.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              title={`${m.label} (${m.band}) [Press ${m.key}]`}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-sky-700 text-sky-50 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-sky-900 hover:bg-sky-100/70'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-200' : 'text-sky-600'}`} />
              <span className="whitespace-nowrap">{m.label}</span>
              <kbd className={`px-1 py-0.2 rounded text-[9px] font-mono ${
                isActive ? 'bg-sky-800/80 text-sky-100' : 'bg-sky-200/50 text-sky-800'
              }`}>
                {m.key}
              </kbd>
            </button>
          );
        })}
      </div>

      {/* ── Subtle Divider ── */}
      <div className="h-4 w-px bg-slate-300"></div>

      {/* ── Camera Director Presets Group ── */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
          Cam:
        </span>
        {cameraModes.map((c) => {
          const Icon = c.icon;
          const isActive = activeCam === c.id;
          return (
            <button
              key={c.id}
              onClick={() => triggerCamera(c.id)}
              title={`${c.label} [Press ${c.key}]`}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                isActive && c.id !== 'reset'
                  ? 'bg-sky-100 border border-sky-300 text-sky-950 font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-sky-900 hover:bg-sky-100/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-sky-600" />
              <span className="whitespace-nowrap">{c.label}</span>
              <kbd className="px-1 py-0.2 rounded text-[9px] font-mono bg-sky-200/50 text-sky-800">
                {c.key}
              </kbd>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default OpticsHUD;

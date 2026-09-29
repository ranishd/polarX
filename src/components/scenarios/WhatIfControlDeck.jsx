import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import FrostPanel from '../common/FrostPanel';
import { AlertTriangle, Zap, Activity } from 'lucide-react';

const WhatIfControlDeck = () => {
  const { scenario, whatIf, updateWhatIf, triggerScenario } = useTelemetry();

  if (!scenario || !whatIf) return null;

  const handleSliderChange = (key, value) => {
    updateWhatIf(key, parseFloat(value));
  };

  return (
    <div className="absolute bottom-0 left-0 w-[300px] z-40 p-4">
      <FrostPanel className="h-full flex flex-col space-y-4">
        
        {/* SCENARIOS */}
        <div>
          <h2 className="text-[10px] text-amber-500 uppercase tracking-widest font-bold mb-3 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            CRISIS INJECTION
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {scenario.available?.map((s) => {
              const isActive = scenario.active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => triggerScenario(s.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs transition-all duration-200
                    ${isActive 
                      ? 'bg-amber-900/30 border-amber-500/50 text-amber-200 animate-pulse-frost shadow-alert-red' 
                      : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 hover:shadow-cryo-glow'
                    }`}
                >
                  <span className="text-lg mb-1">{s.icon || <Zap className="w-4 h-4"/>}</span>
                  <span className="text-center text-[9px] font-semibold tracking-wide leading-tight">{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full h-px bg-white/10"></div>

        {/* SENSITIVITY ANALYSIS */}
        <div>
          <h2 className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold mb-3 flex items-center">
            <Activity className="w-3 h-3 mr-1" />
            SENSITIVITY ANALYSIS
          </h2>
          <div className="space-y-3">
            
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-300">Berg Velocity</span>
                <span className="text-[10px] font-mono text-cyan-300">{whatIf.icebergVelocityMultiplier?.toFixed(1)}x</span>
              </div>
              <input 
                type="range" min="0.5" max="2.0" step="0.1" 
                value={whatIf.icebergVelocityMultiplier || 1.0} 
                onChange={(e) => handleSliderChange('icebergVelocityMultiplier', e.target.value)}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-frost-500"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-300">Wind Shear</span>
                <span className="text-[10px] font-mono text-cyan-300">{whatIf.windShearMultiplier?.toFixed(1)}x</span>
              </div>
              <input 
                type="range" min="0.5" max="2.0" step="0.1" 
                value={whatIf.windShearMultiplier || 1.0} 
                onChange={(e) => handleSliderChange('windShearMultiplier', e.target.value)}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-frost-500"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-300">Vessel Speed</span>
                <span className="text-[10px] font-mono text-cyan-300">{whatIf.targetVesselSpeed} kts</span>
              </div>
              <input 
                type="range" min="6" max="18" step="1" 
                value={whatIf.targetVesselSpeed || 12} 
                onChange={(e) => handleSliderChange('targetVesselSpeed', e.target.value)}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-frost-500"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-300">Fuel Floor</span>
                <span className="text-[10px] font-mono text-cyan-300">{whatIf.fuelReserveFloor}%</span>
              </div>
              <input 
                type="range" min="10" max="40" step="5" 
                value={whatIf.fuelReserveFloor || 20} 
                onChange={(e) => handleSliderChange('fuelReserveFloor', e.target.value)}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-frost-500"
              />
            </div>

          </div>
        </div>

      </FrostPanel>
    </div>
  );
};

export default WhatIfControlDeck;

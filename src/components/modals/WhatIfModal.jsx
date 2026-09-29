import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { X, Sliders, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function WhatIfModal({ isOpen, onClose }) {
  const { whatIf, updateWhatIf } = useTelemetry();

  if (!isOpen) return null;

  const handleReset = () => {
    updateWhatIf('icebergVelocityMultiplier', 1.0);
    updateWhatIf('windShearMultiplier', 1.0);
    updateWhatIf('targetVesselSpeed', 12.4);
    updateWhatIf('fuelReserveFloor', 25);
  };

  const bergMult = whatIf?.icebergVelocityMultiplier ?? 1.0;
  const windMult = whatIf?.windShearMultiplier ?? 1.0;
  const vesselSpeed = whatIf?.targetVesselSpeed ?? 12.4;
  const fuelFloor = whatIf?.fuelReserveFloor ?? 25;

  const estClearance = (18.4 - (bergMult - 1.0) * 8).toFixed(1);
  const estTransitHours = (62.8 * (12.4 / vesselSpeed)).toFixed(1);
  const estFuelRemain = (41.1 - (windMult - 1.0) * 6).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm select-none p-4">
      <div className="bg-[#f4f9fe] rounded-2xl w-full max-w-lg border border-sky-200/90 p-5 shadow-2xl space-y-4">
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-sky-600" />
            <div>
              <h2 className="font-display font-semibold text-base text-slate-800">
                What-If Sensitivity Analysis
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Adjust environmental variables to observe real-time route re-ranking.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Sliders ── */}
        <div className="space-y-3.5 text-xs">
          {/* Iceberg Speed */}
          <div className="bg-[#edf6fd]/80 p-3 rounded-xl border border-sky-100/70 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-700">Iceberg drift velocity:</span>
              <span className="font-semibold text-sky-800">{bergMult.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={bergMult}
              onChange={(e) => updateWhatIf('icebergVelocityMultiplier', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.5x (Slow drift)</span>
              <span>1.0x (Observed)</span>
              <span>2.0x (Surge)</span>
            </div>
          </div>

          {/* Wind Shear */}
          <div className="bg-[#edf6fd]/80 p-3 rounded-xl border border-sky-100/70 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-700">Katabatic wind multiplier:</span>
              <span className="font-semibold text-sky-800">{windMult.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={windMult}
              onChange={(e) => updateWhatIf('windShearMultiplier', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.5x (Calm)</span>
              <span>1.0x (Observed)</span>
              <span>2.0x (Blizzard)</span>
            </div>
          </div>

          {/* Vessel Speed */}
          <div className="bg-[#edf6fd]/80 p-3 rounded-xl border border-sky-100/70 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-700">Vessel target speed:</span>
              <span className="font-semibold text-sky-800">{vesselSpeed.toFixed(1)} kt</span>
            </div>
            <input
              type="range"
              min="6"
              max="18"
              step="0.5"
              value={vesselSpeed}
              onChange={(e) => updateWhatIf('targetVesselSpeed', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>6 kt (Icebreaking)</span>
              <span>12.4 kt (Cruising)</span>
              <span>18 kt (Flank)</span>
            </div>
          </div>

          {/* Fuel Floor */}
          <div className="bg-[#edf6fd]/80 p-3 rounded-xl border border-sky-100/70 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-700">Minimum fuel reserve floor:</span>
              <span className="font-semibold text-sky-950">{fuelFloor}%</span>
            </div>
            <input
              type="range"
              min="15"
              max="40"
              step="1"
              value={fuelFloor}
              onChange={(e) => updateWhatIf('fuelReserveFloor', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>15% (Tight)</span>
              <span>25% (Polar standard)</span>
              <span>40% (Conservative)</span>
            </div>
          </div>
        </div>

        {/* ── Live Preview Impact ── */}
        <div className="bg-sky-50/80 border border-sky-200 rounded-xl p-3 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-sky-900 font-medium mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
            <span>Dynamic Recomputation Preview</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Projected A-23A clearance:</span>
            <span className={estClearance < 10 ? 'text-sky-950 font-semibold underline decoration-sky-400' : 'text-sky-900 font-semibold'}>
              {estClearance} nm {estClearance < 10 ? '(Breach)' : '(Safe)'}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Estimated transit time:</span>
            <span className="text-slate-800 font-medium">{estTransitHours} hours</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Arrival fuel reserve:</span>
            <span className={estFuelRemain < fuelFloor ? 'text-sky-950 font-semibold underline decoration-sky-400' : 'text-sky-900 font-semibold'}>
              {estFuelRemain}% {estFuelRemain < fuelFloor ? '(Below floor)' : '(Adequate)'}
            </span>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-200 hover:bg-[#edf6fd] text-slate-600 text-xs font-medium transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-[#f0f7fe] text-xs font-medium transition-all shadow-sm"
          >
            Apply to navigation
          </button>
        </div>
      </div>
    </div>
  );
}

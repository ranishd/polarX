import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { X, Play, RefreshCw, AlertCircle } from 'lucide-react';

export default function ScenariosModal({ isOpen, onClose }) {
  const { scenario, triggerScenario } = useTelemetry();

  if (!isOpen) return null;

  const scenariosList = [
    {
      id: 'berg_intercept',
      title: 'Iceberg A-23A trajectory surge',
      description: 'Antarctic Circumpolar Current accelerates A-23A drift to 1.4 kt directly across planned Route Alpha.',
      impact: 'Triggers emergency collision alarm at CPA 1.8 nm.',
    },
    {
      id: 'ice_freeze',
      title: 'Rapid pack-ice expansion',
      description: 'Cold front drops surface temp to -28°C, expanding 70%+ SIC pack ice northwards by 25 nm.',
      impact: 'Closes direct leads; forces re-evaluation of Lindqvist hull resistance.',
    },
    {
      id: 'storm',
      title: 'Katabatic blizzard gale',
      description: 'Katabatic winds cascade off Antarctic Ice Sheet with 52 kt gusts and 5.5 m Hs waves.',
      impact: 'Exceeds Polar Code wave slamming safety threshold.',
    },
    {
      id: 'sensor_loss',
      title: 'SAR satellite data outage',
      description: 'Synthetic Aperture Radar telemetry feed drops; system switches to passive microwave radiometer.',
      impact: 'Widens iceberg trajectory uncertainty envelope by +40%.',
    },
    {
      id: 'low_fuel',
      title: 'Critical fuel floor alert',
      description: 'Auxiliary generator issue causes fuel reserves to drop to 28% (near 25% safety floor).',
      impact: 'Optimizer rejects Route Charlie and re-ranks for minimal ice resistance.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm select-none p-4">
      <div className="bg-[#f4f9fe] rounded-2xl w-full max-w-lg border border-sky-200/90 p-5 shadow-2xl space-y-4">
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-sky-700" />
            <div>
              <h2 className="font-display font-semibold text-base text-slate-800">
                Scenario Simulation
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Inject operational crises to test dynamic route adaptation.
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

        {/* ── List ── */}
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {scenariosList.map((sc) => {
            const isActive = scenario?.active === sc.id;
            return (
              <div
                key={sc.id}
                className={`p-3 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-sky-100/70 border-sky-300 shadow-sm'
                    : 'bg-[#edf6fd]/70 border-sky-100 hover:border-sky-200 hover:bg-[#e6f2fc]/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-xs text-slate-800">
                    {sc.title}
                  </span>
                  {isActive ? (
                    <span className="badge-blocked text-[10px]">Active</span>
                  ) : (
                    <button
                      onClick={() => triggerScenario(sc.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-600 hover:bg-sky-700 text-[#f0f7fe] text-xs font-medium transition-all shadow-sm"
                    >
                      <Play className="w-3 h-3" />
                      <span>Inject</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal mb-1">
                  {sc.description}
                </p>
                <div className="text-[11px] text-sky-700 font-medium">
                  Response: {sc.impact}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <button
            onClick={() => triggerScenario(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-200 hover:bg-[#edf6fd] text-slate-600 text-xs font-medium transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset to nominal</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#edf6fd] hover:bg-[#e2f0fc] text-slate-700 text-xs font-medium transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

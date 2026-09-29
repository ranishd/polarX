import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { Send, Check, ShieldAlert, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';

export default function DecisionIntelligencePanel({ isOpen = true, onToggle }) {
  const { routes } = useTelemetry();
  const [selectedRouteId, setSelectedRouteId] = useState('bravo');
  const [transmitted, setTransmitted] = useState(false);

  const handleTransmit = () => {
    setTransmitted(true);
    setTimeout(() => setTransmitted(false), 4000);
  };

  // 4 Polar Code constraints with live physics values and safety thresholds
  const safetyConstraints = [
    {
      label: 'Iceberg CPA Buffer',
      current: 18.4,
      threshold: 10.0,
      unit: 'nm',
      status: 'Safe',
      margin: '+8.4 nm clearance',
      percent: Math.min(100, (18.4 / 20.0) * 100),
      thresholdPercent: (10.0 / 20.0) * 100,
      description: 'Closest approach buffer to tracked icebergs',
    },
    {
      label: 'Sea-Ice Concentration',
      current: 35,
      threshold: 60,
      unit: '%',
      status: 'Compliant',
      margin: '-25% under ceiling',
      percent: (35 / 100) * 100,
      thresholdPercent: 60,
      description: 'Polar Class PC5 structural hull limit',
    },
    {
      label: 'Arrival Bunker Fuel',
      current: 41.1,
      threshold: 25.0,
      unit: '%',
      status: 'Adequate',
      margin: '+16.1% over floor',
      percent: 41.1,
      thresholdPercent: 25.0,
      description: 'Mandatory emergency fuel reserve at Maitri',
    },
    {
      label: 'Wave Slamming Severity',
      current: 3.2,
      threshold: 6.5,
      unit: 'm Hs',
      status: 'Nominal',
      margin: '-3.3 m sub-critical',
      percent: (3.2 / 8.0) * 100,
      thresholdPercent: (6.5 / 8.0) * 100,
      description: 'Significant wave height threshold for slamming',
    },
  ];

  return (
    <>
      {/* ── Floating Drawer Trigger Tab (When Closed) ── */}
      {!isOpen && (
        <button
          onClick={onToggle}
          title="Open Decision Intelligence Drawer (press ] or click)"
          className="fixed right-3 top-20 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#edf6fd]/95 hover:bg-[#e0f2fe] border border-sky-300 text-sky-950 font-medium shadow-md text-xs transition-all duration-200"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-sky-600" />
          <span>Decision Intelligence</span>
          <span className="w-2 h-2 rounded-full bg-sky-600"></span>
        </button>
      )}

      {/* ── Collapsible Drawer Panel ── */}
      <aside
        className={`fixed right-5 top-16 bottom-12 w-[350px] z-40 polar-panel rounded-2xl flex flex-col p-4 select-none transition-all duration-300 ease-in-out ${
          isOpen
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : 'translate-x-[calc(100%+30px)] opacity-0 pointer-events-none'
        }`}
      >
        {/* ── Fixed Header (Pinned at Top) ── */}
        <div className="flex items-center justify-between border-b border-sky-100 pb-2.5 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
            <span className="font-display font-semibold text-sm text-sky-950">
              Decision Intelligence
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-sky-800 bg-sky-100/80 px-2.5 py-0.5 rounded-full border border-sky-200/80">
              Polar Class PC5
            </span>
            <button
              onClick={onToggle}
              title="Close drawer (press ])"
              className="p-1 rounded-md text-slate-400 hover:text-sky-800 hover:bg-sky-100/80 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      {/* ── Scrollable Body Area (Smooth Top-to-Bottom Scroll) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3.5">
        {/* ── 1. Tactical Hazard Situation (Harmonious Deep Navy Tone) ── */}
        <div className="bg-[#edf6fd] border border-sky-200/80 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-sky-900 text-xs font-semibold">
              <ShieldAlert className="w-3.5 h-3.5 text-sky-700" />
              <span>Conjunction Alert: Iceberg A-23A</span>
            </div>
            <span className="text-[10px] font-mono text-sky-800 bg-sky-100/90 px-1.5 py-0.5 rounded font-medium">
              T+18.4h
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Direct corridor intersects A-23A trajectory cone at CPA <strong>1.8 nm</strong> (below 10.0 nm configured buffer). Tactical reroute recommended.
          </p>
        </div>

        {/* ── 2. Primary Route Recommendation Card ── */}
        <div
          onClick={() => setSelectedRouteId('bravo')}
          className={`cursor-pointer rounded-xl p-3 transition-all border ${
            selectedRouteId === 'bravo'
              ? 'bg-sky-50/90 border-sky-300 shadow-sm'
              : 'bg-[#edf6fd]/70 border-sky-100 hover:bg-[#e4f1fc]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-600"></span>
              <span className="text-xs font-semibold text-sky-950">
                Route Bravo (Recommended)
              </span>
            </div>
            <span className="text-[10px] font-medium text-sky-800 bg-sky-100/90 px-2 py-0.5 rounded-full border border-sky-200/80">
              Optimal Pareto
            </span>
          </div>
          <div className="text-xs text-slate-600 leading-relaxed mb-2 font-normal">
            Arcs west of A-23A through pack-ice lead. Balances fuel burn and safety clearance.
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="bg-[#f8fbfe] p-2 rounded-lg border border-sky-100 flex flex-col">
              <span className="text-[10px] text-slate-400">Ice risk reduction</span>
              <span className="text-sky-900 font-semibold">-61% vs direct</span>
            </div>
            <div className="bg-[#f8fbfe] p-2 rounded-lg border border-sky-100 flex flex-col">
              <span className="text-[10px] text-slate-400">Fuel expenditure</span>
              <span className="text-sky-950 font-semibold">+2.8 MT (+9.8%)</span>
            </div>
          </div>
        </div>

        {/* ── 3. POLAR CODE COMPLIANCE GAUGES (Unified Deep Navy Tone) ── */}
        <div className="border-t border-sky-100/80 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Polar Code Safety Telemetry
            </span>
            <span className="text-[10px] font-medium text-sky-900 bg-sky-100/80 px-2 py-0.5 rounded-full border border-sky-200">
              4/4 Compliant
            </span>
          </div>

          <div className="space-y-2">
            {safetyConstraints.map((c) => (
              <div
                key={c.label}
                className="bg-[#edf6fd]/80 p-2.5 rounded-xl border border-sky-100/80 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{c.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sky-950 font-semibold">
                      {c.current} {c.unit}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      (req {c.threshold} {c.unit})
                    </span>
                  </div>
                </div>

                {/* Unified Deep Navy / Sky Progress Bar */}
                <div className="relative w-full h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-600 transition-all duration-700"
                    style={{ width: `${c.percent}%` }}
                  ></div>
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-sky-950"
                    style={{ left: `${c.thresholdPercent}%` }}
                    title={`Threshold limit: ${c.threshold} ${c.unit}`}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{c.description}</span>
                  <span className="font-medium text-sky-800">{c.margin}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. EVALUATED ALTERNATIVES (Unified Deep Marine & Slate Palette) ── */}
        <div className="border-t border-sky-100/80 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Evaluated Alternatives
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              Click to inspect
            </span>
          </div>

          <div className="space-y-2">
            {/* Route Alpha: Direct Corridor */}
            <div
              onClick={() => setSelectedRouteId('alpha')}
              className={`cursor-pointer rounded-xl p-3 transition-all border ${
                selectedRouteId === 'alpha'
                  ? 'bg-sky-100/60 border-sky-300 shadow-sm'
                  : 'bg-[#edf6fd]/70 border-sky-100/80 hover:bg-[#e4f1fc]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span className="font-medium text-xs text-slate-800">
                    Route Alpha (Direct Corridor)
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded-full border border-slate-300/60">
                  Unviable · Conjunction
                </span>
              </div>

              {/* Conjunction telemetry */}
              <div className="bg-[#f8fbfe] rounded-lg p-2.5 border border-sky-100 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Distance & Transit:</span>
                  <span className="font-mono text-slate-800 font-medium">382 nm · 55.2h</span>
                </div>
                <div className="flex justify-between text-sky-950 font-medium">
                  <span>Iceberg Conjunction:</span>
                  <span className="font-mono">CPA 1.8 nm at T+18.4h</span>
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-sky-100">
                  Breaches 10.0 nm operational buffer (CPA 1.8 nm &lt; 10.0 nm mission limit)
                </div>
              </div>
            </div>

            {/* Route Charlie: Open Ocean Detour */}
            <div
              onClick={() => setSelectedRouteId('charlie')}
              className={`cursor-pointer rounded-xl p-3 transition-all border ${
                selectedRouteId === 'charlie'
                  ? 'bg-sky-100/60 border-sky-300 shadow-sm'
                  : 'bg-[#edf6fd]/70 border-sky-100/80 hover:bg-[#e4f1fc]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span className="font-medium text-xs text-slate-800">
                    Route Charlie (Open Ocean Detour)
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded-full border border-slate-300/60">
                  Unviable · Fuel Deficit
                </span>
              </div>

              {/* Fuel trade-off telemetry */}
              <div className="bg-[#f8fbfe] rounded-lg p-2.5 border border-sky-100 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Ice Pack Contact:</span>
                  <span className="font-mono text-sky-900 font-medium">0% SIC (Clear ocean)</span>
                </div>
                <div className="flex justify-between text-sky-950 font-medium">
                  <span>Fuel Consumption:</span>
                  <span className="font-mono">+42.8 MT bunker penalty</span>
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-sky-100">
                  Arrival reserve 14.2% breaches 25.0% mandatory safety floor
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Fixed Footer Action: Explicit Operator Approval Gate ── */}
      <div className="border-t border-sky-100/80 pt-2.5 mt-3 shrink-0 space-y-2">
        <div className="flex items-center justify-between text-[10px] px-1 text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse"></span>
            <span>Awaiting Operator Authorization</span>
          </span>
          <span className="font-mono text-sky-800">PC5 Compliant</span>
        </div>

        <button
          onClick={handleTransmit}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl font-medium text-xs transition-all shadow-sm ${
            transmitted
              ? 'bg-sky-700 text-[#f0f7fe]'
              : 'bg-sky-600 hover:bg-sky-700 text-[#f0f7fe] active:scale-[0.99]'
          }`}
        >
          {transmitted ? (
            <>
              <Check className="w-4 h-4" />
              <span>Waypoints authorized & transmitted</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Authorize & Transmit Route Bravo</span>
            </>
          )}
        </button>
      </div>
    </aside>
  </>
  );
}

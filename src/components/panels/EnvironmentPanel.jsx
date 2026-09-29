import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { Layers, Info, ChevronLeft, ChevronRight } from 'lucide-react';

export default function EnvironmentPanel({ isOpen = true, onToggle }) {
  const { layers, toggleLayer } = useTelemetry();

  const layerItems = [
    { id: 'seaIce', label: 'Sea ice concentration' },
    { id: 'icebergs', label: 'Tracked icebergs' },
    { id: 'routes', label: 'Navigation routes' },
    { id: 'radarCone', label: 'Vessel radar arc' },
    { id: 'weather', label: 'Weather overlay' },
    { id: 'currents', label: 'Ocean currents' },
  ];

  return (
    <>
      {/* ── Floating Drawer Trigger Tab (When Closed) ── */}
      {!isOpen && (
        <button
          onClick={onToggle}
          title="Open Environment Drawer (press [ or click)"
          className="fixed left-3 top-20 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#edf6fd]/95 hover:bg-[#e0f2fe] border border-sky-300 text-sky-950 font-medium shadow-md text-xs transition-all duration-200"
        >
          <Layers className="w-3.5 h-3.5 text-sky-700" />
          <span>Environment</span>
          <ChevronRight className="w-3.5 h-3.5 text-sky-600" />
        </button>
      )}

      {/* ── Collapsible Drawer Panel ── */}
      <aside
        className={`fixed left-5 top-16 bottom-12 w-[270px] z-40 polar-panel rounded-2xl flex flex-col p-4 select-none transition-all duration-300 ease-in-out ${
          isOpen
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : '-translate-x-[calc(100%+30px)] opacity-0 pointer-events-none'
        }`}
      >
        {/* ── Fixed Header ── */}
        <div className="flex items-center justify-between border-b border-sky-100 pb-2.5 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-700" />
            <span className="font-display font-semibold text-sm text-sky-950">
              Environment
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-full border border-sky-200/80 font-medium">
              Antarctica
            </span>
            <button
              onClick={onToggle}
              title="Close drawer (press [)"
              className="p-1 rounded-md text-slate-400 hover:text-sky-800 hover:bg-sky-100/80 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

      {/* ── Scrollable Body Area ── */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
        {/* ── Data Layers Toggles ── */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Data Layers
          </div>
          <div className="space-y-1">
            {layerItems.map(({ id, label }) => {
              const active = layers?.[id] ?? false;
              return (
                <button
                  key={id}
                  onClick={() => toggleLayer(id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all border ${
                    active
                      ? 'bg-sky-100/70 border-sky-200 text-sky-950 font-medium'
                      : 'bg-[#edf6fd]/60 border-transparent text-slate-600 hover:bg-[#e2f0fc]/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        active ? 'bg-sky-600 shadow-[0_0_6px_#0284c7]' : 'bg-slate-300'
                      }`}
                    ></span>
                    <span>{label}</span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    {active ? 'On' : 'Off'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Sea-Ice Concentration Legend ── */}
        <div className="border-t border-sky-100 pt-3">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            <span>Sea-ice concentration</span>
            <span className="text-slate-500 font-normal">0% – 100%</span>
          </div>
          {/* Visual gradient bar */}
          <div className="h-2 w-full rounded-full overflow-hidden bg-slate-100 border border-sky-200/60 flex">
            <div className="w-1/4 h-full bg-[#0369a1]" title="Open water (<15%)"></div>
            <div className="w-1/4 h-full bg-[#38bdf8]" title="Light ice (15-40%)"></div>
            <div className="w-1/4 h-full bg-[#bae6fd]" title="Moderate pack (40-70%)"></div>
            <div className="w-1/4 h-full bg-[#edf6fd]" title="Consolidated pack (>70%)"></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Open water</span>
            <span>Moderate</span>
            <span>Pack ice</span>
          </div>
        </div>

        {/* ── 48h Environmental Outlook ── */}
        <div className="border-t border-sky-100 pt-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            48h Environmental Outlook
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between bg-[#edf6fd]/70 px-2.5 py-1.5 rounded-lg border border-sky-100/60">
              <span className="text-slate-500">Sea ice:</span>
              <span className="text-sky-900 font-medium">+4.2% expansion</span>
            </div>
            <div className="flex justify-between bg-[#edf6fd]/70 px-2.5 py-1.5 rounded-lg border border-sky-100/60">
              <span className="text-slate-500">Wind trend:</span>
              <span className="text-sky-950 font-medium">28 → 38 kt gale</span>
            </div>
            <div className="flex justify-between bg-[#edf6fd]/70 px-2.5 py-1.5 rounded-lg border border-sky-100/60">
              <span className="text-slate-500">Wave state:</span>
              <span className="text-slate-700 font-medium">3.2 → 4.8 m Hs</span>
            </div>
            <div className="flex justify-between bg-[#edf6fd]/70 px-2.5 py-1.5 rounded-lg border border-sky-100/60">
              <span className="text-slate-500">Pressure:</span>
              <span className="text-slate-700 font-medium">982 hPa (falling)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Fixed Footer Provenance ── */}
      <div className="border-t border-sky-100 pt-2.5 mt-3 text-[11px] text-slate-500 space-y-0.5 shrink-0">
        <div className="flex items-center gap-1 font-medium text-slate-700">
          <Info className="w-3.5 h-3.5 text-sky-600" />
          <span>Data Provenance</span>
        </div>
        <div className="text-[10px] text-slate-400">
          NOAA/NSIDC · ECMWF ERA5 · USNIC
        </div>
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>Satellite + Drift Model</span>
          <span className="text-sky-800 font-medium">92% confidence</span>
        </div>
      </div>
    </aside>
  </>
  );
}

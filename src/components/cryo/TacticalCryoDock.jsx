import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import FrostPanel from '../common/FrostPanel';
import { Snowflake, Mountain, Route, CloudSnow, Waves, Layers, Radar } from 'lucide-react';

const TacticalCryoDock = () => {
  const { layers, toggleLayer, seaIce, provenance } = useTelemetry();

  if (!seaIce) return null;

  const toggleConfigs = [
    { id: 'seaIce', label: 'Sea Ice Concentration', icon: Snowflake },
    { id: 'icebergs', label: 'Iceberg Tracking', icon: Mountain },
    { id: 'routes', label: 'Navigation Routes', icon: Route },
    { id: 'weather', label: 'Weather Overlay', icon: CloudSnow },
    { id: 'currents', label: 'Ocean Currents', icon: Waves },
    { id: 'bathymetry', label: 'Bathymetry', icon: Layers },
    { id: 'radarCone', label: 'Radar Cone', icon: Radar },
  ];

  const getBadgeClass = (type) => {
    switch (type) {
      case 'REAL_OBSERVATION': return 'badge-ai';
      case 'REAL_CATALOGUE':  return 'badge-nominal';
      case 'MODEL_OUTPUT':    return 'badge-caution';
      default:                return 'badge-nominal';
    }
  };

  const formatTime = (iso) => {
    if (!iso) return 'N/A';
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' Z';
    } catch { return iso; }
  };

  // Convert provenance object to array of entries
  const provEntries = provenance ? Object.entries(provenance).map(([key, val]) => ({ key, ...val })) : [];

  return (
    <div className="absolute left-0 top-[80px] bottom-[200px] w-[300px] z-40 p-3 overflow-y-auto animate-slide-in-left">
      <FrostPanel title="TACTICAL INTELLIGENCE" className="h-full flex flex-col space-y-5">

        {/* ── LAYER TOGGLES ── */}
        <div>
          <h3 className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-2.5">Active Layers</h3>
          <div className="flex flex-col space-y-1.5">
            {toggleConfigs.map(({ id, label, icon: Icon }) => {
              const active = layers?.[id];
              return (
                <button
                  key={id}
                  onClick={() => toggleLayer(id)}
                  className={`flex items-center p-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                    active
                      ? 'bg-frost-100/80 border-frost-400/50 text-frost-900 shadow-frost'
                      : 'bg-white/20 border-white/30 text-slate-500 hover:bg-white/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 mr-2.5 ${active ? 'text-cryo-teal' : 'text-slate-400'}`} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full h-px bg-slate-200/40"></div>

        {/* ── DATA PROVENANCE ── */}
        <div>
          <h3 className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-2.5">Data Provenance</h3>
          <div className="space-y-2.5">
            {provEntries.map((prov) => {
              const confPercent = Math.round((prov.confidence || 0) * 100);
              return (
                <div key={prov.key} className="bg-white/30 rounded-lg p-2.5 text-xs border border-white/40">
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="font-semibold text-slate-700 text-[11px]">{prov.source}</span>
                    <span className={`text-[9px] ${getBadgeClass(prov.type)}`}>
                      {(prov.type || '').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-slate-500 space-y-0.5 mb-1.5">
                    <div className="flex justify-between">
                      <span>Acquired:</span>
                      <span className="font-mono text-slate-600 text-[10px]">{formatTime(prov.acquired)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resolution:</span>
                      <span className="font-mono text-slate-600 text-[10px]">{prov.resolution}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400">Conf:</span>
                    <div className="flex-1 h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${confPercent > 80 ? 'bg-cryo-green' : confPercent > 50 ? 'bg-cryo-amber' : 'bg-cryo-red'}`}
                        style={{ width: `${confPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-600">{confPercent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full h-px bg-slate-200/40"></div>

        {/* ── SEA ICE SUMMARY ── */}
        <div>
          <h3 className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-2.5">Sea Ice Summary</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/30 p-2 rounded-lg border border-white/40 flex flex-col">
              <span className="text-[9px] text-slate-400 mb-0.5">Ice Extent</span>
              <span className="font-mono font-semibold text-frost-800">{seaIce.iceExtentKm2?.toLocaleString()} km²</span>
            </div>
            <div className="bg-white/30 p-2 rounded-lg border border-white/40 flex flex-col">
              <span className="text-[9px] text-slate-400 mb-0.5">Avg SIC</span>
              <span className="font-mono font-semibold text-frost-800">{seaIce.averageSIC}%</span>
            </div>
            <div className="bg-white/30 p-2 rounded-lg border border-white/40 flex flex-col">
              <span className="text-[9px] text-slate-400 mb-0.5">Forecast Conf.</span>
              <span className="font-mono font-semibold text-frost-800">{seaIce.forecastConfidence}%</span>
            </div>
            <div className="bg-white/30 p-2 rounded-lg border border-white/40 flex flex-col">
              <span className="text-[9px] text-slate-400 mb-0.5">Ice Edge</span>
              <span className="font-mono font-semibold text-frost-800">{seaIce.iceEdgeLatitude}°S</span>
            </div>
          </div>
        </div>

      </FrostPanel>
    </div>
  );
};

export default TacticalCryoDock;

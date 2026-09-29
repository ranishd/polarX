import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';

const MissionControlTray = () => {
  const { routes, vessel } = useTelemetry();

  if (!routes || !Array.isArray(routes) || routes.length === 0) return null;

  return (
    <div className="absolute bottom-0 left-[300px] right-[320px] h-[200px] z-40 p-4 animate-slide-up-fade flex flex-col">
      <div className="frost-panel-solid rounded-2xl w-full h-full flex flex-col p-4 shadow-frost-xl border border-white/10">
        
        <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2 shrink-0">
          <h2 className="text-gradient-ice text-sm font-bold uppercase tracking-widest flex items-center">
            PARETO ROUTE MATRIX
            <span className="text-[10px] text-slate-500 mx-2 lowercase">vs</span>
          </h2>
          {vessel && (
            <div className="text-xs font-mono text-cyan-200 flex items-center bg-white/5 px-3 py-1 rounded-full">
              <span className="text-slate-400 mr-2">ETA DEST:</span>
              {vessel.eta || 'CALCULATING...'}
            </div>
          )}
        </div>

        <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
          {routes.map((route) => {
            const isApproved = route.status === 'APPROVED';
            const isBlocked = route.status === 'BLOCKED';
            
            let statusClass = 'route-caution';
            if (isApproved) statusClass = 'route-approved';
            else if (isBlocked) statusClass = 'route-blocked';

            const cardClasses = `flex flex-col p-3 rounded-xl border bg-black/20 transition-all duration-300 h-full overflow-hidden
              ${isApproved ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)] bg-green-900/10 scale-[1.02]' : ''}
              ${isBlocked ? 'border-red-900/50 opacity-70' : 'border-white/10'}`;

            const getRiskColor = (val) => {
              if (val > 70) return 'text-red-400';
              if (val > 40) return 'text-amber-400';
              return 'text-green-400';
            };

            return (
              <div key={route.id} className={cardClasses}>
                <div className="flex justify-between items-start mb-2 shrink-0">
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${isBlocked ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                      {route.name}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 mt-0.5">{route.type || 'Route'}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase ${statusClass}`}>
                    {route.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs font-mono mb-2 flex-1">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase">Dist</span>
                    <span className="text-slate-300">{route.distanceNm?.toFixed(1)} nm</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase">Transit</span>
                    <span className="text-slate-300">{route.transitHours?.toFixed(1)} hrs</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase">Fuel</span>
                    <span className="text-slate-300">{route.fuelCostMT?.toFixed(1)} MT</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase">Ice Risk</span>
                    <span className={getRiskColor(route.iceExposure)}>{route.iceExposure}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase">Berg Risk</span>
                    <span className={getRiskColor(route.bergRisk)}>{route.bergRisk}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase">Besetment</span>
                    <span className={getRiskColor(route.besetmentProb)}>{route.besetmentProb}%</span>
                  </div>
                </div>

                <div className={`mt-auto text-[10px] p-1.5 rounded bg-black/40 flex items-center justify-center shrink-0 border ${route.safetyGate === 'APPROVED' ? 'border-green-900/50 text-green-400' : 'border-red-900/50 text-red-400'}`}>
                  <span className="truncate">{route.safetyReason || 'GATE STATUS UNKNOWN'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MissionControlTray;

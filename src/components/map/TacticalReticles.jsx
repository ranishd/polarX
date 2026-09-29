import React, { memo, useMemo } from 'react';
import { Html } from '@react-three/drei';
import { useTelemetry } from '../../context/TelemetryContext';
import { useOptics } from '../../context/OpticsContext';
import { latLonToVector3, EARTH_RADIUS } from '../../utils/polarProjection';

function TacticalReticles() {
  const { icebergs, layers } = useTelemetry();
  const { activeCam } = useOptics();

  const icebergPositions = useMemo(() => {
    if (!icebergs) return [];
    return icebergs.map(iceberg => 
      latLonToVector3(iceberg.position.lat, iceberg.position.lon, EARTH_RADIUS + 0.1)
    );
  }, [icebergs]);

  if (!layers?.icebergs || !icebergs || icebergs.length === 0) return null;

  return (
    <group>
      {icebergs.map((iceberg, index) => {
        const localPos = icebergPositions[index] || latLonToVector3(iceberg.position.lat, iceberg.position.lon, EARTH_RADIUS + 0.1);
        const isCriticalThreat = iceberg.id === 'A-23A' || iceberg.threatLevel === 'HIGH';
        const colorClass = isCriticalThreat ? 'text-sky-300' : 'text-slate-300';

        return (
          <group key={iceberg.id || index} position={localPos}>
            <Html center pointerEvents="none" zIndexRange={[50, 0]}>
              <div className={`font-mono text-xs flex flex-col items-center justify-center whitespace-nowrap ${colorClass}`}>
                {/* Minimal Tactical HUD Bracket */}
                <div className={`flex items-center gap-1 font-bold text-[10px] tracking-wider px-2 py-0.5 rounded-sm border shadow-sm ${
                  isCriticalThreat 
                    ? 'bg-slate-900/90 border-sky-600/90 text-sky-200' 
                    : 'bg-slate-900/80 border-slate-700/60 text-slate-300'
                }`}>
                  <span className="opacity-60">[</span>
                  <span>{iceberg.id || 'ICE'}</span>
                  <span className="opacity-60">]</span>
                  {/* Subtle distance pill */}
                  {iceberg.cpaDistance !== undefined && (
                    <span className="ml-1 text-[9px] text-sky-400 font-normal">
                      {iceberg.cpaDistance}nm
                    </span>
                  )}
                </div>
                
                {/* Extended Telemetry Card - ONLY for primary conjunction threat (A-23A) and NOT during Bridge Chase */}
                {isCriticalThreat && activeCam !== 'chase' && (
                  <div className="mt-1 bg-slate-900/95 border border-sky-800/80 p-1.5 rounded-sm text-[10px] leading-tight shadow-md">
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-400">CPA</span>
                      <span className="text-sky-200 font-mono font-semibold">
                        {iceberg.cpaDistance !== undefined ? `${iceberg.cpaDistance} nm` : '8.4 nm'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-400">BRG</span>
                      <span className="text-slate-100 font-mono">
                        {iceberg.bearing || '188°'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 pt-1 border-t border-slate-800">
                      <span className="text-slate-400">DRIFT</span>
                      <svg 
                        width="10" 
                        height="10" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        style={{ transform: `rotate(${iceberg.driftVector?.heading ?? 342}deg)` }}
                        className="text-sky-400"
                      >
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg>
                      <span className="text-slate-100 font-mono">
                        {(iceberg.driftVector?.speedKts ?? 0.8).toFixed(1)} kt
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export default memo(TacticalReticles);

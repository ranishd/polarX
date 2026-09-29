import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { Compass, Anchor, Clock } from 'lucide-react';

export default function BottomStatusBar() {
  const { vessel } = useTelemetry();

  const latStr = `${Math.abs(vessel?.position?.lat || 62.45).toFixed(2)}°S`;
  const lonStr = `${Math.abs(vessel?.position?.lon || 28.30).toFixed(2)}°E`;

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-10 z-40 polar-panel border-t border-sky-100/80 px-6 flex items-center justify-between text-xs text-slate-600 select-none">
      {/* ── Left: Geographic Position ── */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-sky-800 font-medium">
          <Compass className="w-3.5 h-3.5 text-sky-600" />
          <span>Vessel:</span>
          <span>{latStr}, {lonStr}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-slate-500">
          <span>Heading:</span>
          <span className="font-medium text-slate-700">{Math.round(vessel?.heading || 195)}°</span>
        </div>
      </div>

      {/* ── Center: Voyage Progress ── */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <Anchor className="w-3.5 h-3.5 text-sky-700" />
          <span className="text-slate-500">Distance to destination:</span>
          <span className="font-semibold text-sky-950">{vessel?.distanceRemaining || 684} nm</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-sky-600" />
          <span className="text-slate-500">Estimated transit:</span>
          <span className="font-semibold text-sky-950">{vessel?.eta || '2d 14h 22m'}</span>
        </div>
      </div>

      {/* ── Right: Operating Status ── */}
      <div className="hidden md:flex items-center gap-2 text-xs">
        <span className="w-2 h-2 rounded-full bg-sky-600 shadow-[0_0_6px_rgba(2,132,199,0.4)]"></span>
        <span className="text-slate-600 font-medium">
          Autonomous navigation support active
        </span>
      </div>
    </footer>
  );
}

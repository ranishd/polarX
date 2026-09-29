import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useOptics } from '../../context/OpticsContext';
import { Wind, Thermometer, Waves, Gauge, Fuel, Navigation, Sliders } from 'lucide-react';

export default function TopBar({ onOpenWhatIf }) {
  const { vessel, weather, cryoRiskLevel, clock, wsStatus, scenario } = useTelemetry();
  const { enterVesselView, vesselViewActive } = useOptics();

  const isCritical = cryoRiskLevel === 'CRITICAL' || cryoRiskLevel === 'HIGH';
  const isModerate = cryoRiskLevel === 'MODERATE';

  const riskBadgeClass = isCritical
    ? 'badge-blocked'
    : isModerate
    ? 'badge-caution'
    : 'badge-approved';

  const formatTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toTimeString().slice(0, 8) + ' UTC';
    } catch {
      return '22:52:19 UTC';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-50 polar-panel border-b border-sky-100/80 px-5 flex items-center justify-between select-none">
      {/* ── Left: Brand & Target ── */}
      <div className="flex items-center gap-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display font-bold text-lg tracking-tight text-sky-800">
            polarX
          </span>
          <span className="text-xs text-slate-500 font-normal hidden sm:inline">
            Antarctic Navigation Support
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/60 text-xs">
          <span className="text-slate-400 font-normal">Destination:</span>
          <span className="font-medium text-sky-900">
            {vessel?.destination?.name || 'Maitri Station'}
          </span>
        </div>
      </div>

      {/* ── Center: Live Operational Telemetry Strip ── */}
      <div className="hidden md:flex items-center gap-5 px-4 py-1.5 rounded-full bg-[#edf6fd]/90 border border-sky-200/70 shadow-sm text-xs">
        {/* Risk Badge */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Risk:</span>
          <span className={riskBadgeClass}>
            {cryoRiskLevel === 'MODERATE' ? 'Moderate' : cryoRiskLevel || 'Moderate'}
          </span>
        </div>

        <div className="h-3.5 w-px bg-slate-200"></div>

        {/* Wind */}
        <div className="flex items-center gap-1.5 text-slate-600">
          <Wind className="w-3.5 h-3.5 text-sky-600" />
          <span>{Math.round(weather?.windSpeedKts || 28)} kt {weather?.windDirection || 225}°</span>
        </div>

        {/* Temperature */}
        <div className="flex items-center gap-1.5 text-slate-600">
          <Thermometer className="w-3.5 h-3.5 text-sky-600" />
          <span>{weather?.temperature?.toFixed(1) || '-12.5'}°C</span>
        </div>

        {/* Waves */}
        <div className="flex items-center gap-1.5 text-slate-600">
          <Waves className="w-3.5 h-3.5 text-sky-600" />
          <span>{weather?.waveHeight?.toFixed(1) || '3.2'} m</span>
        </div>

        <div className="h-3.5 w-px bg-slate-200"></div>

        {/* Vessel Speed */}
        <div className="flex items-center gap-1.5 text-sky-800 font-medium">
          <Gauge className="w-3.5 h-3.5 text-sky-600" />
          <span>{vessel?.speedKts?.toFixed(1) || '12.4'} kt</span>
        </div>

        {/* Fuel */}
        <div className="flex items-center gap-1.5 text-sky-900 font-semibold">
          <Fuel className="w-3.5 h-3.5 text-sky-700" />
          <span>{vessel?.fuelRemaining?.toFixed(1) || '72.3'}%</span>
        </div>
      </div>

      {/* ── Right: Action Buttons & Clock ── */}
      <div className="flex items-center gap-3">
        {/* Boat Navigation View Button */}
        <button
          onClick={enterVesselView}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            vesselViewActive
              ? 'bg-sky-700 text-sky-50 shadow-sm font-semibold'
              : scenario?.active
              ? 'bg-sky-100 border border-sky-400 text-sky-950 font-semibold shadow-sm'
              : 'bg-[#f0f7fe] border border-sky-200 hover:border-sky-300 hover:bg-sky-50 text-slate-700 shadow-sm'
          }`}
          title="Switch to 3D Boat Navigation Bridge View [V]"
        >
          <Navigation className={`w-3.5 h-3.5 ${vesselViewActive ? 'text-sky-200' : 'text-sky-600'}`} />
          <span>Boat View</span>
          {scenario?.active && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title="Active crisis scenario"></span>
          )}
        </button>

        {/* What-If Button */}
        <button
          onClick={onOpenWhatIf}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#f0f7fe] border border-sky-200 hover:border-sky-300 text-slate-700 shadow-sm transition-all"
        >
          <Sliders className="w-3 h-3 text-sky-600" />
          <span>What-If</span>
        </button>

        <div className="h-4 w-px bg-slate-200"></div>

        {/* 10Hz Feed Indicator */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-sky-600"></span>
          <span className="hidden xl:inline text-[11px]">
            {wsStatus === 'CONNECTED' ? 'Live 10Hz' : 'Offline'}
          </span>
        </div>

        {/* UTC Clock */}
        <div className="text-xs font-mono text-slate-600">
          {formatTime(clock?.utc)}
        </div>
      </div>
    </header>
  );
}

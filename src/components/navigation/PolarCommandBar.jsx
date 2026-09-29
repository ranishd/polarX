import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { Navigation, Wind, Thermometer, Waves, Gauge, Fuel, Radio, Clock } from 'lucide-react';

const PolarCommandBar = () => {
  const { vessel, weather, cryoRiskIndex, cryoRiskLevel, clock, wsStatus, wsLatency } = useTelemetry();

  if (!vessel || !weather) return null;

  // CRI color mapping
  let criColor = '#10b981';
  if (cryoRiskIndex >= 75) criColor = '#ef4444';
  else if (cryoRiskIndex >= 50) criColor = '#f59e0b';
  else if (cryoRiskIndex >= 25) criColor = '#0ea5e9';

  const circumference = 2 * Math.PI * 20;
  const strokeDashoffset = circumference - (cryoRiskIndex / 100) * circumference;

  // Fuel color coding
  let fuelColor = 'text-emerald-600';
  if (vessel.fuelRemaining <= 25) fuelColor = 'text-red-500';
  else if (vessel.fuelRemaining <= 50) fuelColor = 'text-amber-500';

  // Format UTC time
  const formatUTC = (iso) => {
    try {
      const d = new Date(iso);
      return d.toUTCString().slice(17, 25) + ' Z';
    } catch { return '00:00:00 Z'; }
  };

  // Risk level badge class
  const riskBadgeClass = cryoRiskLevel === 'CRITICAL' || cryoRiskLevel === 'HIGH'
    ? 'badge-alert' : cryoRiskLevel === 'MODERATE' ? 'badge-caution' : 'badge-nominal';

  return (
    <div className="frost-panel-solid fixed top-0 left-0 right-0 z-50 flex h-[72px] items-center justify-between px-6 shadow-frost-lg">

      {/* ═══ LEFT: Brand & Destination ═══ */}
      <div className="flex items-center space-x-5 w-1/3">
        <div className="flex items-baseline">
          <span className="text-gradient-ice text-2xl font-black tracking-tight">polarX</span>
          <span className="ml-2.5 text-[10px] tracking-[0.2em] text-slate-400 font-semibold uppercase">
            Polar Navigation Command
          </span>
        </div>
        <div className="flex items-center frost-panel-accent rounded-full px-3 py-1">
          <Navigation className="w-3.5 h-3.5 text-cryo-teal mr-2" />
          <span className="text-xs font-mono text-frost-900 font-medium">{vessel.destination?.name || 'N/A'}</span>
        </div>
      </div>

      {/* ═══ CENTER: CRI Ring Meter ═══ */}
      <div className="flex items-center justify-center w-1/3 gap-4">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" stroke="rgba(14,165,233,0.12)" strokeWidth="3.5" fill="none" />
            <circle
              cx="24" cy="24" r="20"
              stroke={criColor}
              strokeWidth="3.5"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
              style={{ filter: `drop-shadow(0 0 4px ${criColor})` }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-lg font-black font-mono leading-none" style={{ color: criColor }}>
              {Math.round(cryoRiskIndex)}
            </span>
            <span className="text-[8px] text-slate-400 uppercase tracking-[0.2em] font-bold mt-0.5">CRI</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Risk Level</span>
          <span className={`${riskBadgeClass} text-[10px]`}>{cryoRiskLevel}</span>
        </div>
      </div>

      {/* ═══ RIGHT: Telemetry Readouts ═══ */}
      <div className="flex items-center justify-end w-1/3 gap-5">
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center text-slate-400 mb-0.5"><Wind className="w-3 h-3 mr-1" /><span className="text-[9px] uppercase tracking-wider">Wind</span></div>
            <span className="data-readout text-[11px]">{Math.round(weather.windSpeedKts)}KTS {weather.windDirection}°</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center text-slate-400 mb-0.5"><Thermometer className="w-3 h-3 mr-1" /><span className="text-[9px] uppercase tracking-wider">Temp</span></div>
            <span className="data-readout text-[11px]">{weather.temperature.toFixed(1)}°C</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center text-slate-400 mb-0.5"><Waves className="w-3 h-3 mr-1" /><span className="text-[9px] uppercase tracking-wider">Waves</span></div>
            <span className="data-readout text-[11px]">{weather.waveHeight.toFixed(1)}m</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center text-slate-400 mb-0.5"><Gauge className="w-3 h-3 mr-1" /><span className="text-[9px] uppercase tracking-wider">SOG</span></div>
            <span className="data-readout-cyan text-[11px]">{vessel.speedKts.toFixed(1)}KTS</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center text-slate-400 mb-0.5"><Fuel className="w-3 h-3 mr-1" /><span className="text-[9px] uppercase tracking-wider">Fuel</span></div>
            <span className={`data-readout text-[11px] ${fuelColor}`}>{vessel.fuelRemaining.toFixed(1)}%</span>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200/50"></div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5">
            <span className={wsStatus === 'CONNECTED' ? 'led-green' : 'led-red'}></span>
            <span className="text-[9px] uppercase tracking-[0.15em] text-slate-400 font-semibold">
              {wsStatus === 'CONNECTED' ? `LIVE 10Hz · ${wsLatency}ms` : 'DISCONNECTED'}
            </span>
          </div>
          <div className="flex items-center text-xs font-mono text-slate-500">
            <Clock className="w-3 h-3 mr-1 text-slate-400" />
            {formatUTC(clock?.utc)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolarCommandBar;

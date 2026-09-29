import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useOptics } from '../../context/OpticsContext';
import {
  AlertTriangle,
  ShieldAlert,
  Compass,
  Wind,
  Gauge,
  Fuel,
  X,
  RotateCcw,
  Zap,
  Activity,
  CheckCircle2,
  Radio,
  Snowflake,
  Waves,
  Eye,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

export default function VesselCockpitView() {
  const [isTacticalDockOpen, setIsTacticalDockOpen] = useState(true);
  const {
    vessel,
    weather,
    cryoRiskIndex,
    cryoRiskLevel,
    scenario,
    triggerScenario,
    clearScenario,
    agents,
  } = useTelemetry();
  const { exitVesselView } = useOptics();

  const isCritical = cryoRiskLevel === 'CRITICAL' || cryoRiskLevel === 'HIGH';
  const activeScenarioId = scenario?.active;

  const scenariosList = [
    {
      id: 'berg_intercept',
      name: 'A-23A Trajectory Surge',
      shortName: 'A-23A Surge',
      icon: '🧊',
      threat: 'ICEBERG COLLISION RISK',
      impact: 'Direct collision trajectory detected. CPA 1.8 nm violates operational safety threshold (10.0 nm).',
      severity: 96,
      action: 'Alter course 18° Starboard to Route Bravo (18.4 nm clearance).',
    },
    {
      id: 'storm',
      name: 'Katabatic Blizzard Gale',
      shortName: 'Katabatic Gale',
      icon: '🌊',
      threat: 'SEVERE KATABATIC SWELL',
      impact: 'Winds 48 kt gusting 58 kt. 5.5m wave slamming hazard exceeds Polar Code threshold.',
      severity: 84,
      action: 'Throttle speed to 8.5 kt. Engage anti-slamming ballast trim.',
    },
    {
      id: 'sensor_loss',
      name: 'SAR Satellite Outage',
      shortName: 'SAR Outage',
      icon: '📡',
      threat: 'TELEMETRY SENSOR DROPOUT',
      impact: 'Sentinel-1 radar feed lost. Iceberg trajectory uncertainty widened +40%.',
      severity: 72,
      action: 'Switched to passive radiometer and dead-reckoning Kalman filters.',
    },
    {
      id: 'ice_freeze',
      name: 'Rapid Pack-Ice Expansion',
      shortName: 'Pack Ice Surge',
      icon: '❄️',
      threat: 'FAST ICE BESETMENT RISK',
      impact: 'Surface temp -28.4°C. 75%+ multi-year pack ice converging across planned leads.',
      severity: 78,
      action: 'Lindqvist hull resistance +65%. Re-routing via open polynyas in Sector 4B.',
    },
    {
      id: 'low_fuel',
      name: 'Critical Bunker Reserve',
      shortName: 'Low Fuel',
      icon: '⛽',
      threat: 'FUEL RESERVE THRESHOLD ALERT',
      impact: 'Bunker fuel at 28.0%, approaching 25% safety reserve limit.',
      severity: 70,
      action: 'Eco-speed mode engaged (9.2 kt). Route Charlie rejected for high ice resistance.',
    },
  ];

  const currentScenarioMeta = scenariosList.find((s) => s.id === activeScenarioId);

  return (
    <div className="fixed inset-0 z-40 pointer-events-none select-none flex flex-col justify-between p-3 sm:p-5">
      {/* ── 1. Top Tactical Cockpit Header Bar ── */}
      <header className="pointer-events-auto flex items-center justify-between gap-4 px-4 py-2.5 rounded-2xl bg-[#edf6fd]/95 backdrop-blur-md border border-sky-300/80 shadow-lg text-slate-800">
        {/* Left: Vessel Scan Status Tag */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-sky-900 text-sky-100 text-xs font-mono font-bold tracking-wider shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>3D VESSEL-CENTRIC ICE SCAN ACTIVE</span>
          </div>
          <span className="text-xs text-sky-900 font-semibold hidden md:inline">
            polarX BRIDGE VIEW
          </span>
        </div>

        {/* Center: Essential Cockpit Telemetry Readouts */}
        <div className="flex items-center gap-4 text-xs font-mono">
          {/* CRI */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-100/90 border border-sky-200">
            <span className="text-slate-500 font-sans text-[11px]">ICE RISK:</span>
            <span
              className={`font-bold ${
                isCritical ? 'text-red-700' : 'text-sky-900'
              }`}
            >
              {cryoRiskIndex?.toFixed(1) || '34.7'}
            </span>
            {isCritical && (
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-bounce" />
            )}
          </div>

          {/* Heading */}
          <div className="hidden sm:flex items-center gap-1 text-slate-700">
            <Compass className="w-3.5 h-3.5 text-sky-700" />
            <span className="text-slate-500 text-[11px]">HDG:</span>
            <span className="font-semibold text-sky-950">
              {Math.round(vessel?.heading || 198)}°
            </span>
          </div>

          {/* Speed */}
          <div className="hidden sm:flex items-center gap-1 text-slate-700">
            <Gauge className="w-3.5 h-3.5 text-sky-700" />
            <span className="text-slate-500 text-[11px]">SPD:</span>
            <span className="font-semibold text-sky-950">
              {vessel?.speedKts?.toFixed(1) || '12.4'} kt
            </span>
          </div>

          {/* Fuel */}
          <div className="hidden lg:flex items-center gap-1 text-slate-700">
            <Fuel className="w-3.5 h-3.5 text-sky-700" />
            <span className="text-slate-500 text-[11px]">FUEL:</span>
            <span
              className={`font-semibold ${
                (vessel?.fuelRemaining || 72) < 30
                  ? 'text-amber-700 font-bold'
                  : 'text-sky-950'
              }`}
            >
              {vessel?.fuelRemaining?.toFixed(1) || '72.3'}%
            </span>
          </div>
        </div>

        {/* Right: Exit Vessel View Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={exitVesselView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-800 hover:bg-sky-900 text-sky-50 text-xs font-semibold shadow-md transition-all active:scale-95"
            title="Return to Global Orbital View [Esc]"
          >
            <X className="w-3.5 h-3.5 text-sky-200" />
            <span>Exit Bridge View</span>
          </button>
        </div>
      </header>

      {/* ── 2. Mid Section: Clear Viewport & Floating Tactical Cards ── */}
      <div className="flex-1 flex justify-between items-start pt-4 relative">
        {/* Left: Reticle Bracket & Status */}
        <div className="pointer-events-none hidden md:flex flex-col gap-1 text-[11px] text-sky-800/80 font-mono pl-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sky-600 font-bold">┌</span>
            <span>FORWARD RADAR SECTOR: 60° SWEEP [12.0 NM]</span>
          </div>
          <div className="pl-3 text-slate-500">
            RADAR MODE: FMCW S-BAND / SENTINEL-1 COMPOSITE
          </div>
        </div>

        {/* Right: Tactical Intelligence Response Dock (inspired directly by reference mockup) */}
        {isTacticalDockOpen ? (
          <div className="pointer-events-auto w-80 sm:w-96 flex flex-col gap-2.5">
            <div className="flex justify-end">
              <button
                onClick={() => setIsTacticalDockOpen(false)}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-sky-950 bg-sky-100/90 hover:bg-sky-200 px-2.5 py-0.5 rounded-full border border-sky-300/80 shadow-sm transition-all"
                title="Collapse tactical cards for unobstructed panoramic view"
              >
                <span>Hide Intel</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ── CARD 1: Threat Assessment / Collision Risk ── */}
            <div
              className={`p-3.5 rounded-2xl border backdrop-blur-md shadow-lg transition-all ${
              activeScenarioId
                ? 'bg-[#edf6fd]/95 border-red-300/90 shadow-red-200/50'
                : 'bg-[#edf6fd]/90 border-sky-300/80'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                {activeScenarioId ? (
                  <div className="p-1 rounded-lg bg-red-100 text-red-600 animate-pulse">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="p-1 rounded-lg bg-sky-100 text-sky-700">
                    <Activity className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <h3 className="font-sans font-bold text-xs tracking-tight text-slate-800">
                    {activeScenarioId
                      ? `THREAT: ${currentScenarioMeta?.threat || 'CRISIS ACTIVE'}`
                      : 'RADAR SURVEILLANCE: NOMINAL'}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {activeScenarioId ? 'AUTONOMOUS INTERVENTION TRIGGERED' : 'FAIRWAY CLEAR 12 NM'}
                  </span>
                </div>
              </div>

              {/* Threat Severity Gauge */}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeScenarioId
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-sky-100 text-sky-800 border border-sky-200'
                }`}
              >
                {activeScenarioId ? `${currentScenarioMeta?.severity || 90}% RISK` : '12% RISK'}
              </span>
            </div>

            {/* Severity Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  activeScenarioId ? 'bg-red-600' : 'bg-sky-600'
                }`}
                style={{
                  width: `${activeScenarioId ? currentScenarioMeta?.severity || 90 : 18}%`,
                }}
              ></div>
            </div>

            <p className="text-xs text-slate-600 leading-snug">
              {activeScenarioId
                ? currentScenarioMeta?.impact
                : 'Primary radar tracks all targets beyond safe 10.0 nm operational buffer. No conjunction events forecast.'}
            </p>
          </div>

          {/* ── CARD 2: Safety Agent Status ── */}
          <div className="p-3.5 rounded-2xl bg-[#edf6fd]/90 backdrop-blur-md border border-sky-300/80 shadow-md">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                <span className="font-sans font-bold text-xs text-sky-950">
                  SAFETY AGENT
                </span>
              </div>
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                  activeScenarioId === 'berg_intercept'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-sky-100 text-sky-800 border border-sky-200'
                }`}
              >
                {activeScenarioId === 'berg_intercept'
                  ? 'INTERCEPT ETA: 6.2h'
                  : 'STATUS: NOMINAL'}
              </span>
            </div>

            <div className="text-xs text-slate-700 font-medium mb-1">
              {activeScenarioId === 'berg_intercept' ? (
                <span className="text-red-700 font-semibold">
                  CPA 1.8 nm &lt; 10.0 nm operational safety threshold
                </span>
              ) : (
                <span>Route Bravo maintains 18.4 nm clearance from A-23A</span>
              )}
            </div>

            <div className="text-[11px] text-slate-500 leading-tight">
              Polar Safety Gate:{' '}
              <strong className="text-sky-900">
                {activeScenarioId === 'berg_intercept'
                  ? 'Route Alpha BLOCKED · Enforcing Bravo'
                  : 'All safety gates satisfied'}
              </strong>
            </div>
          </div>

          {/* ── CARD 3: Route Agent Dynamic Detour Calculation ── */}
          <div className="p-3.5 rounded-2xl bg-[#edf6fd]/90 backdrop-blur-md border border-sky-300/80 shadow-md">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-sky-700" />
                <span className="font-sans font-bold text-xs text-sky-950">
                  AUTONOMOUS ROUTE AGENT
                </span>
              </div>
              <span className="text-[10px] font-mono text-sky-700 font-semibold">
                ROUTE BRAVO OPTIMAL
              </span>
            </div>

            <div className="text-xs text-slate-700 leading-snug mb-2 font-normal">
              {activeScenarioId
                ? currentScenarioMeta?.action
                : 'Detour arc active: Course altered to 198° Starboard. Transitioning into 35% thin-ice lead corridor.'}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[11px] pt-1.5 border-t border-sky-200/60">
              <div className="p-1 rounded bg-sky-50 border border-sky-200/50">
                <span className="text-[10px] text-slate-400 block font-sans">Clearance</span>
                <span className="text-sky-900 font-semibold">18.4 nm</span>
              </div>
              <div className="p-1 rounded bg-sky-50 border border-sky-200/50">
                <span className="text-[10px] text-slate-400 block font-sans">Transit</span>
                <span className="text-sky-900 font-semibold">+7.6h</span>
              </div>
              <div className="p-1 rounded bg-sky-50 border border-sky-200/50">
                <span className="text-[10px] text-slate-400 block font-sans">Fuel</span>
                <span className="text-sky-900 font-semibold">+2.8 MT</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
          <button
            onClick={() => setIsTacticalDockOpen(true)}
            className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#edf6fd]/95 backdrop-blur-md border border-sky-300 shadow-lg text-sky-900 text-xs font-semibold hover:bg-sky-100 hover:border-sky-400 transition-all self-start"
            title="Expand tactical intelligence cards"
          >
            <ShieldAlert className="w-4 h-4 text-sky-700" />
            <span>Tactical Intelligence</span>
            {activeScenarioId && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            )}
            <ChevronLeft className="w-4 h-4 text-sky-600" />
          </button>
        )}
      </div>

      {/* ── 3. Bottom Operational Control Strip ── */}
      <footer className="pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-3 pt-3">
        {/* Left: Local Vessel Sensors & Class */}
        <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-[#edf6fd]/95 backdrop-blur-md border border-sky-300/80 shadow-md text-xs text-slate-700">
          <div className="flex items-center gap-1.5 font-bold text-sky-950">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            <span>RV MAITRI-01</span>
            <span className="text-slate-400 font-normal text-[11px]">· PC5 ICEBREAKER</span>
          </div>

          <div className="h-3 w-px bg-slate-300"></div>

          <div className="flex items-center gap-1 text-slate-600">
            <Wind className="w-3 h-3 text-sky-600" />
            <span className="font-mono text-[11px]">{Math.round(weather?.windSpeedKts || 28)} kt</span>
          </div>

          <div className="flex items-center gap-1 text-slate-600">
            <Snowflake className="w-3 h-3 text-sky-600" />
            <span className="font-mono text-[11px]">{weather?.temperature?.toFixed(1) || '-12.4'}°C</span>
          </div>

          {/* Sub-Agent Status Pills */}
          <div className="hidden lg:flex items-center gap-1 pl-1">
            <span className="text-[10px] text-slate-400 uppercase font-sans">Sub-Agents:</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Ice Navigation Agent Nominal"></span>
            <span
              className={`w-2 h-2 rounded-full ${
                activeScenarioId ? 'bg-red-500 animate-ping' : 'bg-emerald-500'
              }`}
              title="Berg Watch Agent"
            ></span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Propulsion Agent Nominal"></span>
          </div>
        </div>

        {/* Center / Right: Crisis Scenarios Injection & Dismissal Deck */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-[#edf6fd]/95 backdrop-blur-md border border-sky-300/80 shadow-md">
          <span className="text-[11px] font-semibold text-slate-500 px-2 uppercase tracking-wider font-sans">
            Scenarios:
          </span>

          {scenariosList.map((sc) => {
            const isActive = activeScenarioId === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => triggerScenario(sc.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md font-semibold scale-105'
                    : 'bg-[#f0f7fe] hover:bg-sky-100 text-slate-700 border border-sky-200/80'
                }`}
                title={sc.impact}
              >
                <span>{sc.icon}</span>
                <span>{sc.shortName}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping ml-0.5"></span>
                )}
              </button>
            );
          })}

          {/* ── CROSS-OUT / DISMISS ACTIVE SCENARIO BUTTON ── */}
          {activeScenarioId && (
            <button
              onClick={clearScenario}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-slate-100 text-xs font-semibold shadow-md transition-all ml-1"
              title="Dismiss active crisis and return to normal operations"
            >
              <RotateCcw className="w-3.5 h-3.5 text-sky-300" />
              <span>Reset Scenario</span>
              <X className="w-3.5 h-3.5 text-red-400" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const TelemetryContext = createContext(null);

/* ═══════════════════════════════════════════════════════════════
   polarX Mock Telemetry Provider
   Simulates a living Antarctic operational environment:
   - Vessel movement along planned route
   - Drifting icebergs with Coriolis-deflected trajectories
   - Fluctuating weather / ocean conditions
   - Multi-agent deliberation state
   - Dynamic route comparison
   ═══════════════════════════════════════════════════════════════ */

// ── Utility ─────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function jitter(base, range) { return base + (Math.random() - 0.5) * range; }

// ── Initial Mock State ──────────────────────────────────────
function createInitialState() {
  return {
    // ── Simulation Clock ──
    clock: {
      utc: new Date().toISOString(),
      missionElapsed: '04d 17h 32m',
      tickHz: 10,
      simSpeed: 1,
    },

    // ── Vessel ──
    vessel: {
      id: 'IND-ANTARCTIC-01',
      name: 'RV MAITRI-01',
      callSign: 'VWM01',
      polarClass: 'PC5',
      position: { lat: -62.45, lon: 28.30 },
      heading: 195.4,
      speedKts: 12.4,
      courseOverGround: 198.2,
      rudderAngle: 2.1,
      engineLoad: 45,
      shaftRPM: 142,
      fuelRemaining: 72.3,
      fuelBurnRate: 0.42,
      iceResistance: 'Moderate',
      hullStress: 34,
      destination: {
        name: 'Maitri Station',
        lat: -70.77,
        lon: 11.73,
      },
      eta: '2d 14h 22m',
      distanceRemaining: 684,
    },

    // ── Tracked Icebergs ──
    icebergs: [
      {
        id: 'A-23A',
        name: 'A-23A',
        position: { lat: -65.20, lon: 18.70 },
        dimensions: { lengthKm: 67, widthKm: 24, freeboard: 45, keelDepth: 250 },
        massKt: 980000,
        driftVector: { speedKts: 0.82, heading: 342 },
        source: 'USNIC',
        lastObserved: '2026-09-26T14:00:00Z',
        threatLevel: 'HIGH',
        cpaDistance: 8.4,
        cpaTime: 'T+18h',
        trajectory: [
          { lat: -65.20, lon: 18.70, t: 0 },
          { lat: -65.05, lon: 18.55, t: 6 },
          { lat: -64.88, lon: 18.38, t: 12 },
          { lat: -64.70, lon: 18.18, t: 18 },
          { lat: -64.50, lon: 17.95, t: 24 },
          { lat: -64.28, lon: 17.70, t: 36 },
          { lat: -64.02, lon: 17.40, t: 48 },
        ],
      },
      {
        id: 'B-46',
        name: 'B-46',
        position: { lat: -67.80, lon: 14.20 },
        dimensions: { lengthKm: 18, widthKm: 8, freeboard: 32, keelDepth: 180 },
        massKt: 120000,
        driftVector: { speedKts: 0.45, heading: 15 },
        source: 'USNIC',
        lastObserved: '2026-09-26T12:00:00Z',
        threatLevel: 'MODERATE',
        cpaDistance: 22.1,
        cpaTime: 'T+36h',
        trajectory: [
          { lat: -67.80, lon: 14.20, t: 0 },
          { lat: -67.65, lon: 14.30, t: 12 },
          { lat: -67.48, lon: 14.42, t: 24 },
          { lat: -67.30, lon: 14.55, t: 36 },
          { lat: -67.10, lon: 14.70, t: 48 },
        ],
      },
      {
        id: 'C-38',
        name: 'C-38',
        position: { lat: -63.10, lon: 22.50 },
        dimensions: { lengthKm: 5, widthKm: 3, freeboard: 18, keelDepth: 95 },
        massKt: 8500,
        driftVector: { speedKts: 1.10, heading: 280 },
        source: 'USNIC',
        lastObserved: '2026-09-26T16:00:00Z',
        threatLevel: 'LOW',
        cpaDistance: 45.0,
        cpaTime: 'N/A',
        trajectory: [
          { lat: -63.10, lon: 22.50, t: 0 },
          { lat: -63.12, lon: 22.20, t: 12 },
          { lat: -63.15, lon: 21.88, t: 24 },
        ],
      },
    ],

    // ── Sea Ice ──
    seaIce: {
      source: 'NOAA/NSIDC CDR v6',
      product: 'Antarctic Daily SIC',
      resolution: '25 km',
      lastObservation: '2026-09-26T06:00:00Z',
      iceExtentKm2: 18420000,
      averageSIC: 62,
      maxSIC: 97,
      iceEdgeLatitude: -61.5,
      forecastHorizon: '48h',
      forecastModel: 'polarX Polar Forecast v1',
      forecastConfidence: 87,
    },

    // ── Weather / Met-Ocean ──
    weather: {
      source: 'ECMWF ERA5',
      windSpeedKts: 28,
      windDirection: 225,
      gustsKts: 38,
      temperature: -12.4,
      feelsLike: -24.1,
      pressure: 982.3,
      pressureTrend: 'FALLING',
      waveHeight: 3.2,
      wavePeriod: 8.5,
      waveDirection: 235,
      visibility: 'Moderate',
      visibilityNm: 8,
      sst: -1.2,
      currentSpeed: 0.8,
      currentDirection: 165,
      condition: 'Overcast / Snow Showers',
      forecastAlert: null,
    },

    // ── Candidate Routes ──
    routes: [
      {
        id: 'alpha',
        name: 'Route Alpha',
        label: 'Direct',
        status: 'BLOCKED',
        safetyGate: 'BLOCKED',
        safetyReason: 'Iceberg A-23A CPA 1.8 nm < 10.0 nm operational buffer threshold',
        distanceNm: 684,
        transitHours: 55.2,
        fuelCostMT: 28.4,
        iceExposure: 78,
        bergRisk: 92,
        weatherRisk: 45,
        besetmentProb: 34,
        fuelSavings: 0,
        color: '#475569',
        waypoints: [
          { lat: -62.45, lon: 28.30 },
          { lat: -64.80, lon: 22.50 },
          { lat: -67.20, lon: 17.10 },
          { lat: -70.77, lon: 11.73 },
        ],
      },
      {
        id: 'bravo',
        name: 'Route Bravo',
        label: 'Optimal',
        status: 'RECOMMENDED',
        safetyGate: 'AWAITING_APPROVAL',
        safetyReason: 'Compliant with PC5 limits. Awaiting operator authorization.',
        distanceNm: 742,
        transitHours: 62.8,
        fuelCostMT: 31.2,
        iceExposure: 35,
        bergRisk: 12,
        weatherRisk: 38,
        besetmentProb: 6,
        fuelSavings: 24.6,
        color: '#0284c7',
        waypoints: [
          { lat: -62.45, lon: 28.30 },
          { lat: -63.80, lon: 25.00 },
          { lat: -65.50, lon: 20.80 },
          { lat: -67.80, lon: 16.20 },
          { lat: -70.77, lon: 11.73 },
        ],
      },
      {
        id: 'charlie',
        name: 'Route Charlie',
        label: 'Conservative',
        status: 'CAUTION',
        safetyGate: 'APPROVED',
        safetyReason: 'All clearances satisfied. High fuel consumption warning.',
        distanceNm: 896,
        transitHours: 78.4,
        fuelCostMT: 42.8,
        iceExposure: 8,
        bergRisk: 2,
        weatherRisk: 22,
        besetmentProb: 1,
        fuelSavings: -15.2,
        color: '#0369a1',
        waypoints: [
          { lat: -62.45, lon: 28.30 },
          { lat: -61.50, lon: 24.00 },
          { lat: -61.20, lon: 18.00 },
          { lat: -63.00, lon: 13.00 },
          { lat: -66.50, lon: 11.00 },
          { lat: -70.77, lon: 11.73 },
        ],
      },
    ],

    // ── Multi-Agent Deliberation ──
    agents: {
      iceNav: {
        name: 'Ice Navigation',
        icon: '❄️',
        status: 'active',
        confidence: 0.87,
        assessment: 'Pack ice concentration 62% average along Route Alpha. Lead detected at 66.2°S suitable for Bravo corridor. Ridge compression risk LOW in Weddell approach.',
        recommendation: 'ROUTE_BRAVO',
        lastUpdate: '12s ago',
      },
      bergWatch: {
        name: 'Iceberg Tracking',
        icon: '🧊',
        status: 'alert',
        confidence: 0.92,
        assessment: 'A-23A drift accelerating NNW at 0.82 kts. Predicted CPA with Alpha corridor: 1.8 nm at T+18h. VIOLATION: below 10 nm safety threshold. Bravo corridor maintains 18.4 nm clearance.',
        recommendation: 'BLOCK_ALPHA',
        lastUpdate: '8s ago',
      },
      polarMet: {
        name: 'Polar Meteorology',
        icon: '💨',
        status: 'caution',
        confidence: 0.79,
        assessment: 'Katabatic wind surge forecast 225° at 38 kts gusting 52 kts in 14h. Wave height building to 4.8m Hs. Conditions marginal for ice operations. Window closing in 18h.',
        recommendation: 'EXPEDITE_DEPARTURE',
        lastUpdate: '22s ago',
      },
      propulsion: {
        name: 'Propulsion Chief',
        icon: '⚙️',
        status: 'nominal',
        confidence: 0.94,
        assessment: 'Engine load 45% at 12.4 kts open water. Lindqvist model estimates 78% load in 60% SIC pack ice. Fuel reserve adequate for Bravo (31.2 MT) with 41.1% remaining on arrival.',
        recommendation: 'ROUTE_BRAVO',
        lastUpdate: '5s ago',
      },
      safety: {
        name: 'Polar Safety',
        icon: '🛡️',
        status: 'enforcing',
        confidence: 1.0,
        assessment: 'GATE RESULT: Alpha BLOCKED (A-23A CPA violation). Bravo APPROVED (all clearances met). Charlie APPROVED (high fuel cost warning issued).',
        recommendation: 'APPROVE_BRAVO',
        lastUpdate: '3s ago',
      },
      commander: {
        name: 'Expedition Lead',
        icon: '🧭',
        status: 'deciding',
        confidence: 0.91,
        assessment: 'Maitri resupply window: 72h remaining. Route Bravo delivers ETA 62.8h with adequate fuel margin. Weather window supports departure within 4h. Recommend immediate execution of Bravo corridor.',
        recommendation: 'EXECUTE_BRAVO',
        lastUpdate: '1s ago',
      },
    },

    // ── Cryo Risk Index ──
    cryoRiskIndex: 34.7,
    cryoRiskLevel: 'MODERATE',

    // ── Layer Visibility ──
    layers: {
      seaIce: true,
      icebergs: true,
      routes: true,
      weather: true,
      currents: false,
      bathymetry: false,
      radarCone: true,
    },

    // ── Active Scenario ──
    scenario: {
      active: null,
      available: [
        { id: 'berg_intercept', name: 'A-23A Trajectory Surge', icon: '🧊' },
        { id: 'ice_freeze', name: 'Rapid Pack-Ice Expansion', icon: '❄️' },
        { id: 'storm', name: 'Katabatic Blizzard Spike', icon: '🌊' },
        { id: 'sensor_loss', name: 'SAR Sensor Blackout', icon: '📡' },
        { id: 'low_fuel', name: 'Bunker Fuel Emergency', icon: '⛽' },
      ],
    },

    // ── What-If Sliders ──
    whatIf: {
      icebergVelocityMultiplier: 1.0,
      windShearMultiplier: 1.0,
      targetVesselSpeed: 12.4,
      fuelReserveFloor: 25,
    },

    // ── Data Provenance ──
    provenance: {
      satellite: { source: 'NOAA/NSIDC CDR v6', acquired: '2026-09-26T06:00:00Z', resolution: '25 km', confidence: 0.92, type: 'REAL_OBSERVATION' },
      iceberg:   { source: 'USNIC Antarctic Catalogue', acquired: '2026-09-26T14:00:00Z', resolution: 'Point', confidence: 0.95, type: 'REAL_CATALOGUE' },
      weather:   { source: 'ECMWF ERA5 Reanalysis', acquired: '2026-09-26T18:00:00Z', resolution: '0.25°', confidence: 0.88, type: 'MODEL_OUTPUT' },
      ocean:     { source: 'Copernicus Marine (CMEMS)', acquired: '2026-09-26T12:00:00Z', resolution: '0.083°', confidence: 0.85, type: 'MODEL_OUTPUT' },
    },

    // ── WebSocket Status ──
    wsStatus: 'CONNECTED',
    wsLatency: 12,
  };
}


export function TelemetryProvider({ children }) {
  const [state, setState] = useState(createInitialState);
  const frameRef = useRef(0);

  // ── Simulated live data animation ──
  useEffect(() => {
    const interval = setInterval(() => {
      frameRef.current += 1;
      const t = frameRef.current;

      setState(prev => {
        const dt = 0.0005;
        // Vessel slowly advances toward destination
        const newVesselLat = prev.vessel.position.lat - dt * 0.8;
        const newVesselLon = prev.vessel.position.lon - dt * 1.5;

        // Icebergs drift
        const newIcebergs = prev.icebergs.map(berg => ({
          ...berg,
          position: {
            lat: berg.position.lat + dt * (berg.driftVector.heading > 180 ? -0.3 : 0.3),
            lon: berg.position.lon + dt * (berg.driftVector.heading > 270 || berg.driftVector.heading < 90 ? 0.2 : -0.2),
          },
          driftVector: {
            ...berg.driftVector,
            speedKts: jitter(berg.driftVector.speedKts, 0.02),
          },
        }));

        // Weather fluctuations
        const newWeather = {
          ...prev.weather,
          windSpeedKts: clamp(jitter(prev.weather.windSpeedKts, 0.5), 15, 45),
          temperature: clamp(jitter(prev.weather.temperature, 0.1), -25, -5),
          pressure: clamp(jitter(prev.weather.pressure, 0.2), 970, 1010),
          waveHeight: clamp(jitter(prev.weather.waveHeight, 0.05), 1.5, 6.0),
        };

        // CRI fluctuates
        const newCRI = clamp(jitter(prev.cryoRiskIndex, 0.3), 10, 85);

        return {
          ...prev,
          clock: {
            ...prev.clock,
            utc: new Date().toISOString(),
          },
          vessel: {
            ...prev.vessel,
            position: { lat: newVesselLat, lon: newVesselLon },
            heading: clamp(jitter(prev.vessel.heading, 0.3), 180, 210),
            speedKts: clamp(jitter(prev.vessel.speedKts, 0.1), 10, 14),
            engineLoad: clamp(jitter(prev.vessel.engineLoad, 0.5), 35, 65),
            shaftRPM: Math.round(clamp(jitter(prev.vessel.shaftRPM, 1), 130, 160)),
            fuelRemaining: clamp(prev.vessel.fuelRemaining - 0.0002, 20, 100),
            hullStress: clamp(Math.round(jitter(prev.vessel.hullStress, 1)), 20, 55),
          },
          icebergs: newIcebergs,
          weather: newWeather,
          cryoRiskIndex: newCRI,
          cryoRiskLevel: newCRI < 25 ? 'LOW' : newCRI < 50 ? 'MODERATE' : newCRI < 75 ? 'HIGH' : 'CRITICAL',
          wsLatency: Math.round(clamp(jitter(12, 4), 5, 30)),
        };
      });
    }, 1000); // 1Hz tick: eliminates 90% of React reconciliation overhead while keeping live clock and metrics

    return () => clearInterval(interval);
  }, []);

  // ── Layer Toggle ──
  const toggleLayer = useCallback((layerName) => {
    setState(prev => ({
      ...prev,
      layers: { ...prev.layers, [layerName]: !prev.layers[layerName] },
    }));
  }, []);

  // ── What-If Update ──
  const updateWhatIf = useCallback((key, value) => {
    setState(prev => ({
      ...prev,
      whatIf: { ...prev.whatIf, [key]: value },
    }));
  }, []);

  // ── Scenario Trigger & Manual Clear ──
  const clearScenario = useCallback(() => {
    setState(prev => ({
      ...prev,
      scenario: { ...prev.scenario, active: null },
      cryoRiskIndex: 34.7,
      cryoRiskLevel: 'MODERATE',
      weather: {
        ...prev.weather,
        windSpeedKts: 28,
        gustsKts: 38,
        waveHeight: 3.2,
        temperature: -12.4,
        condition: 'Overcast / Snow Showers',
      },
      vessel: {
        ...prev.vessel,
        speedKts: 12.4,
        fuelRemaining: 72.3,
      },
      provenance: {
        ...prev.provenance,
        satellite: {
          source: 'NOAA/NSIDC CDR v6',
          acquired: '2026-09-26T06:00:00Z',
          resolution: '25 km',
          confidence: 0.92,
          type: 'REAL_OBSERVATION',
        },
      },
      agents: {
        ...prev.agents,
        bergWatch: {
          ...prev.agents.bergWatch,
          status: 'alert',
          assessment: 'A-23A drift accelerating NNW at 0.82 kts. Predicted CPA with Alpha corridor: 1.8 nm at T+18h. Below configured operational safety threshold. Bravo corridor maintains 18.4 nm clearance.',
        },
        safety: {
          ...prev.agents.safety,
          status: 'enforcing',
          assessment: 'GATE RESULT: Alpha BLOCKED (A-23A CPA below operational threshold). Bravo APPROVED (all clearances met). Charlie APPROVED (high fuel cost warning issued).',
        },
        polarMet: {
          ...prev.agents.polarMet,
          status: 'caution',
          assessment: 'Katabatic wind surge forecast 225° at 38 kts gusting 52 kts in 14h. Wave height building to 4.8m Hs. Conditions marginal for ice operations.',
        },
        iceNav: {
          ...prev.agents.iceNav,
          status: 'active',
          assessment: 'Sea ice concentration along Route Bravo: 35-45% first-year thin pack. Lindqvist resistance model yields 10.8 kts safe transit speed.',
        },
        propulsion: {
          ...prev.agents.propulsion,
          status: 'nominal',
          assessment: 'Engine load 45% at 12.4 kts open water. Fuel reserve adequate for Bravo (31.2 MT) with 41.1% remaining on arrival.',
        },
      },
    }));
  }, []);

  const triggerScenario = useCallback((scenarioId) => {
    if (!scenarioId) {
      clearScenario();
      return;
    }

    setState(prev => {
      // Toggle off if already active
      if (prev.scenario.active === scenarioId) {
        return {
          ...prev,
          scenario: { ...prev.scenario, active: null },
          cryoRiskIndex: 34.7,
          cryoRiskLevel: 'MODERATE',
        };
      }

      let cri = 86.4;
      let level = 'CRITICAL';
      let weatherUpdate = { ...prev.weather };
      let vesselUpdate = { ...prev.vessel };
      let agentsUpdate = { ...prev.agents };
      let provUpdate = { ...prev.provenance };

      if (scenarioId === 'berg_intercept') {
        cri = 92.5;
        level = 'CRITICAL';
        agentsUpdate.bergWatch = {
          ...prev.agents.bergWatch,
          status: 'alert',
          assessment: 'EMERGENCY COLLISION WARNING: A-23A drift vector intersects Route Alpha. CPA 1.8 nm violates operational safety threshold (10.0 nm). Route Alpha blocked.',
        };
        agentsUpdate.safety = {
          ...prev.agents.safety,
          status: 'enforcing',
          assessment: 'SAFETY INTERVENTION: Route Alpha strictly BLOCKED. Recommending immediate 18° starboard course alteration to Route Bravo (18.4 nm clearance).',
        };
      } else if (scenarioId === 'storm') {
        cri = 84.0;
        level = 'CRITICAL';
        weatherUpdate = {
          ...prev.weather,
          windSpeedKts: 48,
          gustsKts: 58,
          waveHeight: 5.5,
          condition: 'Katabatic Blizzard / Heavy Swell',
        };
        vesselUpdate.speedKts = 8.5;
        agentsUpdate.polarMet = {
          ...prev.agents.polarMet,
          status: 'alert',
          assessment: 'KATABATIC GALE WARNING: Winds 48 kt gusting 58 kt. 5.5m wave slamming hazard exceeds Polar Code threshold. Safe speed reduced to 8.5 kt.',
        };
      } else if (scenarioId === 'sensor_loss') {
        cri = 72.0;
        level = 'HIGH';
        provUpdate.satellite = {
          ...prev.provenance.satellite,
          confidence: 0.42,
          type: 'DEGRADED_FAILOVER',
        };
        agentsUpdate.iceNav = {
          ...prev.agents.iceNav,
          status: 'caution',
          assessment: 'SAR TELEMETRY DROPPED: Satellite feed offline. Reverting to passive radiometer & dead reckoning. Trajectory uncertainty widened +40%.',
        };
      } else if (scenarioId === 'ice_freeze') {
        cri = 78.5;
        level = 'HIGH';
        weatherUpdate.temperature = -28.4;
        agentsUpdate.iceNav = {
          ...prev.agents.iceNav,
          status: 'caution',
          assessment: 'RAPID FREEZE ADVANCE: 75%+ multi-year pack ice encroaching northwards. Direct leads closed; Lindqvist hull resistance +65%.',
        };
      } else if (scenarioId === 'low_fuel') {
        cri = 70.0;
        level = 'HIGH';
        vesselUpdate.fuelRemaining = 28.0;
        agentsUpdate.propulsion = {
          ...prev.agents.propulsion,
          status: 'caution',
          assessment: 'BUNKER FUEL CRITICAL: Reserves dropped to 28.0% approaching 25% safety reserve threshold. Eco-speed mode engaged (9.2 kt).',
        };
      }

      return {
        ...prev,
        scenario: { ...prev.scenario, active: scenarioId },
        cryoRiskIndex: cri,
        cryoRiskLevel: level,
        weather: weatherUpdate,
        vessel: vesselUpdate,
        agents: agentsUpdate,
        provenance: provUpdate,
      };
    });
  }, [clearScenario]);

  const value = {
    ...state,
    toggleLayer,
    updateWhatIf,
    triggerScenario,
    clearScenario,
  };

  return (
    <TelemetryContext.Provider value={value}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const ctx = useContext(TelemetryContext);
  if (!ctx) throw new Error('useTelemetry must be used within TelemetryProvider');
  return ctx;
}

export default TelemetryContext;

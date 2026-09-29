# polarX: AI-Enabled Antarctic Navigation Decision Support System

**SIH Problem Statement 26059**: AI-Enabled Antarctic Sea-Ice, Iceberg Trajectory, and Navigation Decision Support System  
**Organization**: Ministry of Earth Sciences (MoES) / National Centre for Polar and Ocean Research (NCPOR)  

---

## Quickstart

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Run the development server
npm run dev

# 3. Open in browser
http://localhost:5173/
```

---

## Project Structure

```
ICE/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html
├── public/
│   └── earth-blue-marble.jpg           # NASA Blue Marble high-res satellite texture
├── src/
│   ├── App.jsx                         # Master layout container
│   ├── index.css                       # Light polar sky design system
│   ├── main.jsx                        # React root mount with TelemetryProvider
│   ├── context/
│   │   └── TelemetryContext.jsx        # 10Hz simulation state loop
│   ├── utils/
│   │   ├── polarProjection.js          # Spherical coordinate projection & Great Circle SLERP
│   │   └── earthTextureGenerator.js    # Geographic map utility
│   └── components/
│       ├── map/
│       │   ├── AntarcticScene.jsx      # 3D Canvas, OrbitControls, polar lighting
│       │   ├── EarthGlobe3D.jsx        # 3D Earth sphere with Blue Marble imagery
│       │   ├── VesselMarker3D.jsx      # Research vessel hull + radar sweep cone
│       │   ├── IcebergMarkers3D.jsx    # Tracked icebergs + 10nm proximity hazard circle
│       │   ├── RoutePathways3D.jsx     # Great Circle route ribbons + photon flow
│       │   └── Stations3D.jsx          # Maitri & Bharati destination beacons
│       ├── navigation/
│       │   └── TopBar.jsx              # Operational command bar with live telemetry
│       ├── panels/
│       │   ├── EnvironmentPanel.jsx    # Left dock: layer toggles, SIC legend, 48h outlook
│       │   ├── DecisionIntelligencePanel.jsx # Right dock: Polar Code gauges, route cards
│       │   └── BottomStatusBar.jsx     # Bottom footer: vessel position, distance, ETA
│       └── modals/
│           ├── ScenariosModal.jsx      # 5 operational crisis injection scenarios
│           └── WhatIfModal.jsx         # Sensitivity analysis sliders with dynamic feedback
├── PROJECT_STATE.md                    # Complete handoff & tomorrow's backend implementation roadmap
└── walkthrough.md                      # UI/UX engineering log and visual verification notes
```

---

## Current Status & Tomorrow's Plan
See [`PROJECT_STATE.md`](./PROJECT_STATE.md) for full details on:
- **Phase 1-2**: Complete Light Polar UI/UX console (Done ✅).
- **Phases 3-10**: Physics, ML, and Multi-Agent backend to be built next.

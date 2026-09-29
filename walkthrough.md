# ICE-X: Polar Navigation Command Console — UI/UX Walkthrough

## 1. Overview
ICE-X is an AI-enabled Antarctic sea-ice, iceberg trajectory, and navigation decision support system built for SIH Problem Statement 26059 (Ministry of Earth Sciences / NCPOR). 

The console provides a real-time, 3D geographic operational view centered on the Antarctic continent, coupled with maritime compliance telemetry and autonomous route optimization.

---

## 2. Key Visual & Architectural Highlights

### A. Authentic 3D Earth Globe Theater (~70% Visual Attention)
* **True NASA Blue Marble Satellite Imagery**: High-definition satellite texture (`/earth-blue-marble.jpg`) showing genuine oceans, cloud bands, and the snow-covered Antarctic continent in the center.
* **360° Free Mouse Drag Rotation**: Eye-level orbital camera (`[0, 6, 36]`) with center-locked target (`enablePan={false}`), allowing continuous horizontal and vertical rotation without pole lock or gimbal freeze.
* **Smooth Inertia Damping & Wide Zoom**: Damped camera physics (`dampingFactor: 0.06`, `zoomSpeed: 1.0`), zooming from surface level (`14.8`) to deep orbital space (`90.0`).
* **Geographic Sea-Ice Concentration (SIC)**: Dynamic layer surrounding Antarctica with dedicated gradient legend (0% Open Water $\rightarrow$ 100% Consolidated Pack).
* **Research Vessel (`SA Agulhas III`)**: Directional hull with forward-scanning 12 nm ice radar sweep cone and clean non-blocking HUD pill (`SA Agulhas III · 12.4 kt`).
* **Tracked Icebergs**: `A-23A` rendered with an active **10 nm proximity hazard perimeter circle**, drift trajectory vector, and closest-approach alert.
* **Dominant Navigation Routes**: Route Bravo is a bold glowing emerald ribbon with **animated directional photon pulses** flowing toward Maitri Station; Route Alpha is marked with a collision cross.

### B. Light Polar Sky Aesthetic & Strict Color Theory
* **Monochromatic Antarctic Palette**: Replaced harsh terminal darks and random circus colors (pinks, reds, oranges) with a cohesive, professional palette of **deep marine navy (`#0f2942`, `#0c4a6e`), polar sky blue (`#edf6fd`, `#f0f7fe`), and muted steel slate (`#64748b`)**.
* **Soft Sky-Tinted Glass Panels**: Replaced pure whites with `rgba(238, 246, 254, 0.88)` and subtle frost borders `rgba(215, 235, 252, 0.95)`.
* **Human-Crafted Typography**: Integrated the **Outfit** and **Space Grotesk** font families with natural sentence casing and normal font weights (`font-normal`, `font-medium`), completely eliminating AI-style shouting caps.
* **Non-Overlapping 3D HUD Tags**: Clean, minimal rounded pills with `pointerEvents="none"` so clicks always pass through to rotate the Earth.

### C. Maritime Decision Intelligence & Compliance Gauges
* **Full-Height Scrollable Panel**: Resolved the layout clipping issue with `top-16 bottom-12`, pinned header, pinned action footer, and independent `flex-1 min-h-0 overflow-y-auto` scrolling.
* **Polar Code Safety Telemetry Matrix**: Active constraint monitoring deck featuring live margin gauges and threshold pins:
  1. *Iceberg CPA Buffer*: `18.4 nm` vs `10.0 nm` threshold (`+8.4 nm safe margin`).
  2. *Sea-Ice Concentration*: `35% SIC` vs `60% PC5 limit` (`-25% under ceiling`).
  3. *Arrival Bunker Fuel*: `41.1%` vs `25.0% mandatory floor` (`+16.1% over floor`).
  4. *Wave Slamming Severity*: `3.2 m Hs` vs `6.5 m limit` (`-3.3 m sub-critical`).
* **Evaluated Alternative Corridors**: Selectable technical cards detailing the exact physics why the algorithm rejected them:
  * *Route Alpha*: Conjunction alert at CPA `1.8 nm at T+18.4h` (violates 10 nm radar perimeter).
  * *Route Charlie*: Zero ice contact (`0% SIC`), but `+42.8 MT bunker penalty` causing arrival reserve to drop to `14.2%` (breaches 25% floor).

---

## 3. Production Verification
* **Vite Production Build**: `2,203 modules transformed → 0 errors` in `10.86s`.
* **Live Console**: Running at `http://localhost:5173/`.

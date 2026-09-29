import React, { useState, useEffect } from 'react';
import AntarcticScene from './components/map/AntarcticScene';
import TopBar from './components/navigation/TopBar';
import OpticsHUD from './components/map/OpticsHUD';
import EnvironmentPanel from './components/panels/EnvironmentPanel';
import DecisionIntelligencePanel from './components/panels/DecisionIntelligencePanel';
import BottomStatusBar from './components/panels/BottomStatusBar';
import VesselCockpitView from './components/vesselView/VesselCockpitView';
import WhatIfModal from './components/modals/WhatIfModal';
import { useOptics } from './context/OpticsContext';

/* ═══════════════════════════════════════════════════════════════
   polarX: AI-Enabled Antarctic Sea-Ice, Iceberg Trajectory,
          and Navigation Decision Support System

   Operational Mission Control Console
   ═══════════════════════════════════════════════════════════════ */

export default function App() {
  const [whatIfOpen, setWhatIfOpen] = useState(false);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(true);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(true);
  const { vesselViewActive, exitVesselView } = useOptics();

  // Global hotkeys: '[' for left drawer, ']' for right drawer, 'Escape' to exit vessel view
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === '[') setLeftDrawerOpen((prev) => !prev);
      if (e.key === ']') setRightDrawerOpen((prev) => !prev);
      if (e.key === 'Escape' && vesselViewActive) {
        exitVesselView();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [vesselViewActive, exitVesselView]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-transparent text-slate-900 font-sans">
      {/* ── 1. Central Hero: 3D Earth Globe & Antarctic Theater (70% Focus) ── */}
      <AntarcticScene />

      {/* ── 2. CONDITIONAL MODES: Vessel Cockpit View vs Global Strategic Overview ── */}
      {vesselViewActive ? (
        /* Dedicated 3D Boat Navigation / Cockpit View Overlay */
        <VesselCockpitView />
      ) : (
        /* Global Strategic Overview Layer */
        <>
          {/* Top Tactical Command Bar */}
          <TopBar onOpenWhatIf={() => setWhatIfOpen(true)} />

          {/* Floating Tactical Optics & Camera HUD */}
          <OpticsHUD />

          {/* Left Collapsible Drawer: Environmental Data Layers */}
          <EnvironmentPanel
            isOpen={leftDrawerOpen}
            onToggle={() => setLeftDrawerOpen((prev) => !prev)}
          />

          {/* Right Collapsible Drawer: Decision Intelligence */}
          <DecisionIntelligencePanel
            isOpen={rightDrawerOpen}
            onToggle={() => setRightDrawerOpen((prev) => !prev)}
          />

          {/* Bottom Navigation & Status Bar */}
          <BottomStatusBar />
        </>
      )}

      {/* ── 3. What-If Sensitivity Analysis Modal ── */}
      <WhatIfModal
        isOpen={whatIfOpen}
        onClose={() => setWhatIfOpen(false)}
      />
    </div>
  );
}

import React, { createContext, useContext, useState } from 'react';

const OpticsContext = createContext({
  mode: 'optical',
  setMode: () => {},
  activeCam: 'reset',
  setActiveCam: () => {},
  vesselViewActive: false,
  setVesselViewActive: () => {},
  enterVesselView: () => {},
  exitVesselView: () => {},
});

export const useOptics = () => useContext(OpticsContext);

export function OpticsProvider({ children }) {
  const [mode, setMode] = useState('optical');
  const [activeCam, setActiveCam] = useState('reset');
  const [vesselViewActive, setVesselViewActive] = useState(false);

  const enterVesselView = () => {
    setVesselViewActive(true);
    setActiveCam('chase');
    window.dispatchEvent(new CustomEvent('ice-camera-command', { detail: 'chase' }));
  };

  const exitVesselView = () => {
    setVesselViewActive(false);
    setActiveCam('reset');
    window.dispatchEvent(new CustomEvent('ice-camera-command', { detail: 'reset' }));
  };

  return (
    <OpticsContext.Provider
      value={{
        mode,
        setMode,
        activeCam,
        setActiveCam,
        vesselViewActive,
        setVesselViewActive,
        enterVesselView,
        exitVesselView,
      }}
    >
      {children}
    </OpticsContext.Provider>
  );
}

export default OpticsContext;

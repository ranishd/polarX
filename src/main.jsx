import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TelemetryProvider } from './context/TelemetryContext';
import { OpticsProvider } from './context/OpticsContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TelemetryProvider>
      <OpticsProvider>
        <App />
      </OpticsProvider>
    </TelemetryProvider>
  </React.StrictMode>
);

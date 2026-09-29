import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import FrostPanel from '../common/FrostPanel';

const agentOrder = ['iceNav', 'bergWatch', 'polarMet', 'propulsion', 'safety', 'commander'];

const statusToLed = {
  active:    'led-green',
  nominal:   'led-green',
  alert:     'led-red',
  caution:   'led-amber',
  deciding:  'led-cyan',
  enforcing: 'led-cyan',
};

const recToBadge = (rec) => {
  if (!rec) return 'badge-nominal';
  const r = rec.toUpperCase();
  if (r.includes('BLOCK')) return 'badge-alert';
  if (r.includes('EXPEDITE')) return 'badge-caution';
  return 'badge-nominal';
};

const PolarAgentDeck = () => {
  const { agents } = useTelemetry();

  if (!agents) return null;

  const agentList = agentOrder.map(key => agents[key] ? { key, ...agents[key] } : null).filter(Boolean);
  const concurCount = agentList.filter(a => {
    const r = (a.recommendation || '').toUpperCase();
    return r.includes('BRAVO') || r.includes('APPROVE') || r.includes('EXECUTE');
  }).length;

  return (
    <div className="absolute right-0 top-[80px] bottom-[200px] w-[320px] z-40 p-3 overflow-y-auto animate-slide-in-right">
      <FrostPanel title="DECISION INTELLIGENCE" className="h-full flex flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1 pb-3">
          {agentList.map((agent) => {
            const isCommander = agent.key === 'commander';
            const ledClass = statusToLed[agent.status] || 'led-green';

            let confColor = 'bg-cryo-teal';
            if (agent.confidence < 0.5) confColor = 'bg-cryo-red';
            else if (agent.confidence < 0.8) confColor = 'bg-cryo-amber';

            return (
              <div
                key={agent.key}
                className={`p-3 rounded-xl border transition-all duration-300 ${
                  isCommander
                    ? 'frost-panel-accent shadow-cryo-glow'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{agent.icon}</span>
                    <span className={`text-sm font-bold tracking-wide ${isCommander ? 'text-gradient-ice' : 'text-slate-700'}`}>
                      {agent.name}
                    </span>
                  </div>
                  <span className={ledClass}></span>
                </div>

                {/* Confidence Bar */}
                <div className="w-full h-1 bg-slate-200/50 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full ${confColor} transition-all duration-700 rounded-full`}
                    style={{ width: `${Math.round(agent.confidence * 100)}%` }}
                  />
                </div>

                {/* Assessment */}
                <p className="text-xs text-slate-500 line-clamp-3 mb-2 leading-relaxed">
                  {agent.assessment}
                </p>

                {/* Footer */}
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] ${recToBadge(agent.recommendation)}`}>
                    {agent.recommendation}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">{agent.lastUpdate}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CONSENSUS */}
        <div className="mt-3 pt-3 border-t border-slate-200/30 shrink-0">
          <div className="flex flex-col items-center justify-center p-3 frost-panel-accent rounded-xl">
            <span className="badge-nominal text-sm font-bold px-4 py-1">
              CONSENSUS: ROUTE BRAVO
            </span>
            <span className="text-xs text-slate-500 font-mono tracking-widest mt-1.5">
              {concurCount}/{agentList.length} AGENTS CONCUR
            </span>
          </div>
        </div>
      </FrostPanel>
    </div>
  );
};

export default PolarAgentDeck;

import React from 'react';
import { ShieldCheck, AlertOctagon, Activity } from 'lucide-react';
import { useSafetyStore } from '../../store/useSafetyStore';
import { getRiskCategory } from '../../utils/formatters';

export const SafetyPulseWidget = ({ onSimulateDanger }) => {
  const { currentRiskScore, escalationState } = useSafetyStore();
  const riskInfo = getRiskCategory(currentRiskScore);

  return (
    <div className="w-full glass-card p-4 flex items-center justify-between border border-white/10 shadow-xl">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-2xl ${
          escalationState === 'NORMAL' ? 'bg-indigo-500/20 text-indigo-400 pulse-primary' : 'bg-rose-500/20 text-rose-400 pulse-danger'
        }`}>
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">AI Safety Pulse</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-xs text-gray-400">Continuous 1Hz Geofence Tracking Active</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 text-xs font-mono font-bold rounded-full border ${riskInfo.badgeClass}`}>
          Score: {currentRiskScore}/100
        </span>
        <button
          onClick={onSimulateDanger}
          className="px-3 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1"
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          Simulate Danger Zone
        </button>
      </div>
    </div>
  );
};

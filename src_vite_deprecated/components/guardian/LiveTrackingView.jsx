import React from 'react';
import { ShieldAlert, Battery, MapPin, Eye, Phone, Navigation } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { useRouteStore } from '../../store/useRouteStore';

export const LiveTrackingView = ({ onClose }) => {
  const { user } = useUserStore();
  const { origin, destination } = useRouteStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <div className="w-full max-w-xl p-6 rounded-3xl glass-card border border-indigo-500/30 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Guardian Live Tracking Dashboard</h2>
              <p className="text-xs text-indigo-300">Live Journey Stream • Encrypted Session</p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-mono rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Live Stream Active
          </span>
        </div>

        {/* User Status Header */}
        <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={user.avatar} alt={user.fullName} className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500" />
            <div>
              <h3 className="font-bold text-white text-sm">{user.fullName}</h3>
              <p className="text-xs text-gray-400 flex items-center gap-2">
                <span>Speed: 4.2 km/h (Walking)</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400 font-mono">
                  <Battery className="w-3.5 h-3.5" /> 84% Battery
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => window.open(`tel:${user.phoneNumber}`)}
            className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
          >
            <Phone className="w-5 h-5" />
          </button>
        </div>

        {/* AI Explainable Context Card (USP Requirement) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/60 to-slate-950/60 border border-rose-500/30 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <Eye className="w-4 h-4" />
            AI Threat Rationale & Route Context
          </div>
          <p className="text-xs text-gray-200 leading-relaxed font-sans">
            "Ananya deviated onto 4th Street Alley at 11:14 PM. Area has 14 verified late-night harassment reports, zero active municipal streetlights, and deserted commercial foot traffic."
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-gray-300 pt-1">
            <div className="p-2 rounded-xl bg-black/40 border border-white/5">
              <span className="text-gray-400">Current Risk Index:</span> <span className="text-rose-400 font-bold">78/100 (High)</span>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/5">
              <span className="text-gray-400">Est. Arrival:</span> <span className="text-emerald-400 font-bold">11:42 PM</span>
            </div>
          </div>
        </div>

        {/* Route Details */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong className="text-white">Origin:</strong> {origin.name}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Navigation className="w-4 h-4 text-indigo-400 shrink-0" />
            <span><strong className="text-white">Destination:</strong> {destination.name}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/10"
        >
          Close Live View
        </button>
      </div>
    </div>
  );
};

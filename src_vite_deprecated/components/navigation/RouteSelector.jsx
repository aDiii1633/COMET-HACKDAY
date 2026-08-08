import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Navigation, Clock, Eye } from 'lucide-react';
import { useRouteStore } from '../../store/useRouteStore';
import { formatDistance, formatDuration, getRiskCategory } from '../../utils/formatters';
import { triggerHaptic } from '../../utils/hapticManager';

export const RouteSelector = ({ onStartNavigation, onOpenXaiModal }) => {
  const { routes, selectedRouteId, setSelectedRouteId, futureRiskMinutes } = useRouteStore();

  const handleSelectRoute = (id) => {
    triggerHaptic('light');
    setSelectedRouteId(id);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <Navigation className="w-5 h-5 text-indigo-400" />
          AI SafeRoute Recommendations
        </h2>
        {futureRiskMinutes > 0 && (
          <span className="px-2.5 py-1 text-xs font-mono rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Forecast +{futureRiskMinutes}m
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {routes.map((route) => {
          const isSelected = route.id === selectedRouteId;
          const riskInfo = getRiskCategory(route.riskScore);
          const isSafe = route.riskScore <= 30;

          return (
            <motion.div
              key={route.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectRoute(route.id)}
              className={`p-4 rounded-2xl transition-all cursor-pointer border ${
                isSelected
                  ? isSafe
                    ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                    : 'bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-500/10'
                  : 'glass-card border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {isSafe ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                    )}
                    <h3 className="font-semibold text-white text-sm">{route.name}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDuration(route.durationSeconds)}
                    </span>
                    <span>•</span>
                    <span>{formatDistance(route.distanceMeters)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-full border ${riskInfo.badgeClass}`}>
                    Risk: {route.riskScore}/100
                  </span>
                </div>
              </div>

              {/* XAI Summary Box */}
              <div className="mt-3 p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-300 flex items-start gap-2">
                <Eye className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{route.xaiSummary}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onOpenXaiModal}
          className="flex-1 py-3 px-4 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/10 backdrop-blur-md flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4 text-indigo-400" />
          Explain AI Risk Factors
        </button>
        <button
          onClick={onStartNavigation}
          className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/30 flex items-center justify-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          Start SafeRoute
        </button>
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, ShieldAlert, PhoneCall, CheckCircle2 } from 'lucide-react';
import { useSafetyStore } from '../../store/useSafetyStore';
import { triggerHaptic } from '../../utils/hapticManager';

export const EscalationCountdown = ({ onCancel, onAlertDispatched }) => {
  const { escalationState, countdownSeconds, decrementCountdown, setEscalationState } = useSafetyStore();

  useEffect(() => {
    if (escalationState !== 'LEVEL2_ESCALATION') return;

    triggerHaptic('danger_level2');

    const timer = setInterval(() => {
      decrementCountdown();
    }, 1000);

    return () => clearInterval(timer);
  }, [escalationState]);

  useEffect(() => {
    if (countdownSeconds <= 0 && escalationState === 'LEVEL2_ESCALATION') {
      setEscalationState('ALERT_SENT');
      if (onAlertDispatched) onAlertDispatched();
    }
  }, [countdownSeconds, escalationState]);

  if (escalationState === 'NORMAL') return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Dark Translucent Red Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative z-10 w-full max-w-md p-6 rounded-3xl bg-gradient-to-b from-rose-950/90 to-slate-950/95 border border-rose-500/40 text-center shadow-2xl space-y-6"
        >
          {escalationState === 'LEVEL2_ESCALATION' ? (
            <>
              <div className="mx-auto w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center pulse-danger">
                <AlertOctagon className="w-10 h-10 text-rose-500" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Level 2 Danger Escalation
                </span>
                <h2 className="text-2xl font-bold text-white tracking-wide pt-2">Approaching Unsafe Zone</h2>
                <p className="text-xs text-gray-300">
                  AI detected high incident density ahead. Guardian notification dispatches in:
                </p>
              </div>

              {/* Countdown Timer Display */}
              <div className="py-4">
                <span className="text-6xl font-extrabold font-mono text-rose-500 tracking-tight">
                  {countdownSeconds}s
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={onCancel}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-sm font-bold text-white shadow-xl shadow-emerald-500/20 border border-emerald-400/30 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  I Am Safe — Cancel Alert
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto w-20 h-20 rounded-full bg-indigo-500/20 border-2 border-indigo-500 flex items-center justify-center">
                <ShieldAlert className="w-10 h-10 text-indigo-400" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Guardian Alert Dispatched</h2>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Rich AI Context Payload & live tracking location successfully broadcast to your Guardian Circle.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-left space-y-2 text-xs font-mono text-gray-300">
                <p><span className="text-indigo-400">Context:</span> Approaching 4th Street Alley Corridor</p>
                <p><span className="text-indigo-400">Risk Drivers:</span> 14 Incidents, Unlit (12% lighting)</p>
                <p><span className="text-indigo-400">Recipients:</span> Rajesh Sharma (Father), Priya Sharma (Sister)</p>
              </div>

              <button
                onClick={onCancel}
                className="w-full py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/10"
              >
                Close Notification Window
              </button>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

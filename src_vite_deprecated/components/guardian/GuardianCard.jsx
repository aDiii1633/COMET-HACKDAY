import React from 'react';
import { Users, UserPlus, Phone, ShieldCheck } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { triggerHaptic } from '../../utils/hapticManager';

export const GuardianCard = ({ onAddGuardian }) => {
  const { user } = useUserStore();

  return (
    <div className="w-full glass-card p-5 space-y-4 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white tracking-wide">AI Guardian Circle</h3>
        </div>
        <button
          onClick={() => {
            triggerHaptic('light');
            onAddGuardian();
          }}
          className="p-2 rounded-full bg-white/10 hover:bg-white/15 text-indigo-400 border border-white/10 transition-all"
          aria-label="Add Guardian"
        >
          <UserPlus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {user.guardians.map((guardian) => (
          <div
            key={guardian.guardianId}
            className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center font-bold text-xs text-indigo-300">
                {guardian.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">{guardian.name}</h4>
                <p className="text-[11px] text-gray-400">{guardian.relation} • {guardian.phoneNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Active
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

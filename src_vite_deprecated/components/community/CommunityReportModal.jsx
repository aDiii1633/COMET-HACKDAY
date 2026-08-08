import React, { useState } from 'react';
import { AlertCircle, LightbulbOff, MessageSquareWarning, EyeOff, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useSafetyStore } from '../../store/useSafetyStore';
import { useRouteStore } from '../../store/useRouteStore';
import { getH3Index } from '../../utils/h3Helpers';
import { triggerHaptic } from '../../utils/hapticManager';

export const CommunityReportModal = ({ isOpen, onClose }) => {
  const { origin } = useRouteStore();
  const { addCommunityReport } = useSafetyStore();

  const [category, setCategory] = useState('POOR_LIGHTING');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const categories = [
    { id: 'POOR_LIGHTING', label: 'Broken Lighting', icon: LightbulbOff, severity: 3, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
    { id: 'HARASSMENT_HOTSPOT', label: 'Verbal Harassment', icon: MessageSquareWarning, severity: 4, color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
    { id: 'SUSPICIOUS_ACTIVITY', label: 'Suspicious Activity', icon: EyeOff, severity: 3, color: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10' },
    { id: 'PHYSICAL_HAZARD', label: 'Physical Assault / Hazard', icon: ShieldAlert, severity: 5, color: 'text-rose-500 border-rose-500/60 bg-rose-500/20' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    triggerHaptic('medium');
    setIsSubmitting(true);

    const h3Index = getH3Index(origin.latitude, origin.longitude);

    setTimeout(() => {
      const newReport = {
        reportId: `rep_${Date.now()}`,
        category,
        severity: categories.find((c) => c.id === category)?.severity || 3,
        description: description || 'User reported spatial hazard.',
        latitude: origin.latitude,
        longitude: origin.longitude,
        h3Index,
        timestamp: new Date().toISOString(),
        verificationCount: 1,
        status: 'VERIFIED'
      };

      addCommunityReport(newReport);
      setIsSubmitting(false);
      setSubmittedSuccess(true);

      setTimeout(() => {
        setSubmittedSuccess(false);
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Community Safety Telemetry">
      {submittedSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Report Logged & Verified</h3>
          <p className="text-xs text-gray-300">
            Spatial H3 risk index updated in real-time. Community safety score recalculated.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Select Incident Category</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setCategory(cat.id);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-2 ${
                      isSelected
                        ? cat.color
                        : 'glass-card border-white/10 hover:border-white/20 text-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-semibold">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Additional Context (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Streetlights out for 2 blocks behind transit stop..."
              rows={3}
              className="w-full p-3 rounded-2xl bg-black/50 border border-white/10 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30"
            >
              {isSubmitting ? 'Updating Spatial Risk Index...' : 'Submit Incident Report'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

/**
 * Utility functions for formatting risk scores, colors, distance, and time.
 */

export const getRiskCategory = (score) => {
  if (score <= 30) return { label: 'Low Risk (Safe)', level: 'SAFE', color: '#10B981', badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
  if (score <= 60) return { label: 'Moderate Risk', level: 'WARNING', color: '#F59E0B', badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
  return { label: 'High Risk (Danger)', level: 'DANGER', color: '#EF4444', badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
};

export const formatDistance = (meters) => {
  if (!meters) return '0 m';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

export const formatDuration = (seconds) => {
  if (!seconds) return '0 min';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} mins`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs} hr ${remMins} mins`;
};

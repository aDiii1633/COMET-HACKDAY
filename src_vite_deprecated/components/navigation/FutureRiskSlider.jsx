import React from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { useRouteStore } from '../../store/useRouteStore';
import { triggerHaptic } from '../../utils/hapticManager';

export const FutureRiskSlider = () => {
  const { futureRiskMinutes, setFutureRiskMinutes } = useRouteStore();

  const timeOffsets = [0, 15, 30, 45, 60];

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    triggerHaptic('light');
    setFutureRiskMinutes(val);
  };

  return (
    <div className="w-full glass-card p-4 space-y-3 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-white tracking-wide uppercase">AI Future Risk Forecast</span>
        </div>
        <span className="text-xs font-mono text-indigo-300 font-semibold flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {futureRiskMinutes === 0 ? 'Current Live Risk' : `+${futureRiskMinutes} Minutes Forecast`}
        </span>
      </div>

      {/* Timeline Slider Track */}
      <div className="relative pt-2 pb-1">
        <input
          type="range"
          min="0"
          max="60"
          step="15"
          value={futureRiskMinutes}
          onChange={handleSliderChange}
          className="w-full h-2 bg-slate-800/80 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          aria-label="AI Future Risk Prediction Timeline Slider"
        />

        {/* Quarter-Hour Tick Markers */}
        <div className="flex justify-between text-[11px] font-mono text-gray-400 pt-2">
          {timeOffsets.map((offset) => (
            <span
              key={offset}
              onClick={() => {
                triggerHaptic('light');
                setFutureRiskMinutes(offset);
              }}
              className={`cursor-pointer transition-colors ${
                futureRiskMinutes === offset ? 'text-indigo-400 font-bold' : 'hover:text-gray-200'
              }`}
            >
              {offset === 0 ? 'NOW' : `+${offset}m`}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

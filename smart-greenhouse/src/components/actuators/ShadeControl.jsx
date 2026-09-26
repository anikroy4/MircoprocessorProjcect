import { useState } from 'react';
import { Sun, Loader2 } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';
import { formatRelativeTime } from '../../utils/formatters.js';

export default function ShadeControl({ device, onSetPosition, isControlling, loading }) {
  const currentValue = device?.value ?? 45;
  const [sliderValue, setSliderValue] = useState(currentValue);

  if (loading || !device) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
        <div className="w-32 h-5 bg-gray-100 rounded mb-4" />
        <div className="w-full h-3 bg-gray-100 rounded-full mb-4" />
        <div className="w-full h-10 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  const isAuto = device.mode === 'AUTO';

  const handleApply = () => {
    onSetPosition(sliderValue);
  };

  const pct = Math.round(sliderValue);

  // Shade visual: 0% = fully open (bright), 100% = fully closed (dark)
  const shadingOpacity = sliderValue / 100;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Sun size={22} className="text-amber-500" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">Shade Motor</h3>
            {isControlling && <Loader2 size={14} className="text-green-500 animate-spin" />}
          </div>
          <div className="flex gap-2">
            <StatusBadge status={device.status === 'ON' ? 'on' : 'off'} label={device.status} size="xs" />
            <StatusBadge status={isAuto ? 'auto' : 'manual'} label={isAuto ? 'AUTO' : 'MANUAL'} size="xs" />
          </div>
        </div>
      </div>

      {/* Visual shade indicator */}
      <div className="mb-5 bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">Open (0%)</span>
          <span className="text-xs text-gray-500">Closed (100%)</span>
        </div>
        {/* Shade bar */}
        <div className="relative w-full h-8 bg-yellow-100 rounded-lg overflow-hidden border border-yellow-200">
          <div
            className="absolute inset-y-0 left-0 bg-gray-700 rounded-lg transition-all duration-300"
            style={{ width: `${sliderValue}%`, opacity: 0.7 + shadingOpacity * 0.3 }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-white drop-shadow">{pct}% Closed</span>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Set Position</label>
          <span className="text-sm font-bold text-green-700">{pct}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-green-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0% Open</span>
          <span>50%</span>
          <span>100% Closed</span>
        </div>
      </div>

      {/* Quick presets */}
      <div className="flex gap-2 mb-4">
        {[0, 25, 50, 75, 100].map((v) => (
          <button
            key={v}
            onClick={() => setSliderValue(v)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              sliderValue === v
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-green-400'
            }`}
          >
            {v}%
          </button>
        ))}
      </div>

      {/* Apply button */}
      <button
        onClick={handleApply}
        disabled={isControlling}
        className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isControlling ? <Loader2 size={14} className="animate-spin" /> : null}
        Apply Position
      </button>

      {/* Info */}
      <p className="text-xs text-gray-400 text-center mt-2">
        Last updated: {formatRelativeTime(device.updated_at)}
        {isAuto && ' • Controller managed in AUTO mode'}
      </p>
    </div>
  );
}

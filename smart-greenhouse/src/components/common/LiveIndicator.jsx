import { Activity } from 'lucide-react';

/**
 * Live Indicator - Shows a pulsing dot to indicate real-time data updates
 */
export default function LiveIndicator({ 
  label = 'Live', 
  size = 'sm',
  className = '' 
}) {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
  };

  const dotSize = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} ${className}`}>
      <div className="relative">
        <div className={`${dotSize[size]} bg-green-500 rounded-full animate-pulse`} />
        <div className={`${dotSize[size]} bg-green-400 rounded-full absolute top-0 left-0 animate-ping opacity-75`} />
      </div>
      <span className="text-green-600 font-medium">{label}</span>
      <Activity size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} className="text-green-500" />
    </div>
  );
}

/**
 * Data Update Indicator - Shows last update time with live status
 */
export function DataUpdateIndicator({ 
  lastUpdated, 
  isLive = true,
  label = 'Auto-updating'
}) {
  if (!isLive) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-gray-400">
        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
        <span>Updates paused</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 text-xs">
      <LiveIndicator size="xs" label={label} />
      {lastUpdated && (
        <span className="text-gray-400">
          • {new Date(lastUpdated).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

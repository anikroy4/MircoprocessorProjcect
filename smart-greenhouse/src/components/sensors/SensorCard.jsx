import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';
import { formatRelativeTime } from '../../utils/formatters.js';

export default function SensorCard({
  icon: Icon,
  label,
  value,
  unit,
  status,
  statusLabel,
  lastUpdated,
  trend,
  iconBg = 'bg-green-100',
  iconColor = 'text-green-600',
  loading = false,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-xl" />
          <div className="w-16 h-5 bg-gray-100 rounded-full" />
        </div>
        <div className="w-24 h-8 bg-gray-100 rounded-lg mb-2" />
        <div className="w-32 h-4 bg-gray-100 rounded mb-3" />
        <div className="w-20 h-3 bg-gray-100 rounded" />
      </div>
    );
  }

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-red-500' : trend < 0 ? 'text-blue-500' : 'text-gray-400';

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 group">
      {/* Icon + Status */}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
          {Icon && <Icon size={20} className={iconColor} />}
        </div>
        <StatusBadge status={status} label={statusLabel} size="xs" />
      </div>

      {/* Value */}
      <div className="flex items-end gap-1 mb-1">
        <span className="text-3xl font-bold text-gray-900 leading-none">
          {value !== null && value !== undefined ? value : '—'}
        </span>
        {unit && <span className="text-sm text-gray-500 mb-0.5">{unit}</span>}
        {trend !== undefined && trend !== null && (
          <TrendIcon size={16} className={`ml-auto mb-0.5 ${trendColor}`} />
        )}
      </div>

      {/* Label */}
      <p className="text-gray-600 text-sm font-medium mb-3">{label}</p>

      {/* Last updated */}
      <p className="text-gray-400 text-xs">
        Updated {formatRelativeTime(lastUpdated)}
      </p>
    </div>
  );
}

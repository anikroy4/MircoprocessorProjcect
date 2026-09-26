import { getStatusBadgeClass } from '../../utils/formatters.js';

export default function StatusBadge({ status, label, size = 'sm', dot = true }) {
  const cls = getStatusBadgeClass(status);
  const sizeClass = size === 'xs' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1';

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${sizeClass} ${cls}`}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            status === 'online' || status === 'connected' || status === 'normal' || status === 'on' || status === 'good'
              ? 'bg-green-500'
              : status === 'warning' || status === 'moderate' || status === 'dry' || status === 'wet'
              ? 'bg-yellow-500'
              : status === 'critical' || status === 'offline' || status === 'disconnected' || status === 'poor'
              ? 'bg-red-500'
              : status === 'auto' || status === 'info'
              ? 'bg-blue-500'
              : status === 'manual'
              ? 'bg-purple-500'
              : 'bg-gray-400'
          }`}
        />
      )}
      {label || status}
    </span>
  );
}

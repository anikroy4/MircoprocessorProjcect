import StatusBadge from '../common/StatusBadge.jsx';
import { formatRelativeTime } from '../../utils/formatters.js';

export default function SystemStatusCard({ icon: Icon, label, status, detail, lastUpdate, iconBg, iconColor }) {
  const isConnected = status === 'connected' || status === 'online';
  const isError = status === 'disconnected' || status === 'offline' || status === 'error';

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${
      isConnected ? 'border-green-100' : isError ? 'border-red-100' : 'border-gray-100'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 ${iconBg || (isConnected ? 'bg-green-100' : isError ? 'bg-red-100' : 'bg-gray-100')} rounded-xl flex items-center justify-center flex-shrink-0`}>
          {Icon && (
            <Icon size={22} className={iconColor || (isConnected ? 'text-green-600' : isError ? 'text-red-500' : 'text-gray-400')} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-gray-900">{label}</h3>
            <StatusBadge
              status={isConnected ? 'online' : isError ? 'offline' : 'warning'}
              label={status ? (status.charAt(0).toUpperCase() + status.slice(1)) : '—'}
              size="xs"
            />
          </div>
          {detail && <p className="text-sm text-gray-500 mb-1">{detail}</p>}
          {lastUpdate && (
            <p className="text-xs text-gray-400">Last seen: {formatRelativeTime(lastUpdate)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

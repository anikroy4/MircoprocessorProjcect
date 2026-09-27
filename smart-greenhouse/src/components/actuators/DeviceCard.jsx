import { Loader2, Power, PowerOff, Settings } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';
import { formatRelativeTime } from '../../utils/formatters.js';
import { DEVICE_LABELS } from '../../utils/constants.js';

export default function DeviceCard({
  device,
  icon: Icon,
  iconBg = 'bg-green-100',
  iconColor = 'text-green-600',
  onTurnOn,
  onTurnOff,
  onSetAuto,
  isControlling = false,
  loading = false,
}) {
  if (loading || !device) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gray-100 rounded-xl" />
          <div className="flex-1">
            <div className="w-28 h-4 bg-gray-100 rounded mb-2" />
            <div className="w-16 h-3 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="w-full h-10 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  const isOn = device.status === 'ON';
  const isAuto = device.mode === 'AUTO';
  const name = DEVICE_LABELS[device.device] || device.device;

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border transition-all duration-200 ${
      isOn ? 'border-green-200 shadow-green-100' : 'border-gray-100'
    }`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isOn ? 'bg-green-100' : 'bg-gray-100'
        }`}>
          {Icon && (
            <Icon size={22} className={isOn ? 'text-green-600' : 'text-gray-400'} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-gray-900">{name}</h3>
            {isControlling && (
              <Loader2 size={14} className="text-green-500 animate-spin" />
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={isOn ? 'on' : 'off'} label={isOn ? 'ON' : 'OFF'} size="xs" />
            <StatusBadge status={isAuto ? 'auto' : 'manual'} label={isAuto ? 'AUTO' : 'MANUAL'} size="xs" />
          </div>
        </div>
      </div>

      {/* Last action */}
      <div className="mb-4 bg-gray-50 rounded-xl p-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Last updated</span>
          <span>{formatRelativeTime(device.updated_at)}</span>
        </div>
        {device.value !== null && device.value !== undefined && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Position</span>
            <span className="font-medium text-gray-700">{device.value}%</span>
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Mode</span>
          <span className={`font-medium ${isAuto ? 'text-blue-600' : 'text-purple-600'}`}>
            {isAuto ? '⚙ Controller managed' : '✋ User managed'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={onTurnOn}
          disabled={isControlling || (isOn && !isAuto)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isOn && !isAuto
              ? 'bg-green-600 text-white shadow-sm shadow-green-200 cursor-default'
              : 'bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border border-green-200'
          } disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          <Power size={14} />
          ON
        </button>
        <button
          onClick={onTurnOff}
          disabled={isControlling}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            !isOn && !isAuto
              ? 'bg-gray-200 text-gray-600 cursor-default'
              : 'bg-gray-100 text-gray-700 hover:bg-red-600 hover:text-white border border-gray-200'
          } disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          <PowerOff size={14} />
          OFF
        </button>
      </div>

      {/* AUTO Mode Button */}
      {!isAuto && (
        <button
          onClick={onSetAuto}
          disabled={isControlling}
          className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Settings size={14} />
          SET AUTO
        </button>
      )}
    </div>
  );
}

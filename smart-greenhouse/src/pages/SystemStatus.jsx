import { Cpu, Wifi, Database, Server, Radio, RefreshCw } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import SystemStatusCard from '../components/system/SystemStatusCard.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { useSystemStatus } from '../hooks/useSystemStatus.js';
import { formatTimestamp, formatRelativeTime } from '../utils/formatters.js';

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium text-gray-800 ${mono ? 'font-mono' : ''}`}>
        {value ?? '—'}
      </span>
    </div>
  );
}

export default function SystemStatus() {
  const { status, loading, error, isOnline, refetch } = useSystemStatus();

  const statusItems = [
    {
      key: 'arduino',
      label: 'Arduino Mega',
      icon: Cpu,
      status: status?.arduino_status || 'disconnected',
      detail: 'Main hardware controller — UART communication',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      key: 'esp8266',
      label: 'ESP8266 Wi-Fi Module',
      icon: Radio,
      status: status?.esp8266_status || 'disconnected',
      detail: status?.esp8266_ip ? `IP: ${status.esp8266_ip}` : 'Wi-Fi bridge module',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      key: 'wifi',
      label: 'Wi-Fi Network',
      icon: Wifi,
      status: status?.wifi_status || 'disconnected',
      detail: status?.wifi_signal ? `Signal: ${status.wifi_signal} dBm` : 'Wireless network connection',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
    },
    {
      key: 'backend',
      label: 'Backend API',
      icon: Server,
      status: status?.backend_status || 'offline',
      detail: 'Node.js / Express server',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      key: 'database',
      label: 'MySQL Database',
      icon: Database,
      status: status?.database_status || 'disconnected',
      detail: 'Sensor readings & actuator logs storage',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  if (loading && !status) {
    return (
      <Layout title="System Status" subtitle="Hardware and software component health">
        <div className="max-w-4xl space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse h-24" />
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="System Status" subtitle="Hardware and software component health">
      <div className="max-w-4xl space-y-6">
        {/* Overall status */}
        <div className={`rounded-2xl p-5 border flex items-center gap-4 ${
          isOnline ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
            isOnline ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <span className={`text-2xl ${isOnline ? '' : ''}`}>{isOnline ? '✅' : '❌'}</span>
          </div>
          <div className="flex-1">
            <h2 className={`font-bold text-lg ${isOnline ? 'text-green-800' : 'text-red-800'}`}>
              System {isOnline ? 'Operational' : 'Offline'}
            </h2>
            <p className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {isOnline
                ? 'All critical components are connected and functioning normally.'
                : 'One or more critical components are offline. Check connections.'}
            </p>
          </div>
          <button
            onClick={refetch}
            className="p-2.5 rounded-xl bg-white/60 hover:bg-white transition-colors"
          >
            <RefreshCw size={16} className="text-gray-600" />
          </button>
        </div>

        {error && <ErrorState message={error} onRetry={refetch} compact />}

        {/* Component status cards */}
        <section>
          <h2 className="font-semibold text-gray-800 mb-3">Component Status</h2>
          <div className="space-y-3">
            {statusItems.map((item) => (
              <SystemStatusCard
                key={item.key}
                icon={item.icon}
                label={item.label}
                status={item.status}
                detail={item.detail}
                lastUpdate={status?.last_update}
                iconBg={item.iconBg}
                iconColor={item.iconColor}
              />
            ))}
          </div>
        </section>

        {/* Detailed info */}
        {status && (
          <section>
            <h2 className="font-semibold text-gray-800 mb-3">Diagnostics</h2>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <InfoRow label="ESP8266 IP Address" value={status.esp8266_ip} mono />
              <InfoRow
                label="Wi-Fi Signal Strength"
                value={status.wifi_signal ? `${status.wifi_signal} dBm` : '—'}
              />
              <InfoRow
                label="Last Sensor Update"
                value={formatTimestamp(status.last_sensor_update)}
              />
              <InfoRow
                label="Last Actuator Update"
                value={formatTimestamp(status.last_actuator_update)}
              />
              <InfoRow
                label="Last System Check"
                value={`${formatTimestamp(status.last_update)} (${formatRelativeTime(status.last_update)})`}
              />
            </div>
          </section>
        )}

        {/* Architecture note */}
        <section>
          <h2 className="font-semibold text-gray-800 mb-3">System Architecture</h2>
          <div className="bg-gray-900 rounded-2xl p-5">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {[
                { label: 'Sensors', color: 'bg-green-500' },
                { label: '→', color: '' },
                { label: 'Arduino Mega', color: 'bg-blue-500' },
                { label: '→ UART →', color: '' },
                { label: 'ESP8266', color: 'bg-green-500' },
                { label: '→ Wi-Fi →', color: '' },
                { label: 'Backend API', color: 'bg-purple-500' },
                { label: '→', color: '' },
                { label: 'MySQL', color: 'bg-orange-500' },
                { label: '→', color: '' },
                { label: 'React Dashboard', color: 'bg-sky-500' },
              ].map((item, i) => (
                item.color ? (
                  <span key={i} className={`${item.color} text-white px-2.5 py-1 rounded-lg text-xs font-medium`}>
                    {item.label}
                  </span>
                ) : (
                  <span key={i} className="text-gray-400 text-xs">{item.label}</span>
                )
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-3">
              React dashboard communicates exclusively with the Backend API. Hardware is never directly controlled from the browser.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}

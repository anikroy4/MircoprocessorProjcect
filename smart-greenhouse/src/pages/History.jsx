import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import DataTable from '../components/common/DataTable.jsx';
import DateRangeFilter from '../components/common/DateRangeFilter.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import ConfirmModal from '../components/common/ConfirmModal.jsx';
import Toast from '../components/common/Toast.jsx';
import { 
  getSensorReadings, 
  getActuatorHistory,
  deleteSensorReading,
  deleteActuatorLog
} from '../services/api.js';
import { formatTimestamp, formatValue } from '../utils/formatters.js';
import { DEVICE_LABELS } from '../utils/constants.js';

const TABS = [
  { key: 'sensors',   label: 'Sensor History' },
  { key: 'actuators', label: 'Actuator History' },
];

// ── Sensor History Tab ────────────────────────────────────────────────────────
function SensorHistoryTab() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const PAGE_SIZE = 15;

  const fetchData = async (p, from, to) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSensorReadings({ page: p, pageSize: PAGE_SIZE, dateFrom: from, dateTo: to });
      setData(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err.message || 'Failed to load sensor history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(page, dateFrom, dateTo); 
  }, [page, dateFrom, dateTo]);

  const handleDelete = async () => {
    try {
      await deleteSensorReading(deleteTarget);
      setToast({ type: 'success', message: 'Sensor reading deleted successfully.' });
      fetchData(page, dateFrom, dateTo);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete sensor reading.' });
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      key: 'created_at',
      label: 'Timestamp',
      render: (v) => <span className="text-gray-600 text-xs">{formatTimestamp(v)}</span>,
    },
    {
      key: 'temperature',
      label: 'Temp (°C)',
      render: (v) => <span className="font-medium">{formatValue(v)}</span>,
    },
    {
      key: 'humidity',
      label: 'Humidity (%)',
      render: (v) => <span className="font-medium">{formatValue(v)}</span>,
    },
    {
      key: 'soil_moisture',
      label: 'Soil (%)',
      render: (v) => <span className="font-medium">{formatValue(v)}</span>,
    },
    {
      key: 'air_quality',
      label: 'AQI',
      render: (v) => <span className="font-medium">{formatValue(v)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (v, row) => (
        <button
          onClick={() => {
            setDeleteTarget(row.id);
            setShowDeleteModal(true);
          }}
          className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DateRangeFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={(v) => { setDateFrom(v); setPage(1); }}
        onDateToChange={(v) => { setDateTo(v); setPage(1); }}
        onReset={() => { setDateFrom(''); setDateTo(''); setPage(1); }}
      />
      {error && <ErrorState message={error} onRetry={() => fetchData(page, dateFrom, dateTo)} compact />}
      <DataTable
        columns={columns}
        data={data}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        loading={loading}
      />
      {showDeleteModal && (
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete Sensor Reading"
          message="Are you sure you want to delete this sensor reading? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteTarget(null);
          }}
        />
      )}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// ── Actuator History Tab ──────────────────────────────────────────────────────
function ActuatorHistoryTab() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const PAGE_SIZE = 15;

  const fetchData = async (p, from, to, device) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getActuatorHistory({ page: p, pageSize: PAGE_SIZE, dateFrom: from, dateTo: to, device });
      setData(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err.message || 'Failed to load actuator history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(page, dateFrom, dateTo, deviceFilter); 
  }, [page, dateFrom, dateTo, deviceFilter]);

  const handleDelete = async () => {
    try {
      await deleteActuatorLog(deleteTarget);
      setToast({ type: 'success', message: 'Actuator log deleted successfully.' });
      fetchData(page, dateFrom, dateTo, deviceFilter);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete actuator log.' });
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const filteredDeviceLabels = Object.entries(DEVICE_LABELS).filter(
    ([key]) => key !== 'shade_motor'
  );

  const columns = [
    {
      key: 'created_at',
      label: 'Timestamp',
      render: (v) => <span className="text-gray-600 text-xs">{formatTimestamp(v)}</span>,
    },
    {
      key: 'device',
      label: 'Device',
      render: (v) => <span className="font-medium">{DEVICE_LABELS[v] || v}</span>,
    },
    {
      key: 'action',
      label: 'Action',
      render: (v) => (
        <span className={`font-semibold ${
          v === 'ON' ? 'text-green-700' : v === 'OFF' ? 'text-gray-600' : 'text-blue-600'
        }`}>
          {v}
        </span>
      ),
    },
    {
      key: 'mode',
      label: 'Mode',
      render: (v) => (
        <StatusBadge status={v === 'AUTO' ? 'auto' : 'manual'} label={v} size="xs" dot={false} />
      ),
    },
    {
      key: 'source',
      label: 'Source',
      render: (v) => <span className="text-gray-500 text-xs">{v || '—'}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (v, row) => (
        <button
          onClick={() => {
            setDeleteTarget(row.id);
            setShowDeleteModal(true);
          }}
          className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <DateRangeFilter
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={(v) => { setDateFrom(v); setPage(1); }}
          onDateToChange={(v) => { setDateTo(v); setPage(1); }}
          onReset={() => { setDateFrom(''); setDateTo(''); setPage(1); }}
        />
        <select
          value={deviceFilter}
          onChange={(e) => { setDeviceFilter(e.target.value); setPage(1); }}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Devices</option>
          {filteredDeviceLabels.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
      {error && (
        <ErrorState
          message={error}
          onRetry={() => fetchData(page, dateFrom, dateTo, deviceFilter)}
          compact
        />
      )}
      <DataTable
        columns={columns}
        data={data}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        loading={loading}
      />
      {showDeleteModal && (
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete Actuator Log"
          message="Are you sure you want to delete this actuator log? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteTarget(null);
          }}
        />
      )}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function History() {
  const [activeTab, setActiveTab] = useState('sensors');

  return (
    <Layout title="History" subtitle="Sensor readings and actuator event log">
      <div className="max-w-7xl space-y-5">
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'sensors' && <SensorHistoryTab />}
        {activeTab === 'actuators' && <ActuatorHistoryTab />}
      </div>
    </Layout>
  );
}

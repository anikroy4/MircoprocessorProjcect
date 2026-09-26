import { useState } from 'react';
import { Droplets, Wind, Thermometer } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import DeviceCard from '../components/actuators/DeviceCard.jsx';
import ConfirmModal from '../components/common/ConfirmModal.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { useActuatorStatus } from '../hooks/useActuatorStatus.js';
import { useToast } from '../components/common/Toast.jsx';
import { DEVICES, DEVICE_LABELS } from '../utils/constants.js';

const DEVICE_ICONS = {
  water_pump:      Droplets,
  cooling_fan:     Thermometer,
  ventilation_fan: Wind,
};

const DEVICE_ICON_BG = {
  water_pump:      'bg-blue-100',
  cooling_fan:     'bg-red-100',
  ventilation_fan: 'bg-teal-100',
};

const DEVICE_ICON_COLOR = {
  water_pump:      'text-blue-600',
  cooling_fan:     'text-red-500',
  ventilation_fan: 'text-teal-600',
};

export default function DeviceControl() {
  const { actuators, loading, error, controlling, fetchStatus, sendCommand, getActuator } = useActuatorStatus();
  const { addToast } = useToast();

  const [confirm, setConfirm] = useState(null);

  const handleTurnOn = (device) => {
    setConfirm({
      device,
      action: 'ON',
      title:   `Turn ON ${DEVICE_LABELS[device] || device}?`,
      message: `This will send a manual ON command to the ${DEVICE_LABELS[device] || device} via the backend API → ESP8266 → Arduino Mega.`,
    });
  };

  const handleTurnOff = async (device) => {
    await executeCommand(device, 'OFF');
  };

  const executeCommand = async (device, action, value) => {
    try {
      await sendCommand(device, action, 'MANUAL', value ?? null);
      addToast({
        type:    'success',
        title:   'Command Sent',
        message: `${DEVICE_LABELS[device] || device} ${action} successfully.`,
      });
    } catch (err) {
      addToast({
        type:     'error',
        title:    'Control Failed',
        message:  err.message || `Failed to control ${DEVICE_LABELS[device] || device}. Check system connection.`,
        duration: 6000,
      });
    }
  };

  const onConfirm = async () => {
    if (!confirm) return;
    const { device, action, value } = confirm;
    setConfirm(null);
    await executeCommand(device, action, value);
  };

  const controlledDevices = [DEVICES.WATER_PUMP, DEVICES.COOLING_FAN, DEVICES.VENTILATION_FAN];

  return (
    <Layout title="Device Control" subtitle="Manual actuator control — commands routed via backend API">
      <div className="space-y-6 max-w-4xl">
        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3.5 flex items-start gap-3">
          <span className="text-blue-500 mt-0.5 flex-shrink-0">ℹ</span>
          <div>
            <p className="text-blue-800 text-sm font-medium">Manual Control Mode</p>
            <p className="text-blue-600 text-xs mt-0.5">
              Commands are sent: Dashboard → Backend API → ESP8266 → Arduino Mega → Hardware.
              Switching to MANUAL overrides automation. Switch back to AUTO to restore automated control.
            </p>
          </div>
        </div>

        {error && <ErrorState message={error} onRetry={fetchStatus} compact />}

        {/* Device cards */}
        <section>
          <h2 className="font-semibold text-gray-800 mb-3">Actuator Controls</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {controlledDevices.map((deviceKey) => (
              <DeviceCard
                key={deviceKey}
                device={getActuator(deviceKey)}
                icon={DEVICE_ICONS[deviceKey]}
                iconBg={DEVICE_ICON_BG[deviceKey]}
                iconColor={DEVICE_ICON_COLOR[deviceKey]}
                onTurnOn={() => handleTurnOn(deviceKey)}
                onTurnOff={() => handleTurnOff(deviceKey)}
                isControlling={controlling === deviceKey}
                loading={loading}
              />
            ))}
          </div>
        </section>

        {/* Confirmation modal */}
        <ConfirmModal
          isOpen={!!confirm}
          title={confirm?.title}
          message={confirm?.message}
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          onConfirm={onConfirm}
          onCancel={() => setConfirm(null)}
          variant="warning"
        />
      </div>
    </Layout>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast.jsx';

import Dashboard from './pages/Dashboard.jsx';
import LiveMonitoring from './pages/LiveMonitoring.jsx';
import DeviceControl from './pages/DeviceControl.jsx';
import Automation from './pages/Automation.jsx';
import Analytics from './pages/Analytics.jsx';
import History from './pages/History.jsx';
import SystemStatus from './pages/SystemStatus.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/monitoring" element={<LiveMonitoring />} />
          <Route path="/control" element={<DeviceControl />} />
          <Route path="/automation" element={<Automation />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/history" element={<History />} />
          <Route path="/system" element={<SystemStatus />} />
          <Route path="/settings" element={<Settings />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

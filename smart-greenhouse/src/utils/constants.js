// Device identifiers
export const DEVICES = {
  WATER_PUMP:      'water_pump',
  COOLING_FAN:     'cooling_fan',
  VENTILATION_FAN: 'ventilation_fan',
};

export const DEVICE_LABELS = {
  water_pump:      'Water Pump',
  cooling_fan:     'Cooling Fan',
  ventilation_fan: 'Ventilation Fan',
};

// Sensor types
export const SENSOR_TYPES = {
  TEMPERATURE: 'temperature',
  HUMIDITY: 'humidity',
  SOIL_MOISTURE: 'soil_moisture',
  LIGHT: 'light',
  AIR_QUALITY: 'air_quality',
};

// Modes
export const MODES = {
  AUTO: 'AUTO',
  MANUAL: 'MANUAL',
};

// Actions
export const ACTIONS = {
  ON: 'ON',
  OFF: 'OFF',
  SET_POSITION: 'SET_POSITION',
};

// Time ranges
export const TIME_RANGES = [
  { label: 'Last 1 Hour', value: '1h' },
  { label: 'Last 6 Hours', value: '6h' },
  { label: 'Last 24 Hours', value: '24h' },
  { label: 'Last 7 Days', value: '7d' },
];

// Analytics time filters
export const ANALYTICS_RANGES = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
];

// Status colors (Tailwind classes)
export const STATUS_COLORS = {
  online: 'text-green-600 bg-green-50 border-green-200',
  offline: 'text-red-600 bg-red-50 border-red-200',
  warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  normal: 'text-green-600 bg-green-50 border-green-200',
  critical: 'text-red-600 bg-red-50 border-red-200',
  inactive: 'text-gray-500 bg-gray-50 border-gray-200',
  info: 'text-blue-600 bg-blue-50 border-blue-200',
};

// Chart colors
export const CHART_COLORS = {
  temperature:  '#ef4444',
  humidity:     '#3b82f6',
  soil_moisture:'#8b5cf6',
  air_quality:  '#6b7280',
};

// Default thresholds (overridden by API settings)
export const DEFAULT_THRESHOLDS = {
  soil_min:              30,
  soil_max:              70,
  temperature_high:      35,
  temperature_low:       30,
  humidity_high:         90,
  air_quality_threshold: 70,
};

// Navigation items
export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/monitoring', label: 'Live Monitoring', icon: 'Activity' },
  { path: '/control', label: 'Device Control', icon: 'Sliders' },
  { path: '/automation', label: 'Automation', icon: 'Cpu' },
  { path: '/analytics', label: 'Analytics', icon: 'BarChart2' },
  { path: '/history', label: 'History', icon: 'History' },
  { path: '/system', label: 'System Status', icon: 'Server' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
];

export const POLL_INTERVAL = parseInt(import.meta.env.VITE_POLL_INTERVAL || '5000', 10);

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Activity, Sliders, Cpu, BarChart2,
  History, Server, Settings, Leaf, X, Wifi, WifiOff, User
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/monitoring', label: 'Live Monitoring', icon: Activity },
  { path: '/control', label: 'Device Control', icon: Sliders },
  { path: '/automation', label: 'Automation', icon: Cpu },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/history', label: 'History', icon: History },
  { path: '/system', label: 'System Status', icon: Server },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose, isOnline = true }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-40 flex flex-col
          bg-gradient-to-b from-green-900 to-green-950 shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:flex lg:flex-shrink-0
        `}
      >
        {/* Header / Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-green-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Leaf size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Smart</p>
              <p className="text-green-300 text-xs leading-tight">Greenhouse</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-green-400 hover:text-white transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Online Status */}
        <div className="px-5 py-3 border-b border-green-800/40">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${isOnline ? 'bg-green-800/50' : 'bg-red-900/40'}`}>
            {isOnline ? (
              <Wifi size={14} className="text-green-400" />
            ) : (
              <WifiOff size={14} className="text-red-400" />
            )}
            <span className={`text-xs font-medium ${isOnline ? 'text-green-300' : 'text-red-400'}`}>
              System {isOnline ? 'Online' : 'Offline'}
            </span>
            <span className={`ml-auto w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
          <p className="text-green-600 text-xs font-semibold uppercase tracking-widest px-3 mb-3">Navigation</p>
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-green-500 text-white shadow-lg shadow-green-900/30'
                        : 'text-green-300 hover:bg-green-800/60 hover:text-white'
                    }`
                  }
                >
                  <Icon size={17} className="flex-shrink-0" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="px-4 py-4 border-t border-green-800/60">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-green-800/40">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={15} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">Admin</p>
              <p className="text-green-400 text-xs truncate">CSE 4326 Lab</p>
            </div>
          </div>
          <p className="text-green-700 text-xs text-center mt-3">
            IoT Smart Greenhouse v1.0
          </p>
        </div>
      </aside>
    </>
  );
}

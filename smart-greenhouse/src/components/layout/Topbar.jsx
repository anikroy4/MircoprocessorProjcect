import { Menu, RefreshCw, Bell, Wifi, WifiOff } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters.js';

export default function Topbar({ onMenuOpen, title, subtitle, isOnline, lastUpdated, onRefresh, refreshing }) {
  return (
    <header className="bg-white border-b border-gray-100 shadow-sm px-4 lg:px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuOpen}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-gray-900 font-bold text-lg leading-tight">{title || 'Smart Greenhouse'}</h1>
          {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Last updated */}
        {lastUpdated && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
            <RefreshCw size={12} className={refreshing ? 'animate-spin text-green-500' : 'text-gray-400'} />
            <span>Updated {formatRelativeTime(lastUpdated)}</span>
          </div>
        )}

        {/* Connection status */}
        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border ${
          isOnline
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span className="hidden md:inline">{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* Manual refresh */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-green-500' : ''} />
          </button>
        )}

        {/* Notifications placeholder */}
        <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}

import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message, onRetry, compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
        <AlertTriangle size={16} className="flex-shrink-0" />
        <span className="text-sm flex-1">{message || 'Failed to load data'}</span>
        {onRetry && (
          <button onClick={onRetry} className="text-xs underline hover:no-underline flex-shrink-0">
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle size={28} className="text-red-500" />
      </div>
      <h3 className="text-gray-800 font-semibold mb-1">Something went wrong</h3>
      <p className="text-gray-500 text-sm mb-4 max-w-sm">{message || 'Failed to load data. Please try again.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <RefreshCw size={14} />
          Try Again
        </button>
      )}
    </div>
  );
}

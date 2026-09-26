import { Calendar } from 'lucide-react';

export default function DateRangeFilter({ dateFrom, dateTo, onDateFromChange, onDateToChange, onReset }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
        <Calendar size={14} className="text-gray-400" />
        <label className="text-xs text-gray-500">From</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="text-sm text-gray-700 outline-none bg-transparent"
        />
      </div>
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
        <Calendar size={14} className="text-gray-400" />
        <label className="text-xs text-gray-500">To</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="text-sm text-gray-700 outline-none bg-transparent"
        />
      </div>
      {(dateFrom || dateTo) && (
        <button
          onClick={onReset}
          className="text-xs text-gray-500 hover:text-gray-800 underline"
        >
          Reset
        </button>
      )}
    </div>
  );
}

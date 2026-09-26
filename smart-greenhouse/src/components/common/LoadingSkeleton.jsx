export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-gray-100 rounded-xl" />
        <div className="w-16 h-5 bg-gray-100 rounded-full" />
      </div>
      <div className="w-24 h-8 bg-gray-100 rounded-lg mb-2" />
      <div className="w-32 h-4 bg-gray-100 rounded mb-3" />
      <div className="w-20 h-3 bg-gray-100 rounded" />
    </div>
  );
}

export function ChartSkeleton({ height = 300 }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-32 h-5 bg-gray-100 rounded" />
        <div className="w-24 h-8 bg-gray-100 rounded-lg" />
      </div>
      <div className={`bg-gray-100 rounded-xl`} style={{ height }} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-gray-100">
        <div className="w-48 h-5 bg-gray-100 rounded" />
      </div>
      <div className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3 flex gap-4">
            {Array.from({ length: 5 }).map((__, j) => (
              <div key={j} className="flex-1 h-4 bg-gray-100 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="flex gap-4 animate-pulse">
      <div className="w-32 h-4 bg-gray-100 rounded" />
      <div className="w-24 h-4 bg-gray-100 rounded" />
      <div className="w-20 h-4 bg-gray-100 rounded" />
    </div>
  );
}

export default function LoadingSkeleton({ type = 'card', ...props }) {
  if (type === 'chart') return <ChartSkeleton {...props} />;
  if (type === 'table') return <TableSkeleton {...props} />;
  return <CardSkeleton />;
}

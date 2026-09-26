import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'No data available', icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
        <Icon size={24} className="text-gray-400" />
      </div>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}

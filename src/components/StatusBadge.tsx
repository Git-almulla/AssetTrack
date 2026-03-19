// StatusBadge — Colour-coded status indicator with label (PRD 5.2.1)
import type { AssetStatus } from '../core/models';

const statusConfig: Record<AssetStatus, { color: string; label: string }> = {
  online: { color: 'bg-green-500', label: 'Online' },
  moving: { color: 'bg-amber-500', label: 'Moving' },
  offline: { color: 'bg-red-500', label: 'Offline' },
  unknown: { color: 'bg-gray-400', label: 'Unknown' },
};

export default function StatusBadge({ status }: { status: AssetStatus }) {
  const config = statusConfig[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span className={`w-2 h-2 rounded-full ${config.color}`} />
      {config.label}
    </span>
  );
}

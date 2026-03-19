// ============================================================
// AssetBottomSheet — Quick info panel on pin tap (PRD 5.2.1)
// Shows asset summary with Navigate and View Details CTAs
// ============================================================

import { useNavigate } from 'react-router-dom';
import { StatusBadge, XIcon, NavigationIcon, BatteryIcon, AssetTypeIcon } from '../../components';
import type { Asset } from '../../core/models';

interface AssetBottomSheetProps {
  asset: Asset;
  onClose: () => void;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Unknown';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function AssetBottomSheet({ asset, onClose }: AssetBottomSheetProps) {
  const navigate = useNavigate();

  return (
    <div className="absolute bottom-20 left-3 right-3 z-20 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl p-5 border border-gray-100">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full
                     text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <XIcon size={16} />
        </button>

        {/* Asset info */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
            <AssetTypeIcon type={asset.type} size={24} className="text-[#C84632]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{asset.name}</h3>
            <p className="text-sm text-gray-500">{asset.type} &middot; {asset.zone || 'No zone'}</p>
          </div>
        </div>

        {/* Status row */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <StatusBadge status={asset.status} />
          <span className="text-gray-400">|</span>
          <span className="text-gray-600">Last seen: {timeAgo(asset.lastSeenAt)}</span>
          {asset.batteryLevel != null && (
            <>
              <span className="text-gray-400">|</span>
              <span className={`font-medium ${asset.batteryLevel < 20 ? 'text-red-500' : 'text-gray-600'}`}>
                <BatteryIcon size={14} level={asset.batteryLevel} className="inline" /> {asset.batteryLevel}%
              </span>
            </>
          )}
        </div>

        {/* CTAs */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/assets/${asset.id}`)}
            className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium
                       rounded-xl text-sm transition-colors"
          >
            View Details
          </button>
          <button
            onClick={() => {
              // Open in external maps app for navigation
              if (asset.latitude != null && asset.longitude != null) {
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${asset.latitude},${asset.longitude}&travelmode=walking`,
                  '_blank',
                );
              }
            }}
            className="flex-1 py-2.5 px-4 bg-[#C84632] hover:bg-[#B03D2B] text-white font-medium
                       rounded-xl text-sm transition-colors"
          >
            Navigate <NavigationIcon size={16} className="inline ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

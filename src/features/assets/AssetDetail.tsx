// ============================================================
// AssetDetail — Full asset info sheet with Navigate CTA (PRD 5.6)
// ============================================================

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssetStore } from '../../stores';
import { StatusBadge, ArrowLeftIcon, NavigationIcon, MapIcon, FlagIcon, AssetTypeIcon } from '../../components';

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Unknown';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function signalLabel(rssi: number | null): { text: string; color: string } {
  if (rssi == null) return { text: 'No signal', color: 'text-gray-400' };
  if (rssi > -90) return { text: 'Strong', color: 'text-green-600' };
  if (rssi > -110) return { text: 'Medium', color: 'text-amber-600' };
  return { text: 'Weak', color: 'text-red-600' };
}

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedAsset, fetchAsset, isLoading, clearSelectedAsset } = useAssetStore();

  useEffect(() => {
    if (id) fetchAsset(id);
    return () => clearSelectedAsset();
  }, [id, fetchAsset, clearSelectedAsset]);

  if (isLoading || !selectedAsset) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <svg className="animate-spin h-6 w-6 mr-2" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading asset...
      </div>
    );
  }

  const asset = selectedAsset;
  const signal = signalLabel(asset.rssi);

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Go back"
          >
            <ArrowLeftIcon size={18} />
          </button>
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
            <AssetTypeIcon type={asset.type} size={24} className="text-[#C84632]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">{asset.name}</h2>
            <p className="text-sm text-gray-500">{asset.type} · {asset.zone || 'No zone'}</p>
          </div>
          <StatusBadge status={asset.status} />
        </div>

        {/* Primary CTAs */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (asset.latitude != null && asset.longitude != null) {
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${asset.latitude},${asset.longitude}&travelmode=walking`,
                  '_blank',
                );
              }
            }}
            className="flex-1 py-3 bg-[#C84632] hover:bg-[#B03D2B] text-white font-semibold rounded-xl
                       transition-colors text-center"
          >
            Navigate Here <NavigationIcon size={16} className="inline ml-1.5" />
          </button>
          <button
            onClick={() => navigate(`/`)}
            className="py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl
                       transition-colors"
          >
            <MapIcon size={16} className="inline mr-1.5" />Show on Map
          </button>
        </div>
      </div>

      {/* Info cards */}
      <div className="p-4 space-y-3">
        {/* Location card */}
        <InfoCard title="Location">
          <InfoRow label="Latitude" value={asset.latitude?.toFixed(6) ?? 'N/A'} />
          <InfoRow label="Longitude" value={asset.longitude?.toFixed(6) ?? 'N/A'} />
          {asset.altitude != null && <InfoRow label="Altitude" value={`${asset.altitude.toFixed(1)}m`} />}
          {asset.floor != null && <InfoRow label="Floor" value={String(asset.floor)} />}
          <InfoRow label="Last Seen" value={timeAgo(asset.lastSeenAt)} />
        </InfoCard>

        {/* Sensor card */}
        <InfoCard title="Sensor">
          <InfoRow label="Device EUI" value={asset.sensorEUI} mono />
          <InfoRow
            label="Battery"
            value={
              asset.batteryLevel != null ? (
                <span className={asset.batteryLevel < 20 ? 'text-red-600 font-semibold' : ''}>
                  {asset.batteryLevel}%
                </span>
              ) : (
                'N/A'
              )
            }
          />
          {asset.batteryLevel != null && (
            <div className="mt-1">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    asset.batteryLevel < 20
                      ? 'bg-red-500'
                      : asset.batteryLevel < 50
                        ? 'bg-amber-400'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${asset.batteryLevel}%` }}
                />
              </div>
            </div>
          )}
          <InfoRow
            label="Signal (RSSI)"
            value={
              <span className={signal.color}>
                {asset.rssi != null ? `${asset.rssi} dBm · ${signal.text}` : 'N/A'}
              </span>
            }
          />
          {asset.snr != null && <InfoRow label="SNR" value={`${asset.snr.toFixed(1)} dB`} />}
        </InfoCard>

        {/* Asset info card */}
        <InfoCard title="Asset Info">
          <InfoRow label="Asset ID" value={asset.id} mono />
          <InfoRow label="Status" value={<StatusBadge status={asset.status} />} />
          <InfoRow label="Active" value={asset.isActive ? 'Yes' : 'Deactivated'} />
        </InfoCard>

        {/* Report Issue */}
        <button
          onClick={() => {
            // TODO: Implement report issue form
            alert('Report issue form coming in a future step');
          }}
          className="w-full py-3 bg-white border border-gray-200 text-gray-600 font-medium rounded-xl
                     hover:bg-gray-50 transition-colors"
        >
          Report Issue <FlagIcon size={16} className="inline ml-1.5" />
        </button>
      </div>
    </div>
  );
}

// --- Reusable sub-components ---

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="px-4 py-3 space-y-2.5">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`text-gray-900 ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  );
}

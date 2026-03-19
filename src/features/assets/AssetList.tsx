// ============================================================
// AssetList — Searchable, filterable, sortable list (PRD 5.3)
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssetStore } from '../../stores';
import { StatusBadge } from '../../components';
import type { AssetStatus } from '../../core/models';

type SortKey = 'name' | 'lastSeenAt' | 'status';

const filterOptions: { label: string; value: AssetStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Online', value: 'online' },
  { label: 'Offline', value: 'offline' },
  { label: 'Moving', value: 'moving' },
];

const statusOrder: Record<string, number> = {
  moving: 0,
  online: 1,
  offline: 2,
  unknown: 3,
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Unknown';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function typeIcon(type: string): string {
  switch (type) {
    case 'Excavator': return '🏗️';
    case 'Generator': return '⚡';
    case 'Forklift': return '🚜';
    case 'Compressor': return '💨';
    case 'Crane': return '🏗️';
    default: return '📦';
  }
}

export default function AssetList() {
  const navigate = useNavigate();
  const { assets, fetchAssets, isLoading, filterStatus, setFilterStatus, searchQuery, setSearchQuery } = useAssetStore();
  const [sortBy, setSortBy] = useState<SortKey>('name');

  useEffect(() => {
    if (assets.length === 0) fetchAssets();
  }, [assets.length, fetchAssets]);

  const filtered = useMemo(() => {
    let result = [...assets];

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter((a) => a.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          (a.zone && a.zone.toLowerCase().includes(q)),
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastSeenAt':
          return (
            new Date(b.lastSeenAt || 0).getTime() - new Date(a.lastSeenAt || 0).getTime()
          );
        case 'status':
          return (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
        default:
          return 0;
      }
    });

    return result;
  }, [assets, filterStatus, searchQuery, sortBy]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Search + controls */}
      <div className="bg-white border-b border-gray-200 px-4 pt-4 pb-3 space-y-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, type, or zone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50
                       text-sm text-gray-900 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter chips + sort */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterStatus === opt.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="text-xs text-gray-500 bg-transparent border border-gray-200 rounded-lg px-2 py-1.5
                       focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="name">Name A–Z</option>
            <option value="lastSeenAt">Last Updated</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Asset count */}
      <div className="px-4 py-2 text-xs text-gray-400">
        {filtered.length} asset{filtered.length !== 1 ? 's' : ''}
        {filterStatus !== 'all' && ` · ${filterStatus}`}
        {searchQuery && ` · "${searchQuery}"`}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {isLoading && assets.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <svg className="animate-spin h-6 w-6 mr-2" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading assets...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-3xl mb-2">🔍</p>
            <p>No assets found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((asset) => (
              <button
                key={asset.id}
                onClick={() => navigate(`/assets/${asset.id}`)}
                className="w-full bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm
                           border border-gray-100 hover:border-blue-200 hover:shadow-md
                           transition-all text-left"
              >
                {/* Type icon */}
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                  {typeIcon(asset.type)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-gray-900 truncate">{asset.name}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {asset.type} · {asset.zone || 'No zone'}
                  </div>
                </div>

                {/* Right side: status + meta */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <StatusBadge status={asset.status} />
                  <span className="text-[11px] text-gray-400">{timeAgo(asset.lastSeenAt)}</span>
                  {asset.batteryLevel != null && (
                    <span className={`text-[11px] font-medium ${asset.batteryLevel < 20 ? 'text-red-500' : 'text-gray-400'}`}>
                      🔋 {asset.batteryLevel}%
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

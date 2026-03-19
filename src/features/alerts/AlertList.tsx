// ============================================================
// AlertList — Recent alerts with read/unread state (PRD 5.5)
// ============================================================

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlertStore } from '../../stores';
import { PinIcon, XCircleIcon, BatteryIcon, CheckCircleIcon, BellIcon } from '../../components';
import type { AlertType } from '../../core/models';

type FilterValue = 'all' | 'unread' | AlertType;

const filterOptions: { label: string; value: FilterValue }[] = [
  { label: 'All', value: 'all' },
  { label: 'Unread', value: 'unread' },
  { label: 'Moved', value: 'assetMoved' },
  { label: 'Offline', value: 'assetOffline' },
  { label: 'Battery', value: 'lowBattery' },
];

function alertIcon(type: AlertType): ReactNode {
  switch (type) {
    case 'assetMoved': return <PinIcon size={18} className="text-amber-500" />;
    case 'assetOffline': return <XCircleIcon size={18} className="text-red-500" />;
    case 'lowBattery': return <BatteryIcon size={18} className="text-orange-500" />;
    case 'assetOnline': return <CheckCircleIcon size={18} className="text-green-500" />;
  }
}

function alertTypeLabel(type: AlertType): string {
  switch (type) {
    case 'assetMoved': return 'Moved';
    case 'assetOffline': return 'Offline';
    case 'lowBattery': return 'Low Battery';
    case 'assetOnline': return 'Back Online';
  }
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function AlertList() {
  const navigate = useNavigate();
  const { alerts, fetchAlerts, markAsRead, isLoading, unreadCount } = useAlertStore();
  const [filter, setFilter] = useState<FilterValue>('all');

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const filtered = useMemo(() => {
    if (filter === 'all') return alerts;
    if (filter === 'unread') return alerts.filter((a) => !a.isRead);
    return alerts.filter((a) => a.type === filter);
  }, [alerts, filter]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            Alerts
            {unreadCount > 0 && (
              <span className="ml-2 text-sm bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">
                {unreadCount}
              </span>
            )}
          </h2>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === opt.value
                  ? 'bg-[#C84632] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alert count */}
      <div className="px-4 py-2 text-xs text-gray-400">
        {filtered.length} alert{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {isLoading && alerts.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            Loading alerts...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <BellIcon size={32} className="text-gray-300 mx-auto mb-2" />
            <p>No alerts</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((alert) => (
              <button
                key={alert.id}
                onClick={() => {
                  if (!alert.isRead) markAsRead(alert.id);
                  // Deep link to asset on map
                  navigate(`/assets/${alert.assetId}`);
                }}
                className={`w-full text-left rounded-xl p-4 flex items-start gap-3 shadow-sm border transition-all
                  ${
                    alert.isRead
                      ? 'bg-white border-gray-100 hover:border-gray-200'
                      : 'bg-red-50 border-red-200 hover:border-red-300'
                  }`}
              >
                {/* Icon */}
                <div className="mt-0.5 shrink-0">{alertIcon(alert.type)}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-sm font-semibold ${alert.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                      {alert.assetName}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      alert.isRead ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-700'
                    }`}>
                      {alertTypeLabel(alert.type)}
                    </span>
                    {!alert.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#C84632] shrink-0" />
                    )}
                  </div>
                  <p className={`text-sm ${alert.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(alert.createdAt)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

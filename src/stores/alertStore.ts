// ============================================================
// Alert Store — manages alerts list and read/unread state
// ============================================================

import { create } from 'zustand';
import type { Alert } from '../core/models';
import { apiClient } from '../core/networking/client';

interface AlertState {
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;

  fetchAlerts: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  isLoading: false,
  error: null,
  unreadCount: 0,

  fetchAlerts: async () => {
    set({ isLoading: true, error: null });
    try {
      const alerts = await apiClient.fetchAlerts();
      set({
        alerts,
        unreadCount: alerts.filter((a) => !a.isRead).length,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch alerts',
        isLoading: false,
      });
    }
  },

  markAsRead: async (id) => {
    try {
      await apiClient.markAlertRead(id);
      const { alerts } = get();
      const updated = alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a));
      set({
        alerts: updated,
        unreadCount: updated.filter((a) => !a.isRead).length,
      });
    } catch {
      // Silently fail — alert stays unread
    }
  },
}));

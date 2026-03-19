// ============================================================
// Asset Store — manages asset list, selected asset, and live updates
// ============================================================

import { create } from 'zustand';
import type { Asset, AssetStatus, LocationPoint } from '../core/models';
import { apiClient } from '../core/networking/client';

interface AssetState {
  assets: Asset[];
  selectedAsset: Asset | null;
  assetHistory: LocationPoint[];
  isLoading: boolean;
  error: string | null;
  filterStatus: AssetStatus | 'all';
  searchQuery: string;

  // Actions
  fetchAssets: () => Promise<void>;
  fetchAsset: (id: string) => Promise<void>;
  fetchAssetHistory: (id: string) => Promise<void>;
  setFilterStatus: (status: AssetStatus | 'all') => void;
  setSearchQuery: (query: string) => void;
  updateAssetFromWS: (id: string, lat: number, lng: number, lastSeenAt: string) => void;
  clearSelectedAsset: () => void;
}

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: [],
  selectedAsset: null,
  assetHistory: [],
  isLoading: false,
  error: null,
  filterStatus: 'all',
  searchQuery: '',

  fetchAssets: async () => {
    set({ isLoading: true, error: null });
    try {
      const assets = await apiClient.fetchAssets();
      set({ assets, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch assets',
        isLoading: false,
      });
    }
  },

  fetchAsset: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const asset = await apiClient.fetchAsset(id);
      set({ selectedAsset: asset, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch asset',
        isLoading: false,
      });
    }
  },

  fetchAssetHistory: async (id) => {
    try {
      const history = await apiClient.fetchAssetHistory(id);
      set({ assetHistory: history });
    } catch {
      set({ assetHistory: [] });
    }
  },

  setFilterStatus: (filterStatus) => set({ filterStatus }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  updateAssetFromWS: (id, latitude, longitude, lastSeenAt) => {
    const { assets, selectedAsset } = get();
    const updated = assets.map((a) =>
      a.id === id ? { ...a, latitude, longitude, lastSeenAt, status: 'moving' as const } : a,
    );
    set({
      assets: updated,
      selectedAsset:
        selectedAsset?.id === id
          ? { ...selectedAsset, latitude, longitude, lastSeenAt, status: 'moving' }
          : selectedAsset,
    });
  },

  clearSelectedAsset: () => set({ selectedAsset: null, assetHistory: [] }),
}));

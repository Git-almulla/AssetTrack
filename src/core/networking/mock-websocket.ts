// ============================================================
// MockWebSocket — Simulates real-time asset position updates
// PRD: 3 moving assets emit new position every 30 seconds
// ============================================================

import { MOCK_ASSETS, MOVING_ASSET_IDS } from './fixtures';

export interface AssetUpdateEvent {
  event: 'asset.updated';
  data: {
    id: string;
    latitude: number;
    longitude: number;
    status: 'moving';
    lastSeenAt: string;
  };
}

type Listener = (event: AssetUpdateEvent) => void;

/**
 * Simulates a WebSocket connection that emits asset location updates.
 * Moving assets drift randomly every 30 seconds.
 */
export class MockWebSocket {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private listeners: Listener[] = [];
  private positions: Map<string, { lat: number; lng: number }>;

  constructor() {
    // Initialise positions from fixture data
    this.positions = new Map();
    for (const id of MOVING_ASSET_IDS) {
      const asset = MOCK_ASSETS.find((a) => a.id === id);
      if (asset && asset.latitude && asset.longitude) {
        this.positions.set(id, { lat: asset.latitude, lng: asset.longitude });
      }
    }
  }

  /** Register a callback for asset update events */
  onMessage(listener: Listener): void {
    this.listeners.push(listener);
  }

  /** Remove a listener */
  offMessage(listener: Listener): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  /** Start emitting updates every 30 seconds */
  connect(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      for (const id of MOVING_ASSET_IDS) {
        const pos = this.positions.get(id);
        if (!pos) continue;

        // Random drift: ±0.0001 (~11 metres)
        const newLat = pos.lat + (Math.random() - 0.5) * 0.0002;
        const newLng = pos.lng + (Math.random() - 0.5) * 0.0002;
        this.positions.set(id, { lat: newLat, lng: newLng });

        const event: AssetUpdateEvent = {
          event: 'asset.updated',
          data: {
            id,
            latitude: newLat,
            longitude: newLng,
            status: 'moving',
            lastSeenAt: new Date().toISOString(),
          },
        };

        for (const listener of this.listeners) {
          listener(event);
        }
      }
    }, 30_000);
  }

  /** Stop emitting updates */
  disconnect(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

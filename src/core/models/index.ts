// ============================================================
// AssetTrack — Core Data Models
// Matches PRD Section 7: Core Data Models
// ============================================================

// --- Asset ---

export type AssetStatus = 'online' | 'offline' | 'moving' | 'unknown';

export interface Asset {
  id: string;
  tenantId: string;
  name: string;
  type: string;
  sensorEUI: string;
  status: AssetStatus;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  floor: number | null;
  lastSeenAt: string | null;
  batteryLevel: number | null;
  rssi: number | null;
  snr: number | null;
  zone: string | null;
  isActive: boolean;
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: string;
}

// --- Alert ---

export type AlertType = 'assetMoved' | 'assetOffline' | 'lowBattery' | 'assetOnline';

export interface Alert {
  id: string;
  tenantId: string;
  assetId: string;
  assetName: string;
  type: AlertType;
  message: string;
  createdAt: string;
  isRead: boolean;
}

// --- User ---

export type UserRole = 'field_worker' | 'manager' | 'admin';

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
}

// --- Auth ---

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// --- Gateway Config ---

export interface GatewayConfig {
  lnsType: 'ttn' | 'chirpstack' | 'helium' | 'other';
  apiEndpoint: string;
  apiKey: string;
  isConnected: boolean;
}

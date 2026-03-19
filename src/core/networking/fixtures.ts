// ============================================================
// Mock Fixture Data — PRD Section 10.3
// 20 assets across 500m x 500m area, 5 alerts, 3 users
// ============================================================

import type { Asset, Alert, User, GatewayConfig, LocationPoint } from '../models';

// --- Tenant ---
export const MOCK_TENANT_ID = 'b1e2c3d4-5678-9abc-def0-111111111111';

// --- Assets ---
// Centre point: Dubai area (25.2048, 55.2708)
// 500m x 500m ≈ ±0.0025 lat/lng spread

const assetTypes = ['Excavator', 'Generator', 'Forklift', 'Compressor', 'Crane'] as const;

function makeAsset(
  index: number,
  name: string,
  type: string,
  status: 'online' | 'offline' | 'moving',
  latOffset: number,
  lngOffset: number,
  battery: number,
  zone: string,
): Asset {
  return {
    id: `asset-${String(index).padStart(3, '0')}`,
    tenantId: MOCK_TENANT_ID,
    name,
    type,
    sensorEUI: `A840416531${String(index).padStart(4, '0')}`,
    status,
    latitude: 25.2048 + latOffset,
    longitude: 55.2708 + lngOffset,
    altitude: 5 + Math.random() * 20,
    floor: null,
    lastSeenAt: new Date(Date.now() - Math.random() * 300_000).toISOString(),
    batteryLevel: battery,
    rssi: -90 - Math.floor(Math.random() * 30),
    snr: 5 + Math.random() * 8,
    zone,
    isActive: true,
  };
}

export const MOCK_ASSETS: Asset[] = [
  // 14 Online
  makeAsset(1, 'Excavator 01', 'Excavator', 'online', 0.0010, 0.0005, 87, 'Zone A'),
  makeAsset(2, 'Excavator 02', 'Excavator', 'online', -0.0008, 0.0012, 92, 'Zone A'),
  makeAsset(3, 'Generator 01', 'Generator', 'online', 0.0015, -0.0010, 65, 'Zone B'),
  makeAsset(4, 'Generator 02', 'Generator', 'online', -0.0012, -0.0015, 78, 'Zone B'),
  makeAsset(5, 'Forklift 01', 'Forklift', 'online', 0.0020, 0.0018, 45, 'Zone A'),
  makeAsset(6, 'Forklift 02', 'Forklift', 'online', -0.0005, 0.0022, 91, 'Zone C'),
  makeAsset(7, 'Compressor 01', 'Compressor', 'online', 0.0003, -0.0020, 55, 'Zone B'),
  makeAsset(8, 'Compressor 02', 'Compressor', 'online', -0.0018, 0.0008, 73, 'Zone A'),
  makeAsset(9, 'Crane 01', 'Crane', 'online', 0.0022, -0.0005, 82, 'Zone C'),
  makeAsset(10, 'Crane 02', 'Crane', 'online', -0.0020, -0.0020, 96, 'Zone C'),
  makeAsset(11, 'Excavator 03', 'Excavator', 'online', 0.0005, 0.0015, 38, 'Zone A'),
  makeAsset(12, 'Generator 03', 'Generator', 'online', -0.0015, 0.0005, 61, 'Zone B'),
  makeAsset(13, 'Forklift 03', 'Forklift', 'online', 0.0018, -0.0018, 100, 'Zone C'),
  makeAsset(14, 'Compressor 03', 'Compressor', 'online', -0.0010, -0.0008, 50, 'Zone B'),

  // 3 Offline (last seen >15 min ago)
  makeAsset(15, 'Crane 03', 'Crane', 'offline', 0.0008, 0.0020, 15, 'Zone A'),
  makeAsset(16, 'Excavator 04', 'Excavator', 'offline', -0.0022, 0.0015, 22, 'Zone C'),
  makeAsset(17, 'Generator 04', 'Generator', 'offline', 0.0012, -0.0022, 18, 'Zone B'),

  // 3 Moving (these will emit new positions via mock WebSocket)
  makeAsset(18, 'Forklift 04', 'Forklift', 'moving', 0.0000, 0.0000, 67, 'Zone A'),
  makeAsset(19, 'Excavator 05', 'Excavator', 'moving', -0.0003, 0.0010, 74, 'Zone B'),
  makeAsset(20, 'Crane 04', 'Crane', 'moving', 0.0010, -0.0012, 59, 'Zone C'),
];

// Fix offline assets to have stale lastSeenAt
MOCK_ASSETS[14].lastSeenAt = new Date(Date.now() - 20 * 60_000).toISOString();
MOCK_ASSETS[15].lastSeenAt = new Date(Date.now() - 45 * 60_000).toISOString();
MOCK_ASSETS[16].lastSeenAt = new Date(Date.now() - 30 * 60_000).toISOString();

// --- Moving asset IDs (used by mock WebSocket) ---
export const MOVING_ASSET_IDS = ['asset-018', 'asset-019', 'asset-020'];

// --- Alerts ---
export const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-001',
    tenantId: MOCK_TENANT_ID,
    assetId: 'asset-015',
    assetName: 'Crane 03',
    type: 'assetOffline',
    message: 'Crane 03 has been offline for 20 minutes',
    createdAt: new Date(Date.now() - 20 * 60_000).toISOString(),
    isRead: false,
  },
  {
    id: 'alert-002',
    tenantId: MOCK_TENANT_ID,
    assetId: 'asset-017',
    assetName: 'Generator 04',
    type: 'lowBattery',
    message: 'Generator 04 battery is at 18%',
    createdAt: new Date(Date.now() - 35 * 60_000).toISOString(),
    isRead: false,
  },
  {
    id: 'alert-003',
    tenantId: MOCK_TENANT_ID,
    assetId: 'asset-018',
    assetName: 'Forklift 04',
    type: 'assetMoved',
    message: 'Forklift 04 moved 120m from its last known position',
    createdAt: new Date(Date.now() - 10 * 60_000).toISOString(),
    isRead: true,
  },
  {
    id: 'alert-004',
    tenantId: MOCK_TENANT_ID,
    assetId: 'asset-016',
    assetName: 'Excavator 04',
    type: 'assetOffline',
    message: 'Excavator 04 has been offline for 45 minutes',
    createdAt: new Date(Date.now() - 45 * 60_000).toISOString(),
    isRead: true,
  },
  {
    id: 'alert-005',
    tenantId: MOCK_TENANT_ID,
    assetId: 'asset-011',
    assetName: 'Excavator 03',
    type: 'assetOnline',
    message: 'Excavator 03 is back online',
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    isRead: true,
  },
];

// --- Users ---
export const MOCK_USERS: User[] = [
  {
    id: 'user-001',
    tenantId: MOCK_TENANT_ID,
    email: 'admin@assettrack.io',
    name: 'Sarah Chen',
    role: 'admin',
    isActive: true,
  },
  {
    id: 'user-002',
    tenantId: MOCK_TENANT_ID,
    email: 'manager@assettrack.io',
    name: 'Ahmed Al-Rashid',
    role: 'manager',
    isActive: true,
  },
  {
    id: 'user-003',
    tenantId: MOCK_TENANT_ID,
    email: 'worker@assettrack.io',
    name: 'James Mitchell',
    role: 'field_worker',
    isActive: true,
  },
];

// --- Gateway Config ---
export const MOCK_GATEWAY_CONFIG: GatewayConfig = {
  lnsType: 'ttn',
  apiEndpoint: 'https://eu1.cloud.thethings.network/api/v3',
  apiKey: 'NNSXS.MOCK_API_KEY_FOR_DEVELOPMENT.XXXXXX',
  isConnected: true,
};

// --- Location History (for asset-001, last 24h) ---
export function generateMockHistory(assetId: string): LocationPoint[] {
  const asset = MOCK_ASSETS.find((a) => a.id === assetId);
  if (!asset || !asset.latitude || !asset.longitude) return [];

  const points: LocationPoint[] = [];
  const now = Date.now();
  const baseLat = asset.latitude;
  const baseLng = asset.longitude;

  // Generate 48 points over 24 hours (every 30 min)
  for (let i = 47; i >= 0; i--) {
    points.push({
      latitude: baseLat + (Math.random() - 0.5) * 0.001,
      longitude: baseLng + (Math.random() - 0.5) * 0.001,
      timestamp: new Date(now - i * 30 * 60_000).toISOString(),
    });
  }

  return points;
}

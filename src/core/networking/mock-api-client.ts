// ============================================================
// MockAPIClient — Returns fixture data with simulated network delay
// PRD Section 10.3 & 10.4
// ============================================================

import type { APIClient } from './api-client';
import type { Asset, Alert, User, LocationPoint, GatewayConfig, AuthTokens, UserRole } from '../models';
import {
  MOCK_ASSETS,
  MOCK_ALERTS,
  MOCK_USERS,
  MOCK_GATEWAY_CONFIG,
  MOCK_TENANT_ID,
  generateMockHistory,
} from './fixtures';

/** Simulate network delay between 300ms and 800ms */
function delay(): Promise<void> {
  const ms = 300 + Math.random() * 500;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Deep clone to prevent mutation of fixture data */
function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export class MockAPIClient implements APIClient {
  private assets: Asset[] = clone(MOCK_ASSETS);
  private alerts: Alert[] = clone(MOCK_ALERTS);
  private users: User[] = clone(MOCK_USERS);
  private gatewayConfig: GatewayConfig = clone(MOCK_GATEWAY_CONFIG);

  // ---- Auth ----

  async login(email: string, password: string): Promise<AuthTokens> {
    await delay();

    const user = this.users.find((u) => u.email === email);
    if (!user || password !== 'password') {
      throw new Error('Invalid email or password');
    }

    // Generate a fake JWT-like token containing user info
    const payload = btoa(
      JSON.stringify({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: MOCK_TENANT_ID,
        exp: Date.now() + 3600_000, // 1 hour
      }),
    );

    return {
      accessToken: `mock.${payload}.signature`,
      refreshToken: `refresh.${btoa(user.id)}.token`,
    };
  }

  async refreshToken(_refreshToken: string): Promise<AuthTokens> {
    await delay();
    // Just return new tokens
    return {
      accessToken: `mock.${btoa(JSON.stringify({ exp: Date.now() + 3600_000 }))}.signature`,
      refreshToken: `refresh.${btoa('refreshed')}.token`,
    };
  }

  async logout(): Promise<void> {
    await delay();
    // No-op for mock
  }

  // ---- Assets ----

  async fetchAssets(): Promise<Asset[]> {
    await delay();
    return clone(this.assets.filter((a) => a.isActive));
  }

  async fetchAsset(id: string): Promise<Asset> {
    await delay();
    const asset = this.assets.find((a) => a.id === id);
    if (!asset) throw new Error(`Asset not found: ${id}`);
    return clone(asset);
  }

  async fetchAssetHistory(id: string): Promise<LocationPoint[]> {
    await delay();
    return generateMockHistory(id);
  }

  async createAsset(data: { name: string; type: string; sensorEUI: string; zone?: string }): Promise<Asset> {
    await delay();
    const newAsset: Asset = {
      id: `asset-${Date.now()}`,
      tenantId: MOCK_TENANT_ID,
      name: data.name,
      type: data.type,
      sensorEUI: data.sensorEUI,
      status: 'unknown',
      latitude: 25.2048 + (Math.random() - 0.5) * 0.004,
      longitude: 55.2708 + (Math.random() - 0.5) * 0.004,
      altitude: null,
      floor: null,
      lastSeenAt: null,
      batteryLevel: null,
      rssi: null,
      snr: null,
      zone: data.zone || null,
      isActive: true,
    };
    this.assets.push(newAsset);
    return clone(newAsset);
  }

  async updateAsset(id: string, data: Partial<Asset>): Promise<Asset> {
    await delay();
    const asset = this.assets.find((a) => a.id === id);
    if (!asset) throw new Error(`Asset not found: ${id}`);
    Object.assign(asset, data);
    return clone(asset);
  }

  async deactivateAsset(id: string): Promise<void> {
    await delay();
    const asset = this.assets.find((a) => a.id === id);
    if (asset) asset.isActive = false;
  }

  // ---- Alerts ----

  async fetchAlerts(): Promise<Alert[]> {
    await delay();
    return clone(this.alerts);
  }

  async markAlertRead(id: string): Promise<void> {
    await delay();
    const alert = this.alerts.find((a) => a.id === id);
    if (alert) alert.isRead = true;
  }

  // ---- Users (admin) ----

  async fetchUsers(): Promise<User[]> {
    await delay();
    return clone(this.users);
  }

  async inviteUser(email: string, role: UserRole): Promise<void> {
    await delay();
    this.users.push({
      id: `user-${Date.now()}`,
      tenantId: MOCK_TENANT_ID,
      email,
      name: email.split('@')[0],
      role,
      isActive: true,
    });
  }

  // ---- Gateway (admin) ----

  async fetchGatewayConfig(): Promise<GatewayConfig> {
    await delay();
    return clone(this.gatewayConfig);
  }

  async updateGatewayConfig(config: GatewayConfig): Promise<void> {
    await delay();
    this.gatewayConfig = clone(config);
  }

  // ---- Internal: update a moving asset's position (used by mock WebSocket) ----

  updateAssetPosition(id: string, lat: number, lng: number): Asset | null {
    const asset = this.assets.find((a) => a.id === id);
    if (!asset) return null;
    asset.latitude = lat;
    asset.longitude = lng;
    asset.lastSeenAt = new Date().toISOString();
    return clone(asset);
  }
}

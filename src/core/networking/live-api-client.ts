// ============================================================
// LiveAPIClient — Real fetch() implementation against backend API
// PRD Section 6: API Contract — all endpoints prefixed /api/v1
// ============================================================

import type { APIClient } from './api-client';
import type { Asset, Alert, User, LocationPoint, GatewayConfig, AuthTokens, UserRole } from '../models';
import { getAccessToken } from '../auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // Token expired or invalid — caller should handle refresh/logout
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${body}`);
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

export class LiveAPIClient implements APIClient {
  // ---- Auth ----

  async login(email: string, password: string): Promise<AuthTokens> {
    return request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return request<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(): Promise<void> {
    return request('/auth/logout', { method: 'POST' });
  }

  // ---- Assets ----

  async fetchAssets(): Promise<Asset[]> {
    return request<Asset[]>('/assets');
  }

  async fetchAsset(id: string): Promise<Asset> {
    return request<Asset>(`/assets/${id}`);
  }

  async fetchAssetHistory(id: string): Promise<LocationPoint[]> {
    return request<LocationPoint[]>(`/assets/${id}/history`);
  }

  async createAsset(data: { name: string; type: string; sensorEUI: string; zone?: string }): Promise<Asset> {
    return request<Asset>('/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAsset(id: string, data: Partial<Asset>): Promise<Asset> {
    return request<Asset>(`/assets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deactivateAsset(id: string): Promise<void> {
    return request(`/assets/${id}`, { method: 'DELETE' });
  }

  // ---- Alerts ----

  async fetchAlerts(): Promise<Alert[]> {
    return request<Alert[]>('/alerts');
  }

  async markAlertRead(id: string): Promise<void> {
    return request(`/alerts/${id}/read`, { method: 'PATCH' });
  }

  // ---- Users (admin) ----

  async fetchUsers(): Promise<User[]> {
    return request<User[]>('/users');
  }

  async inviteUser(email: string, role: UserRole): Promise<void> {
    return request('/users/invite', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  // ---- Gateway (admin) ----

  async fetchGatewayConfig(): Promise<GatewayConfig> {
    return request<GatewayConfig>('/config/gateway');
  }

  async updateGatewayConfig(config: GatewayConfig): Promise<void> {
    return request('/config/gateway', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }
}

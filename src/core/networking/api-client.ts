// ============================================================
// APIClient Interface
// PRD Section 10.4 — Protocol that mock and live implementations conform to
// ============================================================

import type {
  Asset,
  Alert,
  User,
  LocationPoint,
  GatewayConfig,
  AuthTokens,
  UserRole,
} from '../models';

export interface APIClient {
  // Auth
  login(email: string, password: string): Promise<AuthTokens>;
  refreshToken(refreshToken: string): Promise<AuthTokens>;
  logout(): Promise<void>;

  // Assets
  fetchAssets(): Promise<Asset[]>;
  fetchAsset(id: string): Promise<Asset>;
  fetchAssetHistory(id: string): Promise<LocationPoint[]>;
  createAsset(data: { name: string; type: string; sensorEUI: string; zone?: string }): Promise<Asset>;
  updateAsset(id: string, data: Partial<Asset>): Promise<Asset>;
  deactivateAsset(id: string): Promise<void>;

  // Alerts
  fetchAlerts(): Promise<Alert[]>;
  markAlertRead(id: string): Promise<void>;

  // Users (admin)
  fetchUsers(): Promise<User[]>;
  inviteUser(email: string, role: UserRole): Promise<void>;

  // Gateway (admin)
  fetchGatewayConfig(): Promise<GatewayConfig>;
  updateGatewayConfig(config: GatewayConfig): Promise<void>;
}

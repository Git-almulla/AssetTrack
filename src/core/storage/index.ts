// ============================================================
// Storage — Dexie.js IndexedDB setup (replaces CoreData)
// Will be fully implemented in Step 10 (Offline Cache)
// ============================================================

import Dexie, { type Table } from 'dexie';
import type { Asset, Alert } from '../models';

export class AssetTrackDB extends Dexie {
  assets!: Table<Asset, string>;
  alerts!: Table<Alert, string>;

  constructor() {
    super('AssetTrackDB');
    this.version(1).stores({
      assets: 'id, tenantId, name, type, status, zone',
      alerts: 'id, tenantId, assetId, type, isRead, createdAt',
    });
  }
}

export const db = new AssetTrackDB();

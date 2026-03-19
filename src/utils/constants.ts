// App-wide constants

export const APP_NAME = 'AssetTrack';

// Map defaults (Dubai area — matches PRD fixture coordinates)
export const DEFAULT_MAP_CENTER = { lat: 25.2048, lng: 55.2708 };
export const DEFAULT_MAP_ZOOM = 15;

// Asset refresh interval (PRD 5.2.1: every 30 seconds)
export const ASSET_REFRESH_INTERVAL_MS = 30_000;

// Offline cache TTL (PRD 5.7: 24 hours)
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Navigation arrival threshold (PRD 5.4: 10 metres)
export const ARRIVAL_THRESHOLD_METRES = 10;

// Alert thresholds
export const OFFLINE_THRESHOLD_MINUTES = 15;
export const LOW_BATTERY_THRESHOLD_PERCENT = 20;
export const MOVEMENT_THRESHOLD_METRES = 50;

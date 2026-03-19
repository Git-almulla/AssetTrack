// ============================================================
// API Client Singleton — swap between Mock and Live
// ============================================================

import type { APIClient } from './api-client';
import { MockAPIClient } from './mock-api-client';
// import { LiveAPIClient } from './live-api-client';

// Use MockAPIClient during development. Switch to LiveAPIClient when backend is ready:
//   export const apiClient: APIClient = new LiveAPIClient();
export const apiClient: APIClient = new MockAPIClient();

// Export the concrete mock instance for WebSocket simulation access
export const mockClient = apiClient as MockAPIClient;

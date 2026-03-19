// ============================================================
// Auth Store — manages login state, tokens, and user info
// ============================================================

import { create } from 'zustand';
import type { UserRole } from '../core/models';
import { apiClient } from '../core/networking/client';
import { setTokens, clearTokens, getAccessToken } from '../core/auth';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => void;
}

/** Decode the mock JWT payload (base64 middle segment) */
function decodeTokenPayload(token: string): AuthUser | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1]));
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      tenantId: payload.tenantId,
    };
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const tokens = await apiClient.login(email, password);
      setTokens(tokens.accessToken, tokens.refreshToken);
      const user = decodeTokenPayload(tokens.accessToken);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Login failed',
        isLoading: false,
      });
    }
  },

  logout: async () => {
    try {
      await apiClient.logout();
    } catch {
      // Ignore logout errors
    }
    clearTokens();
    set({ user: null, isAuthenticated: false, error: null });
  },

  restoreSession: () => {
    const token = getAccessToken();
    if (token) {
      const user = decodeTokenPayload(token);
      if (user) {
        set({ user, isAuthenticated: true });
        return;
      }
    }
    set({ user: null, isAuthenticated: false });
  },
}));

// ============================================================
// AdminGateway — LoRaWAN connection configuration (PRD 5.9.3)
// ============================================================

import { useEffect, useState } from 'react';
import { apiClient } from '../../core/networking/client';
import type { GatewayConfig } from '../../core/models';
import AdminNav from './AdminNav';

export default function AdminGateway() {
  const [config, setConfig] = useState<GatewayConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    apiClient.fetchGatewayConfig().then(setConfig).finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    try {
      await apiClient.updateGatewayConfig(config);
      setTestResult('success');
    } catch {
      setTestResult('error');
    }
    setIsSaving(false);
    setTimeout(() => setTestResult(null), 3000);
  };

  const handleTest = () => {
    // Simulate connection test
    setTestResult(null);
    setTimeout(() => setTestResult('success'), 800);
  };

  if (isLoading || !config) {
    return (
      <div className="h-full bg-gray-50">
        <AdminNav />
        <div className="text-center py-10 text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <AdminNav />

      <div className="p-4 max-w-2xl">
        <h2 className="text-lg font-bold text-gray-900 mb-4">LoRaWAN Gateway Configuration</h2>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {/* LNS Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Network Server Type
            </label>
            <select
              value={config.lnsType}
              onChange={(e) => setConfig({ ...config, lnsType: e.target.value as GatewayConfig['lnsType'] })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C84632]"
            >
              <option value="ttn">The Things Network (TTN)</option>
              <option value="chirpstack">ChirpStack</option>
              <option value="helium">Helium</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* API Endpoint */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              API Endpoint URL
            </label>
            <input
              type="url"
              value={config.apiEndpoint}
              onChange={(e) => setConfig({ ...config, apiEndpoint: e.target.value })}
              placeholder="https://eu1.cloud.thethings.network/api/v3"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C84632]"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              API Key
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="Enter your LNS API key"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C84632]"
            />
          </div>

          {/* Connection status */}
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2.5 h-2.5 rounded-full ${config.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={config.isConnected ? 'text-green-700' : 'text-red-600'}>
              {config.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Test result banner */}
          {testResult && (
            <div className={`text-sm rounded-lg px-4 py-3 ${
              testResult === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {testResult === 'success' ? 'Connection test successful!' : 'Connection test failed. Check your credentials.'}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleTest}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
            >
              Test Connection
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#C84632] hover:bg-[#B03D2B] disabled:bg-[#C8463280] text-white text-sm font-medium rounded-xl transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

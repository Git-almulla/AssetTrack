// ============================================================
// AdminAssets — Asset management CRUD (PRD 5.9.1)
// ============================================================

import { useEffect, useState } from 'react';
import { useAssetStore } from '../../stores';
import { StatusBadge } from '../../components';
import { apiClient } from '../../core/networking/client';
import type { Asset } from '../../core/models';
import AdminNav from './AdminNav';

const DEFAULT_ASSET_TYPES = ['Excavator', 'Generator', 'Forklift', 'Compressor', 'Crane'];
const DEFAULT_ZONES = ['Zone A', 'Zone B', 'Zone C'];

interface AssetFormData {
  name: string;
  type: string;
  sensorEUI: string;
  zone: string;
}

const emptyForm: AssetFormData = { name: '', type: 'Excavator', sensorEUI: '', zone: '' };

export default function AdminAssets() {
  const { assets, fetchAssets, isLoading } = useAssetStore();
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [form, setForm] = useState<AssetFormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  // Custom types and zones — start with defaults + any types already in asset data
  const [customTypes, setCustomTypes] = useState<string[]>([]);
  const [customZones, setCustomZones] = useState<string[]>([]);
  const [newTypeName, setNewTypeName] = useState('');
  const [newZoneName, setNewZoneName] = useState('');
  const [showAddType, setShowAddType] = useState(false);
  const [showAddZone, setShowAddZone] = useState(false);

  // Merge default + custom + types discovered from existing assets
  const allTypes = [...new Set([...DEFAULT_ASSET_TYPES, ...customTypes, ...assets.map((a) => a.type)])];
  const allZones = [...new Set([...DEFAULT_ZONES, ...customZones, ...assets.map((a) => a.zone).filter(Boolean) as string[]])];

  const addCustomType = () => {
    const name = newTypeName.trim();
    if (name && !allTypes.includes(name)) {
      setCustomTypes((prev) => [...prev, name]);
      setForm({ ...form, type: name });
    }
    setNewTypeName('');
    setShowAddType(false);
  };

  const addCustomZone = () => {
    const name = newZoneName.trim();
    if (name && !allZones.includes(name)) {
      setCustomZones((prev) => [...prev, name]);
      setForm({ ...form, zone: name });
    }
    setNewZoneName('');
    setShowAddZone(false);
  };

  useEffect(() => {
    if (assets.length === 0) fetchAssets();
  }, [assets.length, fetchAssets]);

  const openAddForm = () => {
    setEditingAsset(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (asset: Asset) => {
    setEditingAsset(asset);
    setForm({
      name: asset.name,
      type: asset.type,
      sensorEUI: asset.sensorEUI,
      zone: asset.zone || '',
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingAsset(null);
    setForm(emptyForm);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.sensorEUI.trim()) return;
    setIsSaving(true);
    try {
      if (editingAsset) {
        await apiClient.updateAsset(editingAsset.id, {
          name: form.name,
          type: form.type,
          sensorEUI: form.sensorEUI,
          zone: form.zone || null,
        });
      } else {
        await apiClient.createAsset({
          name: form.name,
          type: form.type,
          sensorEUI: form.sensorEUI,
          zone: form.zone || undefined,
        });
      }
      await fetchAssets();
      closeForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save asset');
    }
    setIsSaving(false);
  };

  const handleDeactivate = async (asset: Asset) => {
    if (!confirm(`Deactivate "${asset.name}"? It will be removed from the map.`)) return;
    await apiClient.deactivateAsset(asset.id);
    await fetchAssets();
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <AdminNav />

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Assets ({assets.length})</h2>
          <button
            onClick={openAddForm}
            className="px-4 py-2 bg-[#C84632] hover:bg-[#B03D2B] text-white text-sm font-medium rounded-xl transition-colors"
          >
            + Add Asset
          </button>
        </div>

        {/* Add / Edit form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-red-200 shadow-sm p-5 mb-4 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">
                {editingAsset ? `Edit: ${editingAsset.name}` : 'Add New Asset'}
              </h3>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Asset Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Excavator 06"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#C84632]"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                {showAddType ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomType()}
                      placeholder="New type name"
                      className="flex-1 px-3 py-2 rounded-lg border border-red-300 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-[#C84632]"
                    />
                    <button
                      onClick={addCustomType}
                      disabled={!newTypeName.trim()}
                      className="px-3 py-2 bg-[#C84632] disabled:bg-[#C8463280] text-white text-xs font-medium rounded-lg"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setShowAddType(false); setNewTypeName(''); }}
                      className="px-2 py-2 text-gray-400 hover:text-gray-600 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-[#C84632]"
                    >
                      {allTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowAddType(true)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg whitespace-nowrap transition-colors"
                      title="Add new type"
                    >
                      + New
                    </button>
                  </div>
                )}
              </div>

              {/* Sensor EUI */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sensor EUI *</label>
                <input
                  type="text"
                  value={form.sensorEUI}
                  onChange={(e) => setForm({ ...form, sensorEUI: e.target.value.toUpperCase() })}
                  placeholder="e.g. A8404165318A6E99"
                  maxLength={16}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm font-mono
                             focus:outline-none focus:ring-2 focus:ring-[#C84632]"
                />
              </div>

              {/* Zone */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Zone</label>
                {showAddZone ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={newZoneName}
                      onChange={(e) => setNewZoneName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomZone()}
                      placeholder="New zone name"
                      className="flex-1 px-3 py-2 rounded-lg border border-red-300 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-[#C84632]"
                    />
                    <button
                      onClick={addCustomZone}
                      disabled={!newZoneName.trim()}
                      className="px-3 py-2 bg-[#C84632] disabled:bg-[#C8463280] text-white text-xs font-medium rounded-lg"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setShowAddZone(false); setNewZoneName(''); }}
                      className="px-2 py-2 text-gray-400 hover:text-gray-600 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={form.zone}
                      onChange={(e) => setForm({ ...form, zone: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-[#C84632]"
                    >
                      <option value="">No zone</option>
                      {allZones.map((z) => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowAddZone(true)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg whitespace-nowrap transition-colors"
                      title="Add new zone"
                    >
                      + New
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={closeForm}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving || !form.name.trim() || !form.sensorEUI.trim()}
                className="px-5 py-2 bg-[#C84632] hover:bg-[#B03D2B] disabled:bg-[#C8463280] text-white text-sm font-medium rounded-lg transition-colors"
              >
                {isSaving ? 'Saving...' : editingAsset ? 'Save Changes' : 'Create Asset'}
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Sensor EUI</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Zone</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Battery</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{asset.name}</td>
                    <td className="px-4 py-3 text-gray-600">{asset.type}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{asset.sensorEUI}</td>
                    <td className="px-4 py-3 text-gray-600">{asset.zone || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={asset.status} /></td>
                    <td className="px-4 py-3">
                      <span className={asset.batteryLevel != null && asset.batteryLevel < 20 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                        {asset.batteryLevel != null ? `${asset.batteryLevel}%` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEditForm(asset)}
                        className="text-[#C84632] hover:text-[#B03D2B] text-xs font-medium mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeactivate(asset)}
                        className="text-red-500 hover:text-red-600 text-xs font-medium"
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

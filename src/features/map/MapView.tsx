// ============================================================
// MapView — Full-screen live asset map (PRD 5.2)
// Leaflet + OpenStreetMap — no token required
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAssetStore } from '../../stores';
import { MockWebSocket } from '../../core/networking';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../utils/constants';
import MapControls from './MapControls';
import AssetBottomSheet from './AssetBottomSheet';
import type { Asset } from '../../core/models';

const STATUS_COLORS: Record<string, string> = {
  online: '#22c55e',
  moving: '#f59e0b',
  offline: '#ef4444',
  unknown: '#9ca3af',
};

const TILE_URLS: Record<string, string> = {
  streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  hybrid: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

function createAssetIcon(status: string): L.DivIcon {
  const color = STATUS_COLORS[status] || STATUS_COLORS.unknown;
  return L.divIcon({
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    html: `<div style="
      width:16px;height:16px;border-radius:50%;
      background:${color};border:3px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      transition:background 0.3s;
    "></div>`,
  });
}

// Sub-component to access the map instance via useMap()
function MapController({
  assets,
  selectedAsset,
  onSelectAsset,
  mapStyle,
}: {
  assets: Asset[];
  selectedAsset: Asset | null;
  onSelectAsset: (asset: Asset) => void;
  mapStyle: string;
}) {
  const map = useMap();
  const mapRef = useRef(map);
  mapRef.current = map;

  // Expose map to parent via custom event
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__assettrack_map = map;
    return () => {
      delete (window as unknown as Record<string, unknown>).__assettrack_map;
    };
  }, [map]);

  // Fly to selected asset
  useEffect(() => {
    if (selectedAsset?.latitude != null && selectedAsset?.longitude != null) {
      map.flyTo([selectedAsset.latitude, selectedAsset.longitude], Math.max(map.getZoom(), 16), {
        duration: 0.5,
      });
    }
  }, [selectedAsset, map]);

  // Update tile layer when style changes
  useEffect(() => {
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });
    L.tileLayer(TILE_URLS[mapStyle] || TILE_URLS.streets, {
      attribution: mapStyle === 'streets'
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        : '&copy; Esri',
      maxZoom: 19,
    }).addTo(map);
  }, [mapStyle, map]);

  return (
    <>
      {assets
        .filter((a) => a.latitude != null && a.longitude != null)
        .map((asset) => (
          <Marker
            key={asset.id}
            position={[asset.latitude!, asset.longitude!]}
            icon={createAssetIcon(asset.status)}
            eventHandlers={{
              click: () => onSelectAsset(asset),
            }}
          />
        ))}
    </>
  );
}

export default function MapView() {
  const wsRef = useRef<MockWebSocket | null>(null);
  const { assets, fetchAssets, updateAssetFromWS } = useAssetStore();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'hybrid'>('streets');

  // Fetch assets on mount
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Start mock WebSocket for live updates
  useEffect(() => {
    const ws = new MockWebSocket();
    wsRef.current = ws;

    ws.onMessage((event) => {
      const { id, latitude, longitude, lastSeenAt } = event.data;
      updateAssetFromWS(id, latitude, longitude, lastSeenAt);
    });

    ws.connect();

    return () => {
      ws.disconnect();
      wsRef.current = null;
    };
  }, [updateAssetFromWS]);

  // --- Map control handlers ---

  const getMap = useCallback((): L.Map | null => {
    return (window as unknown as Record<string, L.Map>).__assettrack_map || null;
  }, []);

  const handleMyLocation = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        getMap()?.flyTo([pos.coords.latitude, pos.coords.longitude], 16, { duration: 1 });
      },
      () => {
        getMap()?.flyTo([DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng], DEFAULT_MAP_ZOOM, { duration: 1 });
      },
    );
  }, [getMap]);

  const handleShowAll = useCallback(() => {
    const map = getMap();
    if (!map || assets.length === 0) return;

    const points = assets
      .filter((a) => a.latitude != null && a.longitude != null)
      .map((a) => [a.latitude!, a.longitude!] as L.LatLngTuple);

    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    }
  }, [assets, getMap]);

  const handleCycleStyle = useCallback(() => {
    setMapStyle((prev) => {
      if (prev === 'streets') return 'satellite';
      if (prev === 'satellite') return 'hybrid';
      return 'streets';
    });
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Leaflet map */}
      <MapContainer
        center={[DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng]}
        zoom={DEFAULT_MAP_ZOOM}
        className="absolute inset-0 z-0"
        zoomControl={false}
      >
        <TileLayer
          url={TILE_URLS.streets}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapController
          assets={assets}
          selectedAsset={selectedAsset}
          onSelectAsset={(asset) => setSelectedAsset(asset)}
          mapStyle={mapStyle}
        />
      </MapContainer>

      {/* Search bar overlay */}
      <div className="absolute top-3 left-3 right-3 z-[1000]">
        <MapSearchBar
          assets={assets}
          onSelect={(asset) => {
            setSelectedAsset(asset);
          }}
        />
      </div>

      {/* Map controls */}
      <div className="z-[1000]">
        <MapControls
          onMyLocation={handleMyLocation}
          onShowAll={handleShowAll}
          onToggleStyle={handleCycleStyle}
          currentStyle={mapStyle}
        />
      </div>

      {/* Asset bottom sheet */}
      {selectedAsset && (
        <div className="z-[1000]">
          <AssetBottomSheet
            asset={selectedAsset}
            onClose={() => setSelectedAsset(null)}
          />
        </div>
      )}
    </div>
  );
}

// --- Map Search Bar ---

function MapSearchBar({
  assets,
  onSelect,
}: {
  assets: Asset[];
  onSelect: (asset: Asset) => void;
}) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const filtered = query.length > 0
    ? assets.filter(
        (a) =>
          a.name.toLowerCase().includes(query.toLowerCase()) ||
          a.id.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search assets by name..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowResults(true);
        }}
        onFocus={() => setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        className="w-full px-4 py-2.5 pl-10 bg-white rounded-xl shadow-lg border-0
                   text-sm text-gray-900 placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-[#C84632]"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>

      {showResults && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg max-h-60 overflow-y-auto z-20">
          {filtered.map((asset) => (
            <button
              key={asset.id}
              onMouseDown={() => {
                onSelect(asset);
                setQuery('');
                setShowResults(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-0"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: STATUS_COLORS[asset.status] }}
              />
              <div>
                <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                <div className="text-xs text-gray-500">{asset.type} &middot; {asset.zone}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import { Routes, Route, NavLink } from 'react-router-dom';
import { useOnlineStatus } from './hooks';
import { OfflineBanner, Logo } from './components';
import { useAuthStore, useAlertStore } from './stores';

// Feature screens
import { MapView } from './features/map';
import { AssetList } from './features/assets';
import { AssetDetail } from './features/assets';
import { AlertList } from './features/alerts';
import { LoginScreen, AuthGuard } from './features/auth';
import { AdminAssets, AdminUsers, AdminGateway } from './features/admin';

function AppShell() {
  const isOnline = useOnlineStatus();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useAlertStore();

  return (
    <div className="flex flex-col h-full">
      {/* Offline banner */}
      {!isOnline && <OfflineBanner />}

      {/* Top header bar */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center">
          <Logo size="sm" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user?.name}</span>
          <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-medium capitalize">
            {user?.role?.replace('_', ' ')}
          </span>
          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Sign out"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<MapView />} />
          <Route path="/assets" element={<AssetList />} />
          <Route path="/assets/:id" element={<AssetDetail />} />
          <Route path="/alerts" element={<AlertList />} />
          <Route path="/admin/assets" element={<AdminAssets />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/gateway" element={<AdminGateway />} />
        </Routes>
      </main>

      {/* Bottom tab bar — mobile-style navigation */}
      <nav className="flex items-center justify-around border-t border-gray-200 bg-white py-2 px-4 shrink-0">
        <TabLink to="/" label="Map" icon="🗺️" />
        <TabLink to="/assets" label="Assets" icon="📦" />
        <TabLink to="/alerts" label="Alerts" icon="🔔" badge={unreadCount} />
        {user?.role === 'admin' && <TabLink to="/admin/assets" label="Admin" icon="⚙️" />}
      </nav>
    </div>
  );
}

function TabLink({
  to,
  label,
  icon,
  badge,
}: {
  to: string;
  label: string;
  icon: string;
  badge?: number;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
          isActive ? 'text-[#C84632]' : 'text-gray-500 hover:text-gray-700'
        }`
      }
    >
      <span className="relative text-xl">
        {icon}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </span>
      {label}
    </NavLink>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route
        path="/*"
        element={
          <AuthGuard>
            <AppShell />
          </AuthGuard>
        }
      />
    </Routes>
  );
}

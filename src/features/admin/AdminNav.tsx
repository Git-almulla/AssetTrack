// Admin sub-navigation tabs
import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/admin/assets', label: 'Assets' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/gateway', label: 'Gateway' },
];

export default function AdminNav() {
  return (
    <div className="bg-white border-b border-gray-200 px-4">
      <nav className="flex gap-1">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-[#C84632] text-[#C84632]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

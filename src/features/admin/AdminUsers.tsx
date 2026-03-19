// ============================================================
// AdminUsers — User invite and role management (PRD 5.9.2)
// ============================================================

import { useEffect, useState } from 'react';
import { apiClient } from '../../core/networking/client';
import type { User, UserRole } from '../../core/models';
import AdminNav from './AdminNav';

const roleBadge: Record<UserRole, { bg: string; text: string; label: string }> = {
  admin: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Admin' },
  manager: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Manager' },
  field_worker: { bg: 'bg-green-100', text: 'text-green-700', label: 'Field Worker' },
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('field_worker');

  useEffect(() => {
    apiClient.fetchUsers().then(setUsers).finally(() => setIsLoading(false));
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    await apiClient.inviteUser(inviteEmail, inviteRole);
    const updated = await apiClient.fetchUsers();
    setUsers(updated);
    setInviteEmail('');
    setShowInvite(false);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <AdminNav />

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Users ({users.length})</h2>
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            + Invite User
          </button>
        </div>

        {/* Invite form */}
        {showInvite && (
          <div className="bg-white rounded-xl border border-blue-200 p-4 mb-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Invite New User</h3>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="field_worker">Field Worker</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={handleInvite}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Send Invite
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => {
              const badge = roleBadge[user.role];
              return (
                <div key={user.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg font-semibold text-gray-500">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                  <span className={`text-xs font-medium ${user.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

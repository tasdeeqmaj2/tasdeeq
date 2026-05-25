import { useEffect, useState, FormEvent } from 'react';
import { useSession } from '../lib/auth-client';
import AdminLayout from '../components/AdminLayout';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  banned: boolean | null;
  isSuperAdmin: boolean;
  createdAt: string;
}

const ROLE_OPTIONS = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];

const ROLE_BADGE: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700',
  admin: 'bg-blue-100 text-blue-700',
  user: 'bg-slate-100 text-slate-600',
};

export default function UsersPage() {
  const { data: session } = useSession();
  const callerRole = session?.user?.role as string | undefined;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user');

  async function fetchUsers() {
    setLoading(true);
    const res = await fetch('/api/v1/users', { credentials: 'include' });
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    const res = await fetch('/api/v1/users', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone: phone || undefined, role }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setFormError(body.message ?? 'Failed to create user');
      return;
    }

    setShowForm(false);
    setName(''); setEmail(''); setPassword(''); setPhone(''); setRole('user');
    fetchUsers();
  }

  async function handleDelete(id: string, userName: string) {
    if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return;

    const res = await fetch(`/api/v1/users/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(body.message ?? 'Failed to delete user');
      return;
    }

    fetchUsers();
  }

  // Roles available when creating a user, filtered by caller's permissions
  const availableRoles = callerRole === 'super_admin'
    ? ROLE_OPTIONS
    : ROLE_OPTIONS.filter((r) => r.value === 'user');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Users</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Cancel' : 'New user'}
          </button>
        </div>

        {/* Create user form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
          >
            <h3 className="text-sm font-semibold text-slate-900">Create user</h3>

            {formError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <input
                  required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Min 8 characters"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Phone <span className="text-slate-400">(optional)</span></label>
                <input
                  type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+92 300 0000000"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Role</label>
                <select
                  value={role} onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableRoles.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit" disabled={submitting}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Creating...' : 'Create user'}
              </button>
            </div>
          </form>
        )}

        {/* Users table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">No users yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Name</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Email</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Role</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Status</th>
                  {callerRole === 'super_admin' && (
                    <th className="px-5 py-3" />
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {u.name}
                      {u.isSuperAdmin && (
                        <span className="ml-2 text-xs text-purple-600">(you)</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{u.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${ROLE_BADGE[u.role] ?? 'bg-slate-100 text-slate-600'}`}
                      >
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {u.banned ? (
                        <span className="text-xs text-red-600">Banned</span>
                      ) : u.isActive ? (
                        <span className="text-xs text-green-600">Active</span>
                      ) : (
                        <span className="text-xs text-slate-400">Inactive</span>
                      )}
                    </td>
                    {callerRole === 'super_admin' && (
                      <td className="px-5 py-3 text-right">
                        {!u.isSuperAdmin && (
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            className="text-xs text-red-500 hover:text-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

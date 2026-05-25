import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSession, signOut } from '../lib/auth-client';

interface Props {
  children: ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const role = session?.user?.role as string | undefined;

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="px-5 py-5 border-b border-slate-200">
          <span className="text-base font-semibold text-slate-900">Tasdeeq Admin</span>
          <div className="mt-1 text-xs text-slate-400 capitalize">{role?.replace('_', ' ')}</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink to="/" end className={navClass}>
            Dashboard
          </NavLink>
          {(role === 'admin' || role === 'super_admin') && (
            <NavLink to="/users" className={navClass}>
              Users
            </NavLink>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-slate-200">
          <div className="px-3 mb-2">
            <p className="text-xs font-medium text-slate-900 truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-slate-400 truncate">{session?.user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}

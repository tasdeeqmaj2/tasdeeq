import { useSession } from '../lib/auth-client';
import AdminLayout from '../components/AdminLayout';

export default function DashboardPage() {
  const { data: session } = useSession();
  const role = session?.user?.role as string | undefined;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Welcome back, {session?.user?.name}
          </h2>
          <p className="text-sm text-slate-500 mt-1 capitalize">
            Signed in as {role?.replace('_', ' ')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-500">Account</p>
            <p className="mt-1 text-slate-900">{session?.user?.email}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-500">Role</p>
            <p className="mt-1 text-slate-900 capitalize">
              {role?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

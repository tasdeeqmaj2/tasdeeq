import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '../lib/auth-client';

interface Props {
  children: ReactNode;
  requiredRole?: 'admin' | 'super_admin';
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/login" replace />;
  }

  const role = session.user.role as string;

  if (requiredRole === 'super_admin' && role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  if (
    requiredRole === 'admin' &&
    role !== 'admin' &&
    role !== 'super_admin'
  ) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

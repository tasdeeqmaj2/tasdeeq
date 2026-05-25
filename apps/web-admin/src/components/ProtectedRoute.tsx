import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSession } from '@/lib/auth-client';

interface Props {
  children: ReactNode;
  requiredRole?: 'admin' | 'super_admin';
}

const ROLE_ORDER: Record<string, number> = { super_admin: 2, admin: 1, user: 0 };

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user) return <Navigate to="/login" replace />;

  const userRoleLevel = ROLE_ORDER[session.user.role as string] ?? -1;
  const requiredLevel = requiredRole ? (ROLE_ORDER[requiredRole] ?? 99) : 0;

  if (userRoleLevel < requiredLevel) return <Navigate to="/" replace />;

  return <>{children}</>;
}

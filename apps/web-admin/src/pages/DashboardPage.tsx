import { useSession } from '@/lib/auth-client';
import AdminLayout from '@/components/AdminLayout';
import { PageHeader } from '@/components/PageHeader';
import { RoleBadge } from '@/components/RoleBadge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DashboardPage() {
  const { data: session } = useSession();
  const role = session?.user?.role as string | undefined;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description={`Welcome back, ${session?.user?.name ?? ''}`}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Account</CardDescription>
              <CardTitle className="text-base font-medium">
                {session?.user?.email}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Role</CardDescription>
              <CardContent className="p-0 pt-1">
                {role && <RoleBadge role={role} />}
              </CardContent>
            </CardHeader>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

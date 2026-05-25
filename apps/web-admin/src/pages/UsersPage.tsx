import { useEffect, useState, type FormEvent } from 'react';
import { Loader2, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import AdminLayout from '@/components/AdminLayout';
import { PageHeader } from '@/components/PageHeader';
import { RoleBadge } from '@/components/RoleBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';

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

export default function UsersPage() {
  const { data: session } = useSession();
  const callerRole = session?.user?.role as string | undefined;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
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

  function resetForm() {
    setName(''); setEmail(''); setPassword(''); setPhone(''); setRole('user');
    setFormError('');
  }

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
      setFormError((body as { message?: string }).message ?? 'Failed to create user');
      return;
    }

    setOpen(false);
    resetForm();
    fetchUsers();
  }

  async function handleDelete(id: string, userName: string) {
    if (!confirm(`Delete "${userName}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/v1/users/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert((body as { message?: string }).message ?? 'Failed to delete user');
      return;
    }
    fetchUsers();
  }

  const availableRoles =
    callerRole === 'super_admin'
      ? ROLE_OPTIONS
      : ROLE_OPTIONS.filter((r) => r.value === 'user');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Users"
          description="Manage Tasdeeq team members"
          action={
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1.5 h-4 w-4" />
                New user
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Create user</DialogTitle>
                  <DialogDescription>
                    Add a new member to the Tasdeeq admin team.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {formError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="c-name">Full name</Label>
                      <Input
                        id="c-name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="c-phone">Phone <span className="text-muted-foreground">(optional)</span></Label>
                      <Input
                        id="c-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+92 300 0000000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="c-email">Email</Label>
                    <Input
                      id="c-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@tasdeeq.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="c-password">Password</Label>
                    <Input
                      id="c-password"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="c-role">Role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger id="c-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {submitting ? 'Creating…' : 'Create user'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          }
        />

        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  {callerRole === 'super_admin' && <TableHead className="w-10" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                      No users yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.name}
                        {u.isSuperAdmin && (
                          <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <RoleBadge role={u.role} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge banned={u.banned} isActive={u.isActive} />
                      </TableCell>
                      {callerRole === 'super_admin' && (
                        <TableCell>
                          {!u.isSuperAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(u.id, u.name)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}

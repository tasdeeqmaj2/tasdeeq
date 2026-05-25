import { Badge } from '@/components/ui/badge';

const VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  super_admin: 'default',
  admin: 'secondary',
  user: 'outline',
};

interface Props {
  role: string;
}

export function RoleBadge({ role }: Props) {
  return (
    <Badge variant={VARIANT[role] ?? 'outline'} className="capitalize">
      {role.replace('_', ' ')}
    </Badge>
  );
}

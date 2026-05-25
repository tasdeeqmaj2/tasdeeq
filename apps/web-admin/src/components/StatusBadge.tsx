import { Badge } from '@/components/ui/badge';

interface Props {
  banned?: boolean | null;
  isActive?: boolean;
}

export function StatusBadge({ banned, isActive }: Props) {
  if (banned) return <Badge variant="destructive">Banned</Badge>;
  if (isActive) return <Badge variant="secondary">Active</Badge>;
  return <Badge variant="outline">Inactive</Badge>;
}

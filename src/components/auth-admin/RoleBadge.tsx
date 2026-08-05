import type { Role } from "@/api/literals";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ROLE_COLORS, ROLE_LABELS } from "@/lib/users-meta";

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const colors = ROLE_COLORS[role];
  return (
    <Badge
      variant="outline"
      className={cn(
        "users-admin-badge-pop gap-1.5 font-normal",
        colors.badge,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", colors.dot)} />
      {ROLE_LABELS[role]}
    </Badge>
  );
}

interface RoleDotLabelProps {
  role: Role;
}

export function RoleDotLabel({ role }: RoleDotLabelProps) {
  const colors = ROLE_COLORS[role];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className={cn("size-2 rounded-full", colors.dot)} />
      {ROLE_LABELS[role]}
    </span>
  );
}

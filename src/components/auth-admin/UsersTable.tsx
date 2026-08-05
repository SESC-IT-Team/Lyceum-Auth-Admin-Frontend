import { AlertTriangleIcon, UsersIcon } from "lucide-react";
import type { UserGetResponse } from "@/api/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleBadge } from "@/components/auth-admin/RoleBadge";
import { GENDER_LABELS, formatDate, getInitials } from "@/lib/users-meta";

const COLUMN_COUNT = 8;
const SKELETON_ROWS = 8;

interface UsersTableProps {
  users: UserGetResponse[];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
}

export function UsersTable({
  users,
  isLoading,
  isFetching,
  error,
}: UsersTableProps) {
  return (
    <Table className="users-admin-fade-in">
      <TableHeader>
        <TableRow>
          <TableHead>ФИО</TableHead>
          <TableHead>Логин</TableHead>
          <TableHead>Роли</TableHead>
          <TableHead>Пол</TableHead>
          <TableHead>Класс</TableHead>
          <TableHead>Год выпуска</TableHead>
          <TableHead>Создан</TableHead>
          <TableHead className="text-right">Кол-во разрешений</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-28 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-10" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-12" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ms-auto h-4 w-8" />
              </TableCell>
            </TableRow>
          ))
        ) : error ? (
          <TableRow>
            <TableCell colSpan={COLUMN_COUNT} className="h-40 text-center">
              <div className="flex flex-col items-center gap-2">
                <AlertTriangleIcon
                  aria-hidden="true"
                  className="text-destructive size-6"
                />
                <p className="text-destructive text-sm font-medium">
                  {error}
                </p>
                <p className="text-muted-foreground text-sm">
                  Попробуйте изменить параметры или обновить страницу.
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={COLUMN_COUNT} className="h-40 text-center">
              <div className="flex flex-col items-center gap-2">
                <UsersIcon
                  aria-hidden="true"
                  className="text-muted-foreground size-6"
                />
                <p className="text-sm font-medium">Пользователи не найдены</p>
                <p className="text-muted-foreground text-sm">
                  Измените поиск или сбросьте фильтры.
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          users.map((user, index) => (
            <TableRow
              key={user.id}
              className="users-admin-row-in"
              style={{
                animationDelay: `${Math.min(index, 14) * 28}ms`,
                opacity: isFetching ? 0.55 : 1,
                transition: "opacity 150ms ease-out",
              }}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.full_name}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {user.login}
              </TableCell>
              <TableCell>
                {user.roles.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                      <RoleBadge key={role} role={role} />
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>{GENDER_LABELS[user.gender]}</TableCell>
              <TableCell>{user.class_name ?? "—"}</TableCell>
              <TableCell>{user.graduation_year ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(user.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="secondary">{user.permissions.length}</Badge>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

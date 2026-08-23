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
import { Skeleton } from "@/components/ui/skeleton";
import { RoleBadge } from "@/components/auth-admin/RoleBadge";
import { GENDER_LABELS, formatDate } from "@/lib/users-meta";

const SKELETON_ROWS = 8;

export type UserColumnKey =
  | "full_name"
  | "login"
  | "roles"
  | "gender"
  | "class_name"
  | "graduation_year"
  | "birthday"
  | "created_at"
  | "updated_at"
  | "lives_in_dormitory";

export const USER_COLUMNS: Array<{ key: UserColumnKey; label: string }> = [
  { key: "full_name", label: "ФИО" },
  { key: "login", label: "Логин" },
  { key: "roles", label: "Роли" },
  { key: "gender", label: "Пол" },
  { key: "class_name", label: "Класс" },
  { key: "graduation_year", label: "Год выпуска" },
  { key: "birthday", label: "Дата рождения" },
  { key: "created_at", label: "Дата создания" },
  { key: "updated_at", label: "Дата обновления" },
  { key: "lives_in_dormitory", label: "Общежитие" },
];

interface UsersTableProps {
  users: UserGetResponse[];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  onUserClick: (user: UserGetResponse) => void;
  visibleColumns: UserColumnKey[];
}

export function UsersTable({
  users,
  isLoading,
  isFetching,
  error,
  onUserClick,
  visibleColumns,
}: UsersTableProps) {
  const hasColumn = (column: UserColumnKey) => visibleColumns.includes(column);

  return (
    <Table className="users-admin-fade-in">
      <TableHeader>
        <TableRow>
          {USER_COLUMNS.filter(({ key }) => hasColumn(key)).map(({ key, label }) => (
            <TableHead key={key}>{label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <TableRow key={i}>
              {visibleColumns.map((column) => (
                <TableCell key={column}>
                  <Skeleton className={column === "full_name" ? "h-4 w-36" : "h-4 w-20"} />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : error ? (
          <TableRow>
            <TableCell colSpan={visibleColumns.length} className="h-40 text-center">
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
            <TableCell colSpan={visibleColumns.length} className="h-40 text-center">
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
              className="users-admin-row-in transition-color hover:brightness-90 dark:hover:brightness-125"
              onClick={() => onUserClick(user)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onUserClick(user);
                }
              }}
              tabIndex={0}
              style={{
                animationDelay: `${Math.min(index, 14) * 28}ms`,
                opacity: isFetching ? 0.55 : 1,
                transition: "opacity 150ms ease-out, filter 150ms ease-out",
              }}
            >
              {hasColumn("full_name") && <TableCell><span className="font-medium">{user.full_name}</span></TableCell>}
              {hasColumn("login") && <TableCell className="text-muted-foreground">{user.login}</TableCell>}
              {hasColumn("roles") && <TableCell>{user.roles.length > 0 ? <div className="flex flex-wrap gap-1">{user.roles.map((role) => <RoleBadge key={role} role={role} />)}</div> : <span className="text-muted-foreground">—</span>}</TableCell>}
              {hasColumn("gender") && <TableCell>{GENDER_LABELS[user.gender]}</TableCell>}
              {hasColumn("class_name") && <TableCell>{user.class_name ?? "—"}</TableCell>}
              {hasColumn("graduation_year") && <TableCell>{user.graduation_year ?? "—"}</TableCell>}
              {hasColumn("birthday") && <TableCell>{user.birthday ?? "—"}</TableCell>}
              {hasColumn("created_at") && <TableCell className="text-muted-foreground">{formatDate(user.created_at)}</TableCell>}
              {hasColumn("updated_at") && <TableCell className="text-muted-foreground">{formatDate(user.updated_at)}</TableCell>}
              {hasColumn("lives_in_dormitory") && <TableCell>{user.lives_in_dormitory ? "Да" : "Нет"}</TableCell>}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

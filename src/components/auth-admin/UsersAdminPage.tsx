import { useEffect, useMemo, useRef, useState } from "react";
import type { SortingOrder, UserSortableField } from "@/api/literals";
import type { UsersListQuery } from "@/api/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useCountUp } from "@/hooks/useCountUp";
import { useUsersQuery } from "@/hooks/useUsersQuery";
import { UsersToolbar } from "@/components/auth-admin/UsersToolbar";
import { USER_COLUMNS, UsersTable, type UserColumnKey } from "@/components/auth-admin/UsersTable";
import { UsersPagination } from "@/components/auth-admin/UsersPagination";
import { UserDetailsDrawer } from "@/components/auth-admin/UserDetailsDrawer";
import { CreateUserDrawer } from "@/components/auth-admin/CreateUserDrawer";
import { EMPTY_FILTERS, type FiltersState } from "@/components/auth-admin/UsersFiltersPopover";
import type { SearchableField } from "@/lib/users-meta";
import type { UserGetResponse } from "@/api/types";
import "./users-admin.css";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;
const DEFAULT_VISIBLE_COLUMNS: UserColumnKey[] = USER_COLUMNS.slice(0, 7).map(({ key }) => key);

export default function UsersAdminPage() {
  const [page, setPage] = useState(1);
  const [searchField, setSearchField] = useState<SearchableField>("full_name");
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedValue(searchValue, SEARCH_DEBOUNCE_MS);
  const [sortBy, setSortBy] = useState<UserSortableField>("created_at");
  const [order, setOrder] = useState<SortingOrder>("desc");
  const [filters, setFilters] = useState<FiltersState>(EMPTY_FILTERS);
  const [selectedUser, setSelectedUser] = useState<UserGetResponse | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<UserColumnKey[]>(DEFAULT_VISIBLE_COLUMNS);

  const criteriaKey = JSON.stringify({
    debouncedSearch,
    searchField,
    sortBy,
    order,
    filters,
  });
  const previousCriteriaKeyRef = useRef(criteriaKey);
  useEffect(() => {
    if (previousCriteriaKeyRef.current !== criteriaKey) {
      previousCriteriaKeyRef.current = criteriaKey;
      setPage(1);
    }
  }, [criteriaKey]);

  const query = useMemo<UsersListQuery>(() => {
    const searchPart = debouncedSearch
      ? ({ [searchField]: debouncedSearch } as Partial<UsersListQuery>)
      : {};

    return {
      offset: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
      sort_by: sortBy,
      order,
      ...(filters.gender ? { gender: filters.gender } : {}),
      ...(filters.roles.length ? { roles: filters.roles } : {}),
      ...(filters.grades.length ? { grades: filters.grades } : {}),
      ...(filters.letters.length ? { letters: filters.letters } : {}),
      ...(filters.graduationYears.length ? { graduation_years: filters.graduationYears } : {}),
      ...(filters.livesInDormitory !== null ? { lives_in_dormitory: filters.livesInDormitory } : {}),
      ...searchPart,
    };
  }, [page, sortBy, order, debouncedSearch, searchField, filters]);

  const { users, total, isLoading, isFetching, error, reload } = useUsersQuery(query);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const animatedTotal = useCountUp(total);

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="mx-auto flex w-full max-w-8xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Пользователи
        </h1>
        <p className="text-muted-foreground text-sm">
          Всего найдено:{" "}
          <span className="text-foreground font-medium tabular-nums">
            {animatedTotal}
          </span>
        </p>
      </header>

      <div className="border-border bg-card relative overflow-hidden rounded-xl border">
        <div className="bg-border relative h-0.5 w-full overflow-hidden">
          {isFetching && (
            <div className="users-admin-progress-bar bg-primary absolute inset-y-0 w-1/3" />
          )}
        </div>

        <div className="flex flex-col gap-4 p-4">
          <UsersToolbar
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            searchField={searchField}
            onSearchFieldChange={setSearchField}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            order={order}
            onOrderToggle={() =>
              setOrder((current: SortingOrder) =>
                current === "asc" ? "desc" : "asc",
              )
            }
            filters={filters}
            onFiltersChange={setFilters}
            isFetching={isFetching}
            visibleColumns={visibleColumns}
            onVisibleColumnsChange={setVisibleColumns}
            onCreateUser={() => setIsCreateOpen(true)}
          />

          <div className="overflow-x-auto rounded-lg border">
            <UsersTable
              users={users}
              isLoading={isLoading}
              isFetching={isFetching}
              error={error}
              onUserClick={setSelectedUser}
              visibleColumns={visibleColumns}
            />
          </div>
        </div>
      </div>

      <UserDetailsDrawer
        user={selectedUser}
        open={selectedUser !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
        }}
        onChanged={reload}
      />

      <CreateUserDrawer
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={reload}
      />

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-muted-foreground text-sm">
          {total > 0
            ? `Показано ${rangeStart}–${rangeEnd} из ${total}`
            : "Нет результатов"}
        </p>
        <UsersPagination page={page} pageCount={pageCount} onPageChange={setPage} />
      </div>
    </div>
  );
}

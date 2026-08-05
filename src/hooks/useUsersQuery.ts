import { useEffect, useRef, useState } from "react";
import { getUsers } from "@/api/users";
import type { UserGetResponse, UsersListQuery } from "@/api/types";

interface UseUsersQueryResult {
  users: UserGetResponse[];
  total: number;
  /** True only while there is no data on screen yet. */
  isLoading: boolean;
  /** True on every fetch, including background refetches after page/filter changes. */
  isFetching: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Fetches a page of users for the given query and keeps the last
 * successful result on screen while a new page/filter/sort is loading.
 *
 * Requests can resolve out of order (e.g. the user changes a filter
 * before the previous request finished). Each call is tagged with an
 * incrementing id, and a response is only applied to state if it's still
 * the most recent request in flight — otherwise it's silently discarded.
 */
export function useUsersQuery(query: UsersListQuery): UseUsersQueryResult {
  const [users, setUsers] = useState<UserGetResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const [reloadToken, setReloadToken] = useState(0);

  const queryKey = JSON.stringify(query);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    setIsFetching(true);
    setError(null);

    getUsers(query)
      .then((response) => {
        if (requestIdRef.current !== requestId) return; // stale, ignore
        setUsers(response.items);
        setTotal(response.total);
        setIsLoading(false);
        setIsFetching(false);
      })
      .catch((err: unknown) => {
        if (requestIdRef.current !== requestId) return; // stale, ignore
        setError(
          err instanceof Error
            ? err.message
            : "Не удалось загрузить список пользователей",
        );
        setIsLoading(false);
        setIsFetching(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, reloadToken]);

  return {
    users,
    total,
    isLoading,
    isFetching,
    error,
    reload: () => setReloadToken((t) => t + 1),
  };
}

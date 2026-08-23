import { useAuthFetch } from "auth-lib";
import { useEffect, useState } from "react";
import { getUsers } from "@/api/users";
import type { UserGetResponse, UsersListQuery } from "@/api/types";

export function useUsersQuery(query: UsersListQuery) {
  const authFetch = useAuthFetch();
  const [users, setUsers] = useState<UserGetResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const queryKey = JSON.stringify(query);

  useEffect(() => {
    const controller = new AbortController();
    setIsFetching(true);
    setError(null);
    void getUsers(query, (input, init) => authFetch(input, { ...init, signal: controller.signal }))
      .then((response) => { setUsers(response.users); setTotal(response.total); })
      .catch((reason: unknown) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Не удалось загрузить пользователей"); })
      .finally(() => { if (!controller.signal.aborted) { setIsLoading(false); setIsFetching(false); } });
    return () => controller.abort();
  }, [authFetch, query, queryKey, refreshVersion]);

  return { users, total, isLoading, isFetching, error, reload: () => setRefreshVersion((version) => version + 1) };
}
import { useAuthFetch } from "auth-lib";
import { useEffect, useState } from "react";
import { getDepartmentMembers } from "@/api/departments";
import type { Department } from "@/api/literals";
import type { DepartmentMemberListResponse, DepartmentMembersQuery } from "@/api/types";

const EMPTY_RESPONSE: DepartmentMemberListResponse = { members: [], total: 0, offset: 0, limit: 20 };

export function useDepartmentMembersQuery(department: Department, query: DepartmentMembersQuery) {
  const authFetch = useAuthFetch();
  const [data, setData] = useState(EMPTY_RESPONSE);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);
  const queryKey = JSON.stringify(query);

  useEffect(() => {
    const controller = new AbortController();
    setIsFetching(true);
    setError(null);
    void getDepartmentMembers(department, query, (input, init) => authFetch(input, { ...init, signal: controller.signal }))
      .then(setData)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Не удалось загрузить сотрудников");
      })
      .finally(() => {
        if (!controller.signal.aborted) { setIsLoading(false); setIsFetching(false); }
      });
    return () => controller.abort();
  }, [authFetch, department, query, queryKey, reloadVersion]);

  return { ...data, isLoading, isFetching, error, reload: () => setReloadVersion((version) => version + 1) };
}
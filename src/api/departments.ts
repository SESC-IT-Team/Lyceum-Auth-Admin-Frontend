import type { Department, DepartmentMemberPosition } from "./literals";
import type {
  DepartmentMemberListResponse,
  DepartmentMembersQuery,
  UpdateDepartmentMemberPositionRequest,
} from "./types";
import { getRuntimeConfig } from "@/lib/runtime-config";

const runtimeConfig = getRuntimeConfig();
const API_BASE = `${runtimeConfig.VITE_AUTH_DOMAIN ?? runtimeConfig.VITE_DOMAIN ?? ""}`;
const USER_SERVICE_PROXY = "/proxy/user-service";
type AuthFetch = (input: string, init?: RequestInit) => Promise<Response>;

async function request<T>(url: string, authFetch: AuthFetch, init?: RequestInit): Promise<T> {
  const response = await authFetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!response.ok) throw new Error(`API Error ${response.status}: ${response.statusText}`);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function getDepartmentMembers(
  department: Department,
  params: DepartmentMembersQuery,
  authFetch: AuthFetch,
): Promise<DepartmentMemberListResponse> {
  const search = new URLSearchParams({ offset: String(params.offset), limit: String(params.limit) });
  if (params.sort_by) search.set("sort_by", params.sort_by);
  if (params.order) search.set("order", params.order);
  params.ids?.forEach((value) => search.append("ids", value));
  if (params.search) search.set("search", params.search);
  if (params.gender) search.set("gender", params.gender);
  params.roles?.forEach((value) => search.append("roles", value));
  params.grades?.forEach((value) => search.append("grades", String(value)));
  params.letters?.forEach((value) => search.append("letters", value));
  params.graduation_years?.forEach((value) => search.append("graduation_years", String(value)));
  params.class_names?.forEach((value) => search.append("class_names", value));
  if (params.lives_in_dormitory !== undefined) search.set("lives_in_dormitory", String(params.lives_in_dormitory));
  params.positions?.forEach((value) => search.append("positions", value));
  return request<DepartmentMemberListResponse>(
    `${USER_SERVICE_PROXY}/v1/departments/${department}/members?${search.toString()}`,
    authFetch,
  );
}

export async function updateDepartmentMemberPosition(
  department: Department,
  userId: string,
  position: DepartmentMemberPosition,
  authFetch: AuthFetch,
): Promise<void> {
  const data: UpdateDepartmentMemberPositionRequest = { position };
  await request<void>(`${USER_SERVICE_PROXY}/v1/departments/${department}/members/${userId}`, authFetch, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteDepartmentMember(department: Department, userId: string, authFetch: AuthFetch): Promise<void> {
  await request<void>(`${USER_SERVICE_PROXY}/v1/departments/${department}/members/${userId}`, authFetch, { method: "DELETE" });
}

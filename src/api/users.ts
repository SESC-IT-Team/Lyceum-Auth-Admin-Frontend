import type {
  UserCreateRequest,
  UserUpdateRequest,
  UserGetResponse,
  UserListResponse,
  UpdateUserParentsOrChildrenRequest,
  UsersListQuery,
} from "./types";

const API_BASE = `${import.meta.env.VITE_AUTH_DOMAIN ?? import.meta.env.VITE_DOMAIN ?? ""}`;
const USER_SERVICE_PROXY = "/api/proxy/user-service";
type AuthFetch = (input: string, init?: RequestInit) => Promise<Response>;

async function request<T>(
  url: string,
  authFetch: AuthFetch,
  init?: RequestInit,
): Promise<T> {
  const response = await authFetch(`${API_BASE}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(
      `API Error ${response.status}: ${response.statusText}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getUsers(
  params: UsersListQuery,
  authFetch: AuthFetch,
): Promise<UserListResponse> {
  const search = new URLSearchParams();

  search.set("offset", String(params.offset));
  search.set("limit", String(params.limit));

  params.ids?.forEach((id) => search.append("ids", id));

  const searchValue = params.search ?? params.login ?? params.first_name ?? params.middle_name ?? params.last_name ?? params.full_name;
  if (searchValue) search.set("search", searchValue);

  if (params.gender) {
    search.set("gender", params.gender);
  }

  params.roles?.forEach(role =>
    search.append("roles", role),
  );

  params.grades?.forEach(grade =>
    search.append("grades", String(grade)),
  );

  params.letters?.forEach(letter =>
    search.append("letters", letter),
  );

  params.graduation_years?.forEach(year =>
    search.append("graduation_years", String(year)),
  );

  params.class_names?.forEach(name =>
    search.append("class_names", name),
  );

  if (params.lives_in_dormitory !== undefined) {
    search.set("lives_in_dormitory", String(params.lives_in_dormitory));
  }

  if (params.sort_by) {
    search.set("sort_by", params.sort_by);
  }

  if (params.order) {
    search.set("order", params.order);
  }

  return request<UserListResponse>(
    `${USER_SERVICE_PROXY}/api/v1/users?${search.toString()}`,
    authFetch,
  );
}

export async function getUser(
  userId: string,
  authFetch: AuthFetch,
): Promise<UserGetResponse> {
  return request<UserGetResponse>(
    `${USER_SERVICE_PROXY}/api/v1/users/${userId}`,
    authFetch,
  );
}

export async function createUser(
  data: UserCreateRequest,
  authFetch: AuthFetch,
): Promise<UserGetResponse> {
  return request<UserGetResponse>(
    `${USER_SERVICE_PROXY}/api/v1/users`,
    authFetch,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export async function updateUser(
  userId: string,
  data: UserUpdateRequest,
  authFetch: AuthFetch,
): Promise<UserGetResponse> {
  return request<UserGetResponse>(
    `${USER_SERVICE_PROXY}/api/v1/users/${userId}`,
    authFetch,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

export async function deleteUser(
  userId: string,
  authFetch: AuthFetch,
): Promise<void> {
  await request<void>(
    `${USER_SERVICE_PROXY}/api/v1/users/${userId}`,
    authFetch,
    {
      method: "DELETE",
    },
  );
}

export async function updateUserPassword(
  userId: string,
  password: string,
  authFetch: AuthFetch,
): Promise<void> {
  await request<void>(
    `${USER_SERVICE_PROXY}/api/v1/users/${userId}/password`,
    authFetch,
    {
      method: "PUT",
      body: JSON.stringify({ password }),
    },
  );
}

export async function getUserParents(
  userId: string,
  params: UsersListQuery,
  authFetch: AuthFetch,
): Promise<UserListResponse> {
  return getRelatedUsers(`${USER_SERVICE_PROXY}/api/v1/users/${userId}/parents`, params, authFetch);
}

export async function getUserChildren(
  userId: string,
  params: UsersListQuery,
  authFetch: AuthFetch,
): Promise<UserListResponse> {
  return getRelatedUsers(`${USER_SERVICE_PROXY}/api/v1/users/${userId}/children`, params, authFetch);
}

async function getRelatedUsers(
  path: string,
  params: UsersListQuery,
  authFetch: AuthFetch,
): Promise<UserListResponse> {
  const search = new URLSearchParams({
    offset: String(params.offset),
    limit: String(params.limit),
  });

  if (params.search) search.set("search", params.search);
  params.ids?.forEach((id) => search.append("ids", id));

  return request<UserListResponse>(`${path}?${search.toString()}`, authFetch);
}

export async function updateUserParents(
  userId: string,
  data: UpdateUserParentsOrChildrenRequest,
  authFetch: AuthFetch,
): Promise<void> {
  await updateUserRelationship(userId, "parents", data, authFetch);
}

export async function updateUserChildren(
  userId: string,
  data: UpdateUserParentsOrChildrenRequest,
  authFetch: AuthFetch,
): Promise<void> {
  await updateUserRelationship(userId, "children", data, authFetch);
}

async function updateUserRelationship(
  userId: string,
  relationship: "parents" | "children",
  data: UpdateUserParentsOrChildrenRequest,
  authFetch: AuthFetch,
): Promise<void> {
  await request<void>(
    `${USER_SERVICE_PROXY}/api/v1/users/${userId}/${relationship}`,
    authFetch,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

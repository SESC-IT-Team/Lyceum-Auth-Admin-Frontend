import type {
  UserCreateRequest,
  UserUpdateRequest,
  UserGetResponse,
  UserListResponse,
  UsersListQuery,
} from "./types";

const API_BASE = `${import.meta.env.VITE_DOMAIN}`;

async function request<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
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
): Promise<UserListResponse> {
  const search = new URLSearchParams();

  search.set("offset", String(params.offset));
  search.set("limit", String(params.limit));

  if (params.login) search.set("login", params.login);
  if (params.first_name) search.set("first_name", params.first_name);
  if (params.middle_name) search.set("middle_name", params.middle_name);
  if (params.last_name) search.set("last_name", params.last_name);
  if (params.full_name) search.set("full_name", params.full_name);

  if (params.gender) {
    search.set("gender", params.gender);
  }

  params.roles?.forEach(role =>
    search.append("roles", role),
  );

  params.permissions?.forEach(permission =>
    search.append("permissions", permission),
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

  if (params.sort_by) {
    search.set("sort_by", params.sort_by);
  }

  if (params.order) {
    search.set("order", params.order);
  }

  return request<UserListResponse>(
    `/api/v1/users?${search.toString()}`,
  );
}

export async function getUser(
  userId: string,
): Promise<UserGetResponse> {
  return request<UserGetResponse>(
    `/api/v1/users/${userId}`,
  );
}

export async function createUser(
  data: UserCreateRequest,
): Promise<UserGetResponse> {
  return request<UserGetResponse>(
    "/api/v1/users",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export async function updateUser(
  userId: string,
  data: UserUpdateRequest,
): Promise<UserGetResponse> {
  return request<UserGetResponse>(
    `/api/v1/users/${userId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

export async function deleteUser(
  userId: string,
): Promise<void> {
  await request<void>(
    `/api/v1/users/${userId}`,
    {
      method: "DELETE",
    },
  );
}

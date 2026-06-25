import type {
    Role,
    Gender,
    Department,
    Permission,
    SortingOrder,
    UserSortableField
} from "./literals"

export interface UserCreateRequest {
  last_name: string;
  first_name: string;
  login: string;
  password: string;

  roles: Role[];
  gender: Gender;

  middle_name?: string | null;
  grade?: number | null;
  letter?: string | null;
  graduation_year?: number | null;
  birthday?: string | null;
  department?: Department | null;
}

export interface UserUpdateRequest {
  last_name?: string | null;
  first_name?: string | null;
  middle_name?: string | null;

  roles?: Role[] | null;
  permissions?: Permission[] | null;

  gender?: Gender | null;

  grade?: number | null;
  letter?: string | null;
  graduation_year?: number | null;

  password?: string | null;

  birthday?: string | null;
  department?: Department | null;
}

export interface UserGetResponse {
  id: string;

  last_name: string;
  first_name: string;
  middle_name: string | null;

  full_name: string;

  gender: Gender;

  roles: Role[];
  permissions: Permission[];

  department: Department | null;

  birthday: string | null;

  grade: number | null;
  letter: string | null;
  class_name: string | null;
  graduation_year: number | null;

  login: string;

  created_at: string | null;
  updated_at: string | null;
}

export interface UserListResponse {
  items: UserGetResponse[];
  total: number;
  offset: number;
  limit: number;
}

export interface UsersListQuery {
  offset: number;
  limit: number;

  login?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  full_name?: string;

  gender?: Gender;

  roles?: Role[];
  permissions?: Permission[];

  grades?: number[];
  letters?: string[];
  graduation_years?: number[];
  class_names?: string[];

  sort_by?: UserSortableField;
  order?: SortingOrder;
}

import type {
    Role,
    Gender,
    SortingOrder,
    UserSortableField,
    DepartmentMemberPosition,
    DepartmentMemberSortableField
} from "./literals"

export interface UserCreateRequest {
  last_name: string;
  first_name: string;
  login: string;
  roles: Role[];
  gender: Gender;
  lives_in_dormitory?: boolean;

  middle_name?: string | null;
  grade?: number | null;
  letter?: string | null;
  graduation_year?: number | null;
  birthday?: string | null;
}

export interface UserUpdateRequest {
  last_name?: string | null;
  first_name?: string | null;
  middle_name?: string | null;

  roles?: Role[] | null;
  gender?: Gender | null;
  lives_in_dormitory?: boolean | null;

  grade?: number | null;
  letter?: string | null;
  graduation_year?: number | null;

  birthday?: string | null;
}

export interface UserGetResponse {
  id: string;

  last_name: string;
  first_name: string;
  middle_name: string | null;

  full_name: string;

  gender: Gender;

  roles: Role[];
  lives_in_dormitory: boolean;

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
  users: UserGetResponse[];
  total: number;
  offset: number;
  limit: number;
}

export interface UsersListQuery {
  offset: number;
  limit: number;

  ids?: string[];

  search?: string;
  login?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  full_name?: string;

  gender?: Gender;

  roles?: Role[];
  grades?: number[];
  letters?: string[];
  graduation_years?: number[];
  class_names?: string[];
  lives_in_dormitory?: boolean;

  sort_by?: UserSortableField;
  order?: SortingOrder;
}

export interface DepartmentMemberResponse {
  user: UserGetResponse;
  position: DepartmentMemberPosition;
  created_at: string;
  updated_at: string;
}

export interface DepartmentMemberListResponse {
  members: DepartmentMemberResponse[];
  total: number;
  offset: number;
  limit: number;
}

export interface DepartmentMembersQuery {
  offset: number;
  limit: number;
  sort_by?: DepartmentMemberSortableField;
  order?: SortingOrder;
  ids?: string[];
  search?: string;
  gender?: Gender;
  roles?: Role[];
  grades?: number[];
  letters?: string[];
  graduation_years?: number[];
  class_names?: string[];
  lives_in_dormitory?: boolean;
  positions?: DepartmentMemberPosition[];
}

export interface UpdateDepartmentMemberPositionRequest {
  position: DepartmentMemberPosition;
}

export interface UpdateDepartmentMembersRequest {
  ids_to_add?: string[] | null;
  ids_to_delete?: string[] | null;
}

export interface UpdateUserParentsOrChildrenRequest {
  ids_to_add?: string[] | null;
  ids_to_delete?: string[] | null;
}

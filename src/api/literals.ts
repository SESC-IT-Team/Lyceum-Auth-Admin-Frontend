export type Role =
  | "admin"
  | "teacher"
  | "student"
  | "parent"
  | "staff"
  | "guest"
  | "graduate";

export type Gender =
  | "male"
  | "female";

export type Department =
  | "academic_department"
  | "olympiad_support_department"
  | "medical_station"
  | "educational_department"
  | "library"
  | "it_department"
  | "laboratory_of_tech_teaching_aids"
  | "competitive_selection_department"
  | "additional_education_department"
  | "dormitory";

export type Permission =
  | "auth:users:create"
  | "auth:users:read"
  | "auth:users:update"
  | "auth:users:delete"
  | "auth:permissions_presets:create"
  | "auth:permissions_presets:read"
  | "auth:permissions_presets:update"
  | "auth:permissions_presets:delete"
  | "auth:basic_permissions:write"
  | "auth:keys:revoke"
  | "auth:master_permissions:write"
  | "auth:super_permission:grant"
  | "auth:super_permission:revoke"
  | "technical_support:orders:create"
  | "technical_support:orders:set_department"
  | "technical_support:orders:get"
  | "technical_support:orders:set_status"
  | "technical_support:orders:set_worker"
  | "spravki:orders:create"
  | "spravki:orders:get_my"
  | "spravki:orders:get";

export type SortingOrder =
  | "asc"
  | "desc";

export type UserSortableField =
  | "first_name"
  | "middle_name"
  | "last_name"
  | "full_name"
  | "grade"
  | "letter"
  | "class_name"
  | "graduation_year"
  | "login"
  | "gender"
  | "lives_in_dormitory"
  | "created_at"
  | "updated_at";

export type DepartmentMemberPosition = "admin" | "worker";
export type DepartmentMemberSortableField =
  | "user.full_name"
  | "user.grade"
  | "user.class_name"
  | "user.login"
  | "user.gender"
  | "user.created_at"
  | "position"
  | "created_at"
  | "updated_at";

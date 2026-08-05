import type {
  Department,
  Gender,
  Permission,
  Role,
  UserSortableField,
} from "@/api/literals";

/**
 * Central place for how the raw API literals are labelled and colored in
 * the UI. Keeping it here (instead of scattering strings across
 * components) means the palette and copy stay consistent everywhere a
 * role/permission/gender shows up.
 */

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Администратор",
  teacher: "Учитель",
  student: "Ученик",
  parent: "Родитель",
  staff: "Сотрудник",
  guest: "Гость",
  graduate: "Выпускник",
};

export const ROLE_ORDER: Role[] = [
  "admin",
  "teacher",
  "staff",
  "student",
  "parent",
  "graduate",
  "guest",
];

/**
 * One distinct color per role. `badge` classes are used for the compact
 * table/chip look (tinted background + colored text), `dot` is a solid
 * fill used for the small legend dot in the filters panel.
 */
export const ROLE_COLORS: Record<
  Role,
  { badge: string; dot: string; ring: string }
> = {
  admin: {
    badge:
      "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
    dot: "bg-rose-500",
    ring: "ring-rose-500/30",
  },
  teacher: {
    badge:
      "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
    dot: "bg-blue-500",
    ring: "ring-blue-500/30",
  },
  student: {
    badge:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/30",
  },
  parent: {
    badge:
      "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    dot: "bg-amber-500",
    ring: "ring-amber-500/30",
  },
  staff: {
    badge:
      "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400",
    dot: "bg-violet-500",
    ring: "ring-violet-500/30",
  },
  guest: {
    badge:
      "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400",
    dot: "bg-slate-500",
    ring: "ring-slate-500/30",
  },
  graduate: {
    badge:
      "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400",
    dot: "bg-cyan-500",
    ring: "ring-cyan-500/30",
  },
};

export const GENDER_LABELS: Record<Gender, string> = {
  male: "Мужской",
  female: "Женский",
};

export const DEPARTMENT_LABELS: Record<Department, string> = {
  academic_department: "Учебный отдел",
  olympiad_support_department: "Отдел олимпиадной подготовки",
  medical_station: "Медпункт",
  educational_department: "Отдел воспитательной работы",
  library: "Библиотека",
  it_department: "IT-отдел",
  laboratory_of_tech_teaching_aids: "Лаборатория ТСО",
  competitive_selection_department: "Отдел конкурсного отбора",
  additional_education_department: "Отдел доп. образования",
  dormitory: "Общежитие",
};

export const PERMISSION_LABELS: Record<Permission, string> = {
  "auth:users:create": "Создание пользователей",
  "auth:users:read": "Просмотр пользователей",
  "auth:users:update": "Редактирование пользователей",
  "auth:users:delete": "Удаление пользователей",
  "auth:permissions_presets:create": "Создание пресетов прав",
  "auth:permissions_presets:read": "Просмотр пресетов прав",
  "auth:permissions_presets:update": "Редактирование пресетов прав",
  "auth:permissions_presets:delete": "Удаление пресетов прав",
  "auth:basic_permissions:write": "Управление базовыми правами",
  "auth:keys:revoke": "Отзыв ключей доступа",
  "auth:master_permissions:write": "Управление мастер-правами",
  "auth:super_permission:grant": "Выдача супер-прав",
  "auth:super_permission:revoke": "Отзыв супер-прав",
  "technical_support:orders:create": "Создание заявок",
  "technical_support:orders:set_department": "Назначение отдела заявки",
  "technical_support:orders:get": "Просмотр заявок",
  "technical_support:orders:set_status": "Изменение статуса заявки",
  "technical_support:orders:set_worker": "Назначение исполнителя заявки",
  "spravki:orders:create": "Создание заявок на справки",
  "spravki:orders:get_my": "Просмотр своих заявок на справки",
  "spravki:orders:get": "Просмотр заявок на справки",
};

export interface PermissionGroup {
  key: string;
  label: string;
  permissions: Permission[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: "auth",
    label: "Авторизация и доступ",
    permissions: [
      "auth:users:create",
      "auth:users:read",
      "auth:users:update",
      "auth:users:delete",
      "auth:permissions_presets:create",
      "auth:permissions_presets:read",
      "auth:permissions_presets:update",
      "auth:permissions_presets:delete",
      "auth:basic_permissions:write",
      "auth:keys:revoke",
      "auth:master_permissions:write",
      "auth:super_permission:grant",
      "auth:super_permission:revoke",
    ],
  },
  {
    key: "technical_support",
    label: "Техническая поддержка",
    permissions: [
      "technical_support:orders:create",
      "technical_support:orders:set_department",
      "technical_support:orders:get",
      "technical_support:orders:set_status",
      "technical_support:orders:set_worker",
    ],
  },
  {
    key: "spravki",
    label: "Справки",
    permissions: [
      "spravki:orders:create",
      "spravki:orders:get_my",
      "spravki:orders:get",
    ],
  },
];

export const SORT_FIELD_LABELS: Record<UserSortableField, string> = {
  first_name: "Имени",
  middle_name: "Отчеству",
  last_name: "Фамилии",
  full_name: "ФИО",
  grade: "Классу",
  letter: "Букве класса",
  class_name: "Названию класса",
  graduation_year: "Году выпуска",
  login: "Логину",
  gender: "Полу",
  created_at: "Дате создания",
  updated_at: "Дате обновления",
};

export const SORT_FIELD_ORDER: UserSortableField[] = [
  "created_at",
  "updated_at",
  "full_name",
  "last_name",
  "first_name",
  "middle_name",
  "login",
  "gender",
  "grade",
  "letter",
  "class_name",
  "graduation_year",
];

export type SearchableField =
  | "full_name"
  | "login"
  | "first_name"
  | "last_name"
  | "middle_name";

export const SEARCH_FIELD_LABELS: Record<SearchableField, string> = {
  full_name: "ФИО",
  login: "Логин",
  first_name: "Имя",
  last_name: "Фамилия",
  middle_name: "Отчество",
};

export const SEARCH_FIELD_ORDER: SearchableField[] = [
  "full_name",
  "login",
  "first_name",
  "last_name",
  "middle_name",
];

export const GRADE_OPTIONS: number[] = [5, 6, 7, 8, 9, 10, 11];

export const LETTER_OPTIONS: string[] = ["А", "Б", "В", "Г", "Д", "Е"];

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

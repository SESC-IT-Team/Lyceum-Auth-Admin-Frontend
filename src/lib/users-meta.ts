import type { Department, Gender, Role, UserSortableField } from "@/api/literals";

export type SearchableField = "full_name" | "login";

export const SEARCH_FIELD_ORDER: SearchableField[] = ["full_name", "login"];
export const SEARCH_FIELD_LABELS: Record<SearchableField, string> = {
  full_name: "ФИО",
  login: "Логину",
};

export const SORT_FIELD_ORDER: UserSortableField[] = [
  "created_at",
  "full_name",
  "login",
  "grade",
  "graduation_year",
];
export const SORT_FIELD_LABELS: Record<UserSortableField, string> = {
  first_name: "Имени",
  middle_name: "Отчеству",
  last_name: "Фамилии",
  full_name: "ФИО",
  grade: "Классу",
  letter: "Букве класса",
  class_name: "Классу",
  graduation_year: "Году выпуска",
  login: "Логину",
  gender: "Полу",
  lives_in_dormitory: "Общежитию",
  created_at: "Дате создания",
  updated_at: "Дате изменения",
};

export const DEPARTMENT_LABELS: Record<Department, string> = {
  academic_department: "Академический отдел",
  olympiad_support_department: "Отдел олимпиадной поддержки",
  medical_station: "Медицинский пункт",
  educational_department: "Учебный отдел",
  library: "Библиотека",
  it_department: "IT-отдел",
  laboratory_of_tech_teaching_aids: "Лаборатория технических средств",
  competitive_selection_department: "Отдел конкурсного отбора",
  additional_education_department: "Отдел дополнительного образования",
  dormitory: "Общежитие",
};

export const GENDER_LABELS: Record<Gender, string> = { male: "Мужской", female: "Женский" };
export const ROLE_ORDER: Role[] = ["admin", "teacher", "student", "parent", "staff", "guest", "graduate"];
export const ROLE_LABELS: Record<Role, string> = {
  admin: "Администратор", teacher: "Учитель", student: "Ученик", parent: "Родитель",
  staff: "Сотрудник", guest: "Гость", graduate: "Выпускник",
};
export const ROLE_COLORS: Record<Role, { badge: string; dot: string }> = {
  admin: { badge: "border-red-200 text-red-700", dot: "bg-red-500" },
  teacher: { badge: "border-blue-200 text-blue-700", dot: "bg-blue-500" },
  student: { badge: "border-green-200 text-green-700", dot: "bg-green-500" },
  parent: { badge: "border-amber-200 text-amber-700", dot: "bg-amber-500" },
  staff: { badge: "border-cyan-200 text-cyan-700", dot: "bg-cyan-500" },
  guest: { badge: "border-slate-200 text-slate-700", dot: "bg-slate-500" },
  graduate: { badge: "border-violet-200 text-violet-700", dot: "bg-violet-500" },
};

export const GRADE_OPTIONS = Array.from({ length: 11 }, (_, index) => index + 1);
export const LETTER_OPTIONS = ["А", "Б", "В", "Г", "Д", "Е"];

export function getInitials(name: string) { return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }
export function formatDate(value: string | null) { return value ? new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(new Date(value)) : "—"; }
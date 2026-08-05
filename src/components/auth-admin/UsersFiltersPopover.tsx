import { FilterIcon, RotateCcwIcon, XIcon } from "lucide-react";
import type { Gender, Permission, Role } from "@/api/literals";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FieldLegend, FieldSet } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import {
  GENDER_LABELS,
  GRADE_OPTIONS,
  LETTER_OPTIONS,
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
  ROLE_ORDER,
  type PermissionGroup,
} from "@/lib/users-meta";
import { RoleDotLabel } from "@/components/auth-admin/RoleBadge";

export interface FiltersState {
  gender: Gender | null;
  roles: Role[];
  permissions: Permission[];
  grades: number[];
  letters: string[];
}

export const EMPTY_FILTERS: FiltersState = {
  gender: null,
  roles: [],
  permissions: [],
  grades: [],
  letters: [],
};

export function countActiveFilters(filters: FiltersState): number {
  return (
    (filters.gender ? 1 : 0) +
    filters.roles.length +
    filters.permissions.length +
    filters.grades.length +
    filters.letters.length
  );
}

function mergeGroupPermissions(
  current: Permission[],
  group: PermissionGroup,
  nextInGroup: string[],
): Permission[] {
  const outsideGroup = current.filter((p) => !group.permissions.includes(p));
  return [...outsideGroup, ...(nextInGroup as Permission[])];
}

interface UsersFiltersPopoverProps {
  value: FiltersState;
  onChange: (next: FiltersState) => void;
}

export function UsersFiltersPopover({
  value,
  onChange,
}: UsersFiltersPopoverProps) {
  const activeCount = countActiveFilters(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={activeCount > 0 ? "secondary" : "outline"}
          className="gap-2"
        >
          <FilterIcon aria-hidden="true" className="size-4" />
          Фильтры
          {activeCount > 0 && (
            <Badge className="users-admin-badge-pop -me-1" variant="info">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-104 p-0">
        <PopoverHeader
          className="px-4 pt-4"
          description="Уточните список по нескольким признакам сразу"
          title="Фильтры"
        />

        <PopoverBody className="flex max-h-104 flex-col gap-5 overflow-y-auto px-4 py-4">
          <FieldSet className="gap-2">
            <div className="flex items-center justify-between">
              <FieldLegend variant="label">Пол</FieldLegend>
              {value.gender && (
                <Button
                  aria-label="Сбросить пол"
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => onChange({ ...value, gender: null })}
                >
                  <XIcon className="size-3.5" />
                </Button>
              )}
            </div>
            <ToggleGroup
              multiple={false}
              value={value.gender ? [value.gender] : []}
              onValueChange={(details: { value: string[] }) =>
                onChange({
                  ...value,
                  gender: (details.value[0] as Gender) ?? null,
                })
              }
              className="flex flex-wrap gap-2"
            >
              {(Object.keys(GENDER_LABELS) as Gender[]).map((gender) => (
                <ToggleGroupItem key={gender} value={gender}>
                  {GENDER_LABELS[gender]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </FieldSet>

          <FieldSet className="gap-2">
            <FieldLegend variant="label">Роли</FieldLegend>
            <ToggleGroup
              value={value.roles}
              onValueChange={(details: { value: string[] }) =>
                onChange({ ...value, roles: details.value as Role[] })
              }
              className="flex flex-wrap gap-2"
            >
              {ROLE_ORDER.map((role) => (
                <ToggleGroupItem key={role} value={role}>
                  <RoleDotLabel role={role} />
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </FieldSet>

          <FieldSet className="gap-3">
            <FieldLegend variant="label">Разрешения</FieldLegend>
            <div className="flex flex-col gap-3">
              {PERMISSION_GROUPS.map((group) => {
                const groupValue = value.permissions.filter((p) =>
                  group.permissions.includes(p),
                );
                return (
                  <div key={group.key} className="flex flex-col gap-1.5">
                    <span className="text-muted-foreground text-xs">
                      {group.label}
                    </span>
                    <ToggleGroup
                      value={groupValue}
                      onValueChange={(details: { value: string[] }) =>
                        onChange({
                          ...value,
                          permissions: mergeGroupPermissions(
                            value.permissions,
                            group,
                            details.value,
                          ),
                        })
                      }
                      className="flex flex-wrap gap-2"
                    >
                      {group.permissions.map((permission) => (
                        <ToggleGroupItem
                          key={permission}
                          value={permission}
                          className="text-xs"
                        >
                          {PERMISSION_LABELS[permission]}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>
                );
              })}
            </div>
          </FieldSet>

          <FieldSet className="gap-2">
            <FieldLegend variant="label">Класс</FieldLegend>
            <ToggleGroup
              value={value.grades.map(String)}
              onValueChange={(details: { value: string[] }) =>
                onChange({ ...value, grades: details.value.map(Number) })
              }
              className="flex flex-wrap gap-2"
            >
              {GRADE_OPTIONS.map((grade) => (
                <ToggleGroupItem key={grade} value={String(grade)}>
                  {grade}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </FieldSet>

          <FieldSet className="gap-2">
            <FieldLegend variant="label">Буква класса</FieldLegend>
            <ToggleGroup
              value={value.letters}
              onValueChange={(details: { value: string[] }) =>
                onChange({ ...value, letters: details.value })
              }
              className="flex flex-wrap gap-2"
            >
              {LETTER_OPTIONS.map((letter) => (
                <ToggleGroupItem key={letter} value={letter}>
                  {letter}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </FieldSet>
        </PopoverBody>

        <PopoverFooter className="justify-between px-4 pb-4">
          <Button
            className={cn("gap-2", activeCount === 0 && "invisible")}
            size="sm"
            variant="ghost"
            onClick={() => onChange(EMPTY_FILTERS)}
          >
            <RotateCcwIcon aria-hidden="true" className="size-3.5" />
            Сбросить всё
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}

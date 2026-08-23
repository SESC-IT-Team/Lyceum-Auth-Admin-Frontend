import { FilterIcon, PlusIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { useState } from "react";
import type { Gender, Role } from "@/api/literals";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  ROLE_ORDER,
} from "@/lib/users-meta";
import { RoleDotLabel } from "@/components/auth-admin/RoleBadge";

export interface FiltersState {
  gender: Gender | null;
  roles: Role[];
  grades: number[];
  letters: string[];
  graduationYears: number[];
  livesInDormitory: boolean | null;
}

export const EMPTY_FILTERS: FiltersState = {
  gender: null,
  roles: [],
  grades: [],
  letters: [],
  graduationYears: [],
  livesInDormitory: null,
};

export function countActiveFilters(filters: FiltersState): number {
  return (
    (filters.gender ? 1 : 0) +
    filters.roles.length +
    filters.grades.length +
    filters.letters.length +
    filters.graduationYears.length +
    (filters.livesInDormitory === null ? 0 : 1)
  );
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
  const [yearInput, setYearInput] = useState("");

  function addGraduationYear() {
    const year = Number(yearInput);
    if (!Number.isInteger(year) || value.graduationYears.includes(year)) return;

    onChange({
      ...value,
      graduationYears: [...value.graduationYears, year].sort((a, b) => a - b),
    });
    setYearInput("");
  }

  function removeGraduationYear(year: number) {
    onChange({
      ...value,
      graduationYears: value.graduationYears.filter((current) => current !== year),
    });
  }

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

          <FieldSet className="gap-2">
            <FieldLegend variant="label">Год выпуска</FieldLegend>
            <div className="flex items-center gap-2">
              <Input
                className="h-8 w-28"
                inputMode="numeric"
                maxLength={4}
                placeholder="2026"
                value={yearInput}
                onChange={(event) => setYearInput(event.target.value.replace(/\D/g, ""))}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addGraduationYear();
                  }
                }}
              />
              <Button
                aria-label="Добавить год выпуска"
                size="icon-sm"
                type="button"
                onClick={addGraduationYear}
              >
                <PlusIcon aria-hidden="true" />
              </Button>
            </div>
            {value.graduationYears.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {value.graduationYears.map((year) => (
                  <Badge key={year} className="gap-1" variant="secondary">
                    {year}
                    <button
                      aria-label={`Удалить год ${year}`}
                      className="text-muted-foreground hover:text-foreground"
                      type="button"
                      onClick={() => removeGraduationYear(year)}
                    >
                      <XIcon aria-hidden="true" className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </FieldSet>

          <FieldSet className="gap-2">
            <FieldLegend variant="label">Общежитие</FieldLegend>
            <ToggleGroup
              multiple={false}
              value={value.livesInDormitory === null ? [] : [String(value.livesInDormitory)]}
              onValueChange={(details: { value: string[] }) =>
                onChange({
                  ...value,
                  livesInDormitory: details.value[0] === undefined ? null : details.value[0] === "true",
                })
              }
              className="flex flex-wrap gap-2"
            >
              <ToggleGroupItem value="true">Живет</ToggleGroupItem>
              <ToggleGroupItem value="false">Не живет</ToggleGroupItem>
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

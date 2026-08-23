import type { ChangeEvent } from "react";
import { ArrowUpAZ, Columns3Icon, PlusIcon, SearchIcon, XIcon } from "lucide-react";
import type { SortingOrder, UserSortableField } from "@/api/literals";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createListCollection } from "@ark-ui/react/collection";
import {
  SEARCH_FIELD_LABELS,
  SEARCH_FIELD_ORDER,
  SORT_FIELD_LABELS,
  SORT_FIELD_ORDER,
  type SearchableField,
} from "@/lib/users-meta";
import{ type FiltersState, UsersFiltersPopover } from "@/components/auth-admin/UsersFiltersPopover";
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuTrigger,
} from "@/components/ui/menu";
import { USER_COLUMNS, type UserColumnKey } from "@/components/auth-admin/UsersTable";

const searchFieldCollection = createListCollection({
  items: SEARCH_FIELD_ORDER.map((value) => ({
    label: SEARCH_FIELD_LABELS[value],
    value,
  })),
});

const sortFieldCollection = createListCollection({
  items: SORT_FIELD_ORDER.map((value) => ({
    label: SORT_FIELD_LABELS[value],
    value,
  })),
});

interface UsersToolbarProps {
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  searchField: SearchableField;
  onSearchFieldChange: (field: SearchableField) => void;
  sortBy: UserSortableField;
  onSortByChange: (field: UserSortableField) => void;
  order: SortingOrder;
  onOrderToggle: () => void;
  filters: FiltersState;
  onFiltersChange: (next: FiltersState) => void;
  isFetching: boolean;
  visibleColumns: UserColumnKey[];
  onVisibleColumnsChange: (columns: UserColumnKey[]) => void;
  onCreateUser: () => void;
}

export function UsersToolbar({
  searchValue,
  onSearchValueChange,
  searchField,
  onSearchFieldChange,
  sortBy,
  onSortByChange,
  order,
  onOrderToggle,
  filters,
  onFiltersChange,
  isFetching,
  visibleColumns,
  onVisibleColumnsChange,
  onCreateUser,
}: UsersToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <InputGroup className="sm:max-w-sm">
        <InputGroupAddon align="inline-start">
          <SearchIcon
            aria-hidden="true"
            className={cn("size-4", isFetching && "animate-pulse")}
          />
        </InputGroupAddon>
        <InputGroupInput
          placeholder={`Поиск по полю «${SEARCH_FIELD_LABELS[searchField]}»…`}
          value={searchValue}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onSearchValueChange(e.target.value)
          }
        />
        <InputGroupAddon align="inline-end" className="gap-1">
          {searchValue && (
            <InputGroupButton
              aria-label="Очистить поиск"
              size="icon-xs"
              onClick={() => onSearchValueChange("")}
            >
              <XIcon />
            </InputGroupButton>
          )}
          <Select
            collection={searchFieldCollection}
            value={[searchField]}
            onValueChange={(details) =>
              onSearchFieldChange(details.value[0] as SearchableField)
            }
            
          >
            <SelectTrigger
              aria-label="Поле поиска"
              className="h-7 border-none bg-transparent px-2 shadow-none"
              size="sm"
            >
              <SelectValue placeholder="Поле" />
            </SelectTrigger>
            <SelectContent>
              {searchFieldCollection.items.map((item) => (
                <SelectItem key={item.value} item={item}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </InputGroupAddon>
      </InputGroup>

      <div className="flex items-center gap-2">
        <Button onClick={onCreateUser}>
          <PlusIcon aria-hidden="true" />
          Добавить пользователя
        </Button>
        <Select
          collection={sortFieldCollection}
          value={[sortBy]}
          onValueChange={(details) =>
            onSortByChange(details.value[0] as UserSortableField)
          }
        >
          <SelectTrigger aria-label="Сортировать по" className="w-44">
            <SelectValue placeholder="Сортировка" />
          </SelectTrigger>
          <SelectContent>
            {sortFieldCollection.items.map((item) => (
              <SelectItem key={item.value} item={item}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          aria-label={
            order === "asc" ? "По возрастанию" : "По убыванию"
          }
          variant="outline"
          size="icon-md"
          onClick={onOrderToggle}
        >
          <ArrowUpAZ
            aria-hidden="true"
            className={cn(
              "size-4 transition-transform duration-300 ease-out",
              order === "desc" && "rotate-180",
            )}
          />
        </Button>

        <UsersFiltersPopover value={filters} onChange={onFiltersChange} />
        <Menu>
          <MenuTrigger asChild>
            <Button aria-label="Настроить колонки" variant="outline" size="icon-md">
              <Columns3Icon aria-hidden="true" />
            </Button>
          </MenuTrigger>
          <MenuContent>
            <MenuGroup heading="Колонки таблицы">
              {USER_COLUMNS.map(({ key, label }) => (
                <MenuCheckboxItem
                  key={key}
                  checked={visibleColumns.includes(key)}
                  value={key}
                  closeOnSelect={false}
                  onCheckedChange={(checked) => {
                    onVisibleColumnsChange(
                      checked
                        ? [...visibleColumns, key]
                        : visibleColumns.filter((column) => column !== key),
                    );
                  }}
                >
                  {label}
                </MenuCheckboxItem>
              ))}
            </MenuGroup>
          </MenuContent>
        </Menu>
      </div>
    </div>
  );
}

import { useAuthFetch } from "auth-lib";
import { PlusIcon, SearchIcon, Trash2Icon, UsersRoundIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { createListCollection } from "@ark-ui/react/collection";
import type { Department, DepartmentMemberPosition, DepartmentMemberSortableField, SortingOrder } from "@/api/literals";
import { deleteDepartmentMember, updateDepartmentMemberPosition } from "@/api/departments";
import type { UsersListQuery } from "@/api/types";
import { useDepartmentMembersQuery } from "@/hooks/useDepartmentMembersQuery";
import { useUsersQuery } from "@/hooks/useUsersQuery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader } from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEPARTMENT_LABELS } from "@/lib/users-meta";

const PAGE_SIZE = 20;
const DEPARTMENTS = Object.keys(DEPARTMENT_LABELS) as Department[];
const departmentCollection = createListCollection({ items: DEPARTMENTS.map((value) => ({ value, label: DEPARTMENT_LABELS[value] })) });
const sortCollection = createListCollection({ items: [
  { value: "user.full_name", label: "ФИО" },
  { value: "user.grade", label: "Класс" },
  { value: "user.login", label: "Логин" },
  { value: "position", label: "Должность" },
  { value: "created_at", label: "Дата добавления" },
] });

export default function DepartmentsPage() {
  const authFetch = useAuthFetch();
  const [department, setDepartment] = useState<Department>(DEPARTMENTS[0]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<DepartmentMemberSortableField>("user.full_name");
  const [order, setOrder] = useState<SortingOrder>("asc");
  const [positions, setPositions] = useState<DepartmentMemberPosition[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const query = useMemo(() => ({ offset: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE, search: search || undefined, sort_by: sortBy, order, positions: positions.length ? positions : undefined }), [page, search, sortBy, order, positions]);
  const members = useDepartmentMembersQuery(department, query);
  const [userSearch, setUserSearch] = useState("");
  const userQuery: UsersListQuery = useMemo(() => ({ offset: 0, limit: 50, search: userSearch || undefined }), [userSearch]);
  const users = useUsersQuery(userQuery);
  const pageCount = Math.max(1, Math.ceil(members.total / PAGE_SIZE));

  async function changePosition(userId: string, position: DepartmentMemberPosition) {
    try { await updateDepartmentMemberPosition(department, userId, position, authFetch); members.reload(); }
    catch (reason: unknown) { setActionError(reason instanceof Error ? reason.message : "Не удалось изменить должность"); }
  }

  async function removeMember(userId: string) {
    try { await deleteDepartmentMember(department, userId, authFetch); members.reload(); }
    catch (reason: unknown) { setActionError(reason instanceof Error ? reason.message : "Не удалось удалить сотрудника"); }
  }

  async function addMembers() {
    if (!selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map((userId) => updateDepartmentMemberPosition(department, userId, "worker", authFetch)));
      setSelectedIds([]);
      setAddOpen(false);
      members.reload();
    }
    catch (reason: unknown) { setActionError(reason instanceof Error ? reason.message : "Не удалось добавить сотрудников"); }
  }

  return <div className="mx-auto flex w-full max-w-8xl flex-col gap-6 p-6">
    <header className="flex flex-col gap-1"><h1 className="text-2xl font-semibold tracking-tight">Отделы</h1><p className="text-muted-foreground text-sm">Управление сотрудниками и должностями отделов</p></header>
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Select collection={departmentCollection} value={[department]} onValueChange={(details) => { setDepartment(details.value[0] as Department); setPage(1); }}><SelectTrigger className="w-full lg:w-80"><SelectValue placeholder="Выберите отдел" /></SelectTrigger><SelectContent>{departmentCollection.items.map((item) => <SelectItem key={item.value} item={item}>{item.label}</SelectItem>)}</SelectContent></Select>
        <Button onClick={() => setAddOpen(true)}><PlusIcon aria-hidden="true" />Добавить сотрудников</Button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1"><SearchIcon aria-hidden="true" className="text-muted-foreground absolute inset-s-3 top-2.5 size-4" /><Input className="ps-9" placeholder="Поиск сотрудников" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div>
        <Select collection={sortCollection} value={[sortBy]} onValueChange={(details) => setSortBy(details.value[0] as DepartmentMemberSortableField)}><SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Сортировка" /></SelectTrigger><SelectContent>{sortCollection.items.map((item) => <SelectItem key={item.value} item={item}>{item.label}</SelectItem>)}</SelectContent></Select>
        <Button variant="outline" onClick={() => setOrder((value) => value === "asc" ? "desc" : "asc")}>{order === "asc" ? "А-Я" : "Я-А"}</Button>
        <div className="flex gap-2"><Button variant={positions.includes("admin") ? "secondary" : "outline"} onClick={() => setPositions((value) => value.includes("admin") ? value.filter((item) => item !== "admin") : [...value, "admin"])}>Admin</Button><Button variant={positions.includes("worker") ? "secondary" : "outline"} onClick={() => setPositions((value) => value.includes("worker") ? value.filter((item) => item !== "worker") : [...value, "worker"])}>Worker</Button></div>
      </div>
      {actionError && <p className="text-destructive rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">{actionError}</p>}
      <div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Сотрудник</TableHead><TableHead>Логин</TableHead><TableHead>Класс</TableHead><TableHead>Должность</TableHead><TableHead className="text-right">Действия</TableHead></TableRow></TableHeader><TableBody>{members.isLoading ? <TableRow><TableCell colSpan={5} className="h-32 text-center">Загрузка...</TableCell></TableRow> : members.error ? <TableRow><TableCell colSpan={5} className="h-32 text-center text-destructive">{members.error}</TableCell></TableRow> : members.members.length === 0 ? <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">В отделе пока нет сотрудников</TableCell></TableRow> : members.members.map((member) => <TableRow key={member.user.id}><TableCell className="font-medium">{member.user.full_name}</TableCell><TableCell className="text-muted-foreground">{member.user.login}</TableCell><TableCell>{member.user.class_name ?? "—"}</TableCell><TableCell><select className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm" value={member.position} onChange={(event) => void changePosition(member.user.id, event.target.value as DepartmentMemberPosition)}><option value="admin">Admin</option><option value="worker">Worker</option></select></TableCell><TableCell className="text-right"><Button aria-label={`Удалить ${member.user.full_name}`} size="icon-sm" variant="ghost" onClick={() => void removeMember(member.user.id)}><Trash2Icon aria-hidden="true" /></Button></TableCell></TableRow>)}</TableBody></Table></div>
      <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Всего: {members.total}</span><div className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Назад</Button><span>{page} / {pageCount}</span><Button size="sm" variant="outline" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}>Вперед</Button></div></div>
    </div>
    <Drawer open={addOpen} onOpenChange={({ open }) => setAddOpen(open)} swipeDirection="end"><DrawerContent className="max-w-xl" showCloseButton><DrawerHeader title="Добавить сотрудников" description={`Выберите пользователей для отдела «${DEPARTMENT_LABELS[department]}»`} /><DrawerBody className="text-left"><div className="flex flex-col gap-3"><Input placeholder="Поиск пользователей" value={userSearch} onChange={(event) => setUserSearch(event.target.value)} />{users.users.map((user) => <label key={user.id} className="border-border flex items-center gap-3 rounded-lg border p-3"><Checkbox checked={selectedIds.includes(user.id)} onCheckedChange={(details) => setSelectedIds((value) => details.checked === true ? [...new Set([...value, user.id])] : value.filter((id) => id !== user.id))} /><span><span className="block font-medium">{user.full_name}</span><span className="text-muted-foreground text-xs">{user.login}</span></span></label>)}</div></DrawerBody><DrawerFooter className="flex-row justify-end"><DrawerClose asChild><Button variant="outline">Отмена</Button></DrawerClose><Button disabled={!selectedIds.length} onClick={() => void addMembers()}><UsersRoundIcon aria-hidden="true" />Добавить ({selectedIds.length})</Button></DrawerFooter></DrawerContent></Drawer>
  </div>;
}
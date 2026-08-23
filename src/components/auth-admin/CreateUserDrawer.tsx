import { useAuthFetch } from "auth-lib";
import { PlusIcon, XIcon } from "lucide-react";
import { useState } from "react";
import type { Gender, Role } from "@/api/literals";
import { createUser, updateUserPassword } from "@/api/users";
import type { UserCreateRequest } from "@/api/types";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { GENDER_LABELS, ROLE_LABELS, ROLE_ORDER } from "@/lib/users-meta";

interface CreateUserDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

interface CreateUserForm {
  last_name: string;
  first_name: string;
  middle_name: string;
  login: string;
  roles: Role[];
  gender: Gender;
  lives_in_dormitory: boolean;
  grade: string;
  letter: string;
  graduation_year: string;
  birthday: string;
  password: string;
}

const INITIAL_FORM: CreateUserForm = {
  last_name: "",
  first_name: "",
  middle_name: "",
  login: "",
  roles: [],
  gender: "male",
  lives_in_dormitory: false,
  grade: "",
  letter: "",
  graduation_year: "",
  birthday: "",
  password: "",
};

function optionalNumber(value: string) {
  return value ? Number(value) : null;
}

export function CreateUserDrawer({
  open,
  onOpenChange,
  onCreated,
}: CreateUserDrawerProps) {
  const authFetch = useAuthFetch();
  const [form, setForm] = useState<CreateUserForm>(INITIAL_FORM);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<Key extends keyof CreateUserForm>(
    key: Key,
    value: CreateUserForm[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleRole(role: Role, checked: boolean) {
    updateField(
      "roles",
      checked
        ? [...form.roles, role]
        : form.roles.filter((currentRole) => currentRole !== role),
    );
  }

  function resetAndClose() {
    setForm(INITIAL_FORM);
    setError(null);
    onOpenChange(false);
  }

  async function handleCreate() {
    if (!form.last_name || !form.first_name || !form.login || !form.password || form.roles.length === 0) {
      setError("Заполните обязательные поля, пароль и выберите хотя бы одну роль.");
      return;
    }

    const data: UserCreateRequest = {
      last_name: form.last_name,
      first_name: form.first_name,
      login: form.login,
      roles: form.roles,
      gender: form.gender,
      lives_in_dormitory: form.lives_in_dormitory,
      middle_name: form.middle_name || null,
      grade: optionalNumber(form.grade),
      letter: form.letter || null,
      graduation_year: optionalNumber(form.graduation_year),
      birthday: form.birthday || null,
    };

    setIsCreating(true);
    setError(null);
    try {
      const createdUser = await createUser(data, authFetch);
      await updateUserPassword(createdUser.id, form.password, authFetch);
      onCreated();
      resetAndClose();
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Не удалось создать пользователя");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={({ open: nextOpen }) => onOpenChange(nextOpen)} swipeDirection="end">
      <DrawerContent className="max-w-xl" showCloseButton>
        <DrawerHeader className="border-b text-left" title="Новый пользователь">
        </DrawerHeader>

        <DrawerBody className="text-left">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <h2 className="font-semibold text-sm mt-2">Основная информация</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm">Фамилия *<Input value={form.last_name} onChange={(event) => updateField("last_name", event.target.value)} /></label>
                <label className="flex flex-col gap-1.5 text-sm">Имя *<Input value={form.first_name} onChange={(event) => updateField("first_name", event.target.value)} /></label>
                <label className="flex flex-col gap-1.5 text-sm">Отчество<Input value={form.middle_name} onChange={(event) => updateField("middle_name", event.target.value)} /></label>
                <label className="flex flex-col gap-1.5 text-sm">Логин *<Input value={form.login} onChange={(event) => updateField("login", event.target.value)} /></label>
                <label className="flex flex-col gap-1.5 text-sm">Пол
                  <select className="h-8 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/32" value={form.gender} onChange={(event) => updateField("gender", event.target.value as Gender)}>
                    <option value="male">{GENDER_LABELS.male}</option>
                    <option value="female">{GENDER_LABELS.female}</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1.5 text-sm">День рождения<Input type="date" value={form.birthday} onChange={(event) => updateField("birthday", event.target.value)} /></label>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-semibold text-sm">Доступ и обучение</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="flex flex-col gap-1.5 text-sm">Класс<Input inputMode="numeric" value={form.grade} onChange={(event) => updateField("grade", event.target.value)} /></label>
                <label className="flex flex-col gap-1.5 text-sm">Буква<Input value={form.letter} onChange={(event) => updateField("letter", event.target.value)} /></label>
                <label className="flex flex-col gap-1.5 text-sm">Год выпуска<Input inputMode="numeric" value={form.graduation_year} onChange={(event) => updateField("graduation_year", event.target.value)} /></label>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {ROLE_ORDER.map((role) => (
                  <label key={role} className="border-border hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 transition-colors">
                    <Checkbox checked={form.roles.includes(role)} onCheckedChange={(details) => toggleRole(role, details.checked === true)} />
                    <span className="text-sm">{ROLE_LABELS[role]}</span>
                  </label>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.lives_in_dormitory} onCheckedChange={(details) => updateField("lives_in_dormitory", details.checked === true)} />Проживает в общежитии</label>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-semibold text-sm">Безопасность</h2>
              <label className="flex flex-col gap-1.5 text-sm">Пароль *<Input type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} /></label>
            </section>

            {error && <p className="text-destructive rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">{error}</p>}
          </div>
        </DrawerBody>

        <DrawerFooter className="flex-row justify-end">
          <DrawerClose asChild><Button type="button" variant="outline" onClick={resetAndClose}><XIcon aria-hidden="true" />Отмена</Button></DrawerClose>
          <Button type="button" onClick={() => void handleCreate()} isLoading={isCreating}><PlusIcon aria-hidden="true" />Создать</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
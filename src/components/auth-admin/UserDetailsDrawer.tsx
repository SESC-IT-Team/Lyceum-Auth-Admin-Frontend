import { useAuthFetch } from "auth-lib";
import {
  KeyRoundIcon,
  SaveIcon,
  ShieldAlertIcon,
  Trash2Icon,
  UserRoundIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Gender, Role } from "@/api/literals";
import { deleteUser, updateUser, updateUserPassword } from "@/api/users";
import type { UserGetResponse, UserUpdateRequest } from "@/api/types";
import { UserRelationshipsSection } from "@/components/auth-admin/UserRelationshipsSection";
import type { UserRelationshipsSectionHandle } from "@/components/auth-admin/UserRelationshipsSection";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

interface UserDetailsDrawerProps {
  user: UserGetResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}

interface UserFormState {
  last_name: string;
  first_name: string;
  middle_name: string;
  roles: Role[];
  gender: Gender;
  lives_in_dormitory: boolean;
  grade: string;
  letter: string;
  graduation_year: string;
  birthday: string;
  password: string;
}

const emptyForm: UserFormState = {
  last_name: "",
  first_name: "",
  middle_name: "",
  roles: [],
  gender: "male",
  lives_in_dormitory: false,
  grade: "",
  letter: "",
  graduation_year: "",
  birthday: "",
  password: "",
};

function toForm(user: UserGetResponse): UserFormState {
  return {
    last_name: user.last_name,
    first_name: user.first_name,
    middle_name: user.middle_name ?? "",
    roles: user.roles,
    gender: user.gender,
    lives_in_dormitory: user.lives_in_dormitory,
    grade: user.grade?.toString() ?? "",
    letter: user.letter ?? "",
    graduation_year: user.graduation_year?.toString() ?? "",
    birthday: user.birthday ?? "",
    password: "",
  };
}

function optionalNumber(value: string) {
  return value ? Number(value) : null;
}

export function UserDetailsDrawer({
  user,
  open,
  onOpenChange,
  onChanged,
}: UserDetailsDrawerProps) {
  const authFetch = useAuthFetch();
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [relationshipsChanged, setRelationshipsChanged] = useState(false);
  const relationshipsRef = useRef<UserRelationshipsSectionHandle>(null);
  const originalForm = user ? toForm(user) : emptyForm;
  const hasChanges = user !== null && (
    form.last_name !== originalForm.last_name ||
    form.first_name !== originalForm.first_name ||
    form.middle_name !== originalForm.middle_name ||
    form.gender !== originalForm.gender ||
    form.lives_in_dormitory !== originalForm.lives_in_dormitory ||
    form.grade !== originalForm.grade ||
    form.letter !== originalForm.letter ||
    form.graduation_year !== originalForm.graduation_year ||
    form.birthday !== originalForm.birthday ||
    form.password.length > 0 ||
    form.roles.length !== originalForm.roles.length ||
    form.roles.some((role) => !originalForm.roles.includes(role))
    || relationshipsChanged
  );

  useEffect(() => {
    if (user) {
      setForm(toForm(user));
      setError(null);
    }
  }, [user]);

  function updateField<Key extends keyof UserFormState>(
    key: Key,
    value: UserFormState[Key],
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

  async function handleSave() {
    if (!user) return;
    setIsSaving(true);
    setError(null);

    const data: UserUpdateRequest = {
      last_name: form.last_name || null,
      first_name: form.first_name || null,
      middle_name: form.middle_name || null,
      roles: form.roles,
      gender: form.gender,
      lives_in_dormitory: form.lives_in_dormitory,
      grade: optionalNumber(form.grade),
      letter: form.letter || null,
      graduation_year: optionalNumber(form.graduation_year),
      birthday: form.birthday || null,
    };

    try {
      await updateUser(user.id, data, authFetch);
      if (form.password) {
        await updateUserPassword(user.id, form.password, authFetch);
      }
      await relationshipsRef.current?.save();
      setForm((current) => ({ ...current, password: "" }));
      onChanged();
      onOpenChange(false);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Не удалось сохранить изменения");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!user) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteUser(user.id, authFetch);
      setDeleteOpen(false);
      onOpenChange(false);
      onChanged();
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Не удалось удалить пользователя");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Drawer open={open} onOpenChange={({ open: nextOpen }) => onOpenChange(nextOpen)} swipeDirection="end">
        <DrawerContent
          className="max-w-xl will-change-transform data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none!"
          showCloseButton
        >
          {user && (
            <>
              <DrawerHeader className="border-b text-left" title={user.full_name}>
                <div className="mt-3 flex items-center gap-2 text-left">
                  <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl">
                    <UserRoundIcon aria-hidden="true" className="size-5" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Идентификатор</p>
                    <p className="font-mono text-xs">{user.id}</p>
                  </div>
                </div>
              </DrawerHeader>

              <DrawerBody className="text-left">
                <div className="flex flex-col gap-6">
                  <section className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 mt-2">
                      <UserRoundIcon aria-hidden="true" className="text-primary size-4" />
                      <h2 className="font-semibold text-sm">Основная информация</h2>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex flex-col gap-1.5 text-sm">Фамилия<Input value={form.last_name} onChange={(event) => updateField("last_name", event.target.value)} /></label>
                      <label className="flex flex-col gap-1.5 text-sm">Имя<Input value={form.first_name} onChange={(event) => updateField("first_name", event.target.value)} /></label>
                      <label className="flex flex-col gap-1.5 text-sm">Отчество<Input value={form.middle_name} onChange={(event) => updateField("middle_name", event.target.value)} /></label>
                      <label className="flex flex-col gap-1.5 text-sm">Логин<Input value={user.login} disabled /></label>
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
                    <div className="flex items-center gap-2"><ShieldAlertIcon aria-hidden="true" className="text-primary size-4" /><h2 className="font-semibold text-sm">Доступ и обучение</h2></div>
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
                    <div className="flex items-center gap-2"><KeyRoundIcon aria-hidden="true" className="text-primary size-4" /><h2 className="font-semibold text-sm">Безопасность</h2></div>
                    <label className="flex flex-col gap-1.5 text-sm">Новый пароль<Input type="password" placeholder="Оставьте пустым, чтобы не менять" value={form.password} onChange={(event) => updateField("password", event.target.value)} /></label>
                  </section>

                  <UserRelationshipsSection ref={relationshipsRef} user={user} onError={setError} onDirtyChange={setRelationshipsChanged} />

                  {error && <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
                </div>
              </DrawerBody>

              <DrawerFooter className="flex-row justify-between">
                <Button type="button" variant="destructive" className="bg-red-600 text-white hover:bg-red-700" onClick={() => setDeleteOpen(true)}><Trash2Icon aria-hidden="true" />Удалить</Button>
                <div className="flex gap-2"><DrawerClose asChild><Button type="button" variant="outline"><XIcon aria-hidden="true" />Отмена</Button></DrawerClose><Button type="button" onClick={() => void handleSave()} disabled={!hasChanges} isLoading={isSaving}><SaveIcon aria-hidden="true" />Сохранить</Button></div>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      <AlertDialog open={deleteOpen} onOpenChange={({ open: nextOpen }) => setDeleteOpen(nextOpen)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle className="text-red-700 dark:text-red-300">Удалить пользователя?</AlertDialogTitle><AlertDialogDescription className="text-red-600 dark:text-red-300">Профиль {user?.full_name} будет удален без возможности восстановления.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction type="button" variant="destructive" className="bg-red-600 text-white hover:bg-red-700" onClick={() => void handleDelete()} isLoading={isDeleting}>Удалить</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
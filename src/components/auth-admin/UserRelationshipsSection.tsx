import { useAuthFetch } from "auth-lib";
import { LoaderCircleIcon, PlusIcon, UsersRoundIcon, XIcon } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
  getUserChildren,
  getUserParents,
  getUsers,
  updateUserChildren,
  updateUserParents,
} from "@/api/users";
import type { UserGetResponse } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UserRelationshipsSectionProps {
  user: UserGetResponse;
  onError: (message: string | null) => void;
  onDirtyChange: (dirty: boolean) => void;
}

type Relationship = "parents" | "children";
export interface UserRelationshipsSectionHandle {
  save: () => Promise<void>;
}

const emptyRelationships = { parents: [], children: [] } satisfies Record<Relationship, UserGetResponse[]>;

export const UserRelationshipsSection = forwardRef<UserRelationshipsSectionHandle, UserRelationshipsSectionProps>(function UserRelationshipsSection(
  { user, onError, onDirtyChange },
  ref,
) {
  const authFetch = useAuthFetch();
  const [relationships, setRelationships] = useState<Record<Relationship, UserGetResponse[]>>(emptyRelationships);
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState<UserGetResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [initialRelationships, setInitialRelationships] = useState<Record<Relationship, UserGetResponse[]>>(emptyRelationships);

  const hasChanges = (relationship: Relationship) =>
    relationships[relationship].length !== initialRelationships[relationship].length ||
    relationships[relationship].some((item) => !initialRelationships[relationship].some((initialItem) => initialItem.id === item.id));

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    void Promise.all([
      getUserParents(user.id, { offset: 0, limit: 100 }, (input, init) => authFetch(input, { ...init, signal: controller.signal })),
      getUserChildren(user.id, { offset: 0, limit: 100 }, (input, init) => authFetch(input, { ...init, signal: controller.signal })),
    ])
      .then(([parents, children]) => {
        const nextRelationships = { parents: parents.users, children: children.users };
        setRelationships(nextRelationships);
        setInitialRelationships(nextRelationships);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) onError(reason instanceof Error ? reason.message : "Не удалось загрузить связи");
      })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, [authFetch, onError, user.id]);

  useEffect(() => {
    const controller = new AbortController();
    if (!search.trim()) {
      setCandidates([]);
      return () => controller.abort();
    }

    setIsSearching(true);
    void getUsers(
      { offset: 0, limit: 20, search: search.trim() },
      (input, init) => authFetch(input, { ...init, signal: controller.signal }),
    )
      .then((response) => setCandidates(response.users.filter((candidate) => candidate.id !== user.id)))
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) onError(reason instanceof Error ? reason.message : "Не удалось найти пользователей");
      })
      .finally(() => { if (!controller.signal.aborted) setIsSearching(false); });
    return () => controller.abort();
  }, [authFetch, onError, search, user.id]);

  useEffect(() => {
    onDirtyChange(hasChanges("parents") || hasChanges("children"));
  }, [initialRelationships, onDirtyChange, relationships]);

  useImperativeHandle(ref, () => ({
    async save() {
      const updates: Promise<void>[] = [];
      const updateRelationship = (relationship: Relationship) => {
        const initialIds = new Set(initialRelationships[relationship].map((item) => item.id));
        const nextIds = new Set(relationships[relationship].map((item) => item.id));
        const data = {
          ids_to_add: [...nextIds].filter((id) => !initialIds.has(id)),
          ids_to_delete: [...initialIds].filter((id) => !nextIds.has(id)),
        };
        if (data.ids_to_add.length === 0 && data.ids_to_delete.length === 0) return;
        updates.push(relationship === "parents"
          ? updateUserParents(user.id, data, authFetch)
          : updateUserChildren(user.id, data, authFetch));
      };

      updateRelationship("parents");
      updateRelationship("children");
      try {
        await Promise.all(updates);
        setInitialRelationships(relationships);
      } catch (reason: unknown) {
        const message = reason instanceof Error ? reason.message : "Не удалось сохранить связи";
        onError(message);
        throw reason;
      }
    },
  }), [authFetch, initialRelationships, onError, ref, relationships, user.id]);

  function addRelationship(relationship: Relationship, candidate: UserGetResponse) {
    setRelationships((current) => current[relationship].some((item) => item.id === candidate.id)
      ? current
      : { ...current, [relationship]: [...current[relationship], candidate] });
    setCandidates((current) => current.filter((item) => item.id !== candidate.id));
    setSearch("");
  }

  function removeRelationship(relationship: Relationship, relatedUserId: string) {
    setRelationships((current) => ({
      ...current,
      [relationship]: current[relationship].filter((item) => item.id !== relatedUserId),
    }));
  }

  function relationshipList(relationship: Relationship) {
    return (
      <div className="flex flex-col gap-2">
        {relationships[relationship].length === 0 && <p className="text-muted-foreground text-sm">Связей пока нет</p>}
        {relationships[relationship].map((relatedUser) => (
          <div key={relatedUser.id} className="bg-muted/40 flex items-center justify-between gap-2 rounded-lg px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{relatedUser.full_name}</p>
              <p className="text-muted-foreground truncate text-xs">{relatedUser.login}</p>
            </div>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Удалить связь" onClick={() => removeRelationship(relationship, relatedUser.id)}>
              <XIcon aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <UsersRoundIcon aria-hidden="true" className="text-primary size-4" />
        <h2 className="font-semibold text-sm">Семейные связи</h2>
      </div>
      {isLoading ? <LoaderCircleIcon aria-label="Загрузка связей" className="text-muted-foreground size-4 animate-spin" /> : (
        <>
          <label className="flex flex-col gap-1.5 text-sm">Найти пользователя для связи
            <Input value={search} placeholder="Имя или логин" onChange={(event) => setSearch(event.target.value)} />
          </label>
          {isSearching && <p className="text-muted-foreground text-xs">Поиск...</p>}
          {candidates.length > 0 && <div className="border-border flex max-h-40 flex-col gap-1 overflow-y-auto rounded-lg border p-1">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="hover:bg-muted flex items-center justify-between gap-2 rounded-md px-2 py-1.5">
                <div className="min-w-0"><p className="truncate text-sm">{candidate.full_name}</p><p className="text-muted-foreground truncate text-xs">{candidate.login}</p></div>
                <div className="flex shrink-0 gap-1">
                  <Button type="button" size="icon-sm" variant="ghost" aria-label="Добавить в родители" onClick={() => addRelationship("parents", candidate)}><PlusIcon aria-hidden="true" /></Button>
                  <Button type="button" size="icon-sm" variant="ghost" aria-label="Добавить в дети" onClick={() => addRelationship("children", candidate)}><PlusIcon aria-hidden="true" /></Button>
                </div>
              </div>
            ))}
          </div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div><h3 className="mb-2 text-sm font-medium">Родители</h3>{relationshipList("parents")}</div>
            <div><h3 className="mb-2 text-sm font-medium">Дети</h3>{relationshipList("children")}</div>
          </div>
        </>
      )}
    </section>
  );
});
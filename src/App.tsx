import React from "react";
import { AlertCircleIcon } from "lucide-react";
import UsersAdminPage from '@/components/auth-admin/UsersAdminPage';
import DepartmentsPage from '@/components/auth-admin/DepartmentsPage';
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  AuthCallback,
  AuthProvider,
  LoginButton,
  LogoutButton,
  useAuth,
  type AuthClientConfig,
} from "auth-lib";
import { getRuntimeConfigWithDefaults } from "@/lib/runtime-config";

const runtimeConfig = getRuntimeConfigWithDefaults();
const API_ORIGIN = runtimeConfig.VITE_AUTH_DOMAIN;
const AUTH_PATH = runtimeConfig.VITE_AUTH_PATH;
const AUTH_CALLBACK_PATH = runtimeConfig.VITE_AUTH_CALLBACK_PATH;
const AUTH_SCOPES = runtimeConfig.VITE_AUTH_SCOPES
  .split(/\s+/)
  .filter(Boolean);
const authConfig: AuthClientConfig = {
  baseUrl: API_ORIGIN,
  authPath: AUTH_PATH,
  userInfoPath: null,
  scope: AUTH_SCOPES,
};

const LOGIN_REDIRECT_URI = `${window.location.origin}${AUTH_CALLBACK_PATH}`;

function isAuthCallbackUrl() {
  const query = new URLSearchParams(window.location.search);
  return (query.has("code") && query.has("state")) || query.has("error");
}

function AuthenticatedApp() {
  const { status, error, refresh } = useAuth();
  const [isCallback, setIsCallback] = React.useState(isAuthCallbackUrl);
  const [view, setView] = React.useState<"users" | "departments">("users");

  if (isCallback) {
    return (
      <AuthCallback
        fallbackPath="/"
        onSuccess={() => setIsCallback(false)}
      />
    );
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center gap-2 text-muted-foreground text-sm">
        <Spinner />
        Проверяем сессию...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-destructive">{error?.description ?? error?.message}</p>
        <AlertCircleIcon aria-hidden="true" className="text-destructive size-6" />
        <p className="text-sm">{error?.description ?? error?.message}</p>
        <Button onClick={() => void refresh()} variant="outline">
          Повторить
        </Button>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold">Администрирование пользователей</h1>
        <p className="text-muted-foreground text-sm">Войдите, чтобы продолжить.</p>
        <LoginButton size="lg">Войти</LoginButton>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <div className="mx-auto flex max-w-8xl items-center justify-between gap-4 px-6 pt-4">
        <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
          <Button size="sm" variant={view === "users" ? "secondary" : "ghost"} onClick={() => setView("users")}>Пользователи</Button>
          <Button size="sm" variant={view === "departments" ? "secondary" : "ghost"} onClick={() => setView("departments")}>Отделы</Button>
        </div>
        <LogoutButton variant="ghost" size="sm">Выйти</LogoutButton>
      </div>
      {view === "users" ? <UsersAdminPage /> : <DepartmentsPage />}
    </div>
  );
}

export default function App() {

  return (
    <AuthProvider config={authConfig}>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
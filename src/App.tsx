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

console.log("[App] runtimeConfig", runtimeConfig);
console.log("[App] authConfig", authConfig);
console.log("[App] LOGIN_REDIRECT_URI", LOGIN_REDIRECT_URI);

function isAuthCallbackUrl() {
  const query = new URLSearchParams(window.location.search);
  const result = (query.has("code") && query.has("state")) || query.has("error");
  console.log("[App] isAuthCallbackUrl", {
    href: window.location.href,
    hasCode: query.has("code"),
    hasState: query.has("state"),
    hasError: query.has("error"),
    result,
  });
  return result;
}

function AuthenticatedApp() {
  const auth = useAuth();
  const { status, error, refresh } = auth;
  const [isCallback, setIsCallback] = React.useState(isAuthCallbackUrl);
  const [view, setView] = React.useState<"users" | "departments">("users");

  console.log("[AuthenticatedApp] render", {
    status,
    error,
    isCallback,
    view,
    baseUrl: auth.client.config.baseUrl,
  });

  if (isCallback) {
    console.log("[AuthenticatedApp] rendering AuthCallback");
    return (
      <AuthCallback
        fallbackPath="/"
        onSuccess={() => {
          console.log("[AuthenticatedApp] AuthCallback succeeded");
          setIsCallback(false);
        }}
      />
    );
  }

  if (status === "loading") {
    console.log("[AuthenticatedApp] rendering loading state");
    return (
      <div className="flex min-h-dvh items-center justify-center gap-2 text-muted-foreground text-sm">
        <Spinner />
        Проверяем сессию...
      </div>
    );
  }

  if (status === "error") {
    console.log("[AuthenticatedApp] rendering error state", error);
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-destructive">{error?.description ?? error?.message}</p>
        <AlertCircleIcon aria-hidden="true" className="text-destructive size-6" />
        <p className="text-sm">{error?.description ?? error?.message}</p>
        <Button
          onClick={() => {
            console.log("[AuthenticatedApp] refresh clicked");
            void refresh();
          }}
          variant="outline"
        >
          Повторить
        </Button>
      </div>
    );
  }

  if (status !== "authenticated") {
    console.log("[AuthenticatedApp] rendering login state", { status });
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold">Администрирование пользователей</h1>
        <p className="text-muted-foreground text-sm">Войдите, чтобы продолжить.</p>
        <LoginButton size="lg">Войти</LoginButton>
      </div>
    );
  }

  console.log("[AuthenticatedApp] rendering authenticated view", { view });
  return (
    <div className="min-h-dvh">
      <div className="mx-auto flex max-w-8xl items-center justify-between gap-4 px-6 pt-4">
        <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
          <Button
            size="sm"
            variant={view === "users" ? "secondary" : "ghost"}
            onClick={() => {
              console.log("[AuthenticatedApp] view changed", { from: view, to: "users" });
              setView("users");
            }}
          >
            Пользователи
          </Button>
          <Button
            size="sm"
            variant={view === "departments" ? "secondary" : "ghost"}
            onClick={() => {
              console.log("[AuthenticatedApp] view changed", { from: view, to: "departments" });
              setView("departments");
            }}
          >
            Отделы
          </Button>
        </div>
        <LogoutButton
          variant="ghost"
          size="sm"
          onClick={() => console.log("[AuthenticatedApp] logout clicked")}
        >
          Выйти
        </LogoutButton>
      </div>
      {view === "users" ? <UsersAdminPage /> : <DepartmentsPage />}
    </div>
  );
}

export default function App() {
  console.log("[App] render", {
    dev: import.meta.env.DEV,
    origin: window.location.origin,
    loginRedirectUri: LOGIN_REDIRECT_URI,
  });

  if (
    import.meta.env.DEV &&
    !LOGIN_REDIRECT_URI.startsWith(window.location.origin)
  ) {
    console.error(
      `[auth] LOGIN_REDIRECT_URI is ${LOGIN_REDIRECT_URI}, but the app is served on ${window.location.origin}. ` +
        "Align the OAuth provider redirect URI and the dev server origin.",
    );
  } else {
    console.log("[App] redirect URI check passed");
  }

  return (
    <AuthProvider config={authConfig}>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
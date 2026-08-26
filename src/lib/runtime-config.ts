export type RuntimeConfig = {
  VITE_DOMAIN?: string;
  VITE_AUTH_DOMAIN?: string;
  VITE_AUTH_PATH?: string;
  VITE_AUTH_CALLBACK_PATH?: string;
  VITE_AUTH_SCOPES?: string;
};

declare global {
  interface Window {
    __RUNTIME_CONFIG__?: RuntimeConfig;
  }
}

const defaults = {
  VITE_AUTH_PATH: "/auth",
  VITE_AUTH_CALLBACK_PATH: "/auth/callback",
  VITE_AUTH_SCOPES:
    "openid profile email offline_access auth:users:read auth:users:create auth:users:update auth:users:delete",
} satisfies RuntimeConfig;

export function getRuntimeConfig(): RuntimeConfig {
  const runtimeConfig = window.__RUNTIME_CONFIG__ ?? {};

  if (import.meta.env.DEV) {
    return {
      VITE_DOMAIN: import.meta.env.VITE_DOMAIN ?? runtimeConfig.VITE_DOMAIN,
      VITE_AUTH_DOMAIN: import.meta.env.VITE_AUTH_DOMAIN ?? runtimeConfig.VITE_AUTH_DOMAIN,
      VITE_AUTH_PATH: import.meta.env.VITE_AUTH_PATH ?? runtimeConfig.VITE_AUTH_PATH,
      VITE_AUTH_CALLBACK_PATH:
        import.meta.env.VITE_AUTH_CALLBACK_PATH ?? runtimeConfig.VITE_AUTH_CALLBACK_PATH,
      VITE_AUTH_SCOPES: import.meta.env.VITE_AUTH_SCOPES ?? runtimeConfig.VITE_AUTH_SCOPES,
    };
  }

  return runtimeConfig;
}

export function getRuntimeConfigWithDefaults(): RuntimeConfig & typeof defaults {
  return { ...defaults, ...getRuntimeConfig() };
}
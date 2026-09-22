/**
 * Single source of truth for environment variables consumed by the app.
 * Vite exposes only `VITE_*` prefixed variables to the client bundle.
 */
export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? "Planet UI",
  isDev: import.meta.env.DEV,
} as const;

export type Env = typeof env;

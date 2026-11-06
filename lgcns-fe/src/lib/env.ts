const appEnv = import.meta.env.VITE_APP_ENV === "develop" ? "develop" : "local";

const remoteApiBase =
  (appEnv === "develop"
    ? import.meta.env.VITE_API_BASE_DEVELOP
    : import.meta.env.VITE_API_BASE_LOCAL) || "http://localhost:3000";

export const authOrigin = remoteApiBase;

export const apiBaseUrl = import.meta.env.DEV ? "" : remoteApiBase;

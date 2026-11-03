const appEnv = import.meta.env.VITE_APP_ENV === "develop" ? "develop" : "local";

export const apiBaseUrl =
  appEnv === "develop"
    ? import.meta.env.VITE_API_BASE_DEVELOP
    : import.meta.env.VITE_API_BASE_LOCAL;

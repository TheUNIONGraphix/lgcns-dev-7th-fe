import { apiBaseUrl } from "./env";

const TOKEN_KEY = "accessToken";

export function readAccessToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function saveAccessToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event("auth-change"));
}

export function takeAccessTokenFromHash() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const token = params.get("accessToken");
  if (!token) return;
  saveAccessToken(token);
  params.delete("accessToken");
  const nextHash = params.toString();
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}${nextHash ? `#${nextHash}` : ""}`,
  );
}

export function clearAccessToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event("auth-change"));
}

export async function loginRequest(email: string, password: string) {
  const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await response.json()) as {
    success?: boolean;
    message?: string;
    data?: { accessToken?: unknown };
  };
  const accessToken = data.data?.accessToken;
  if (!response.ok || !data.success || typeof accessToken !== "string") {
    return {
      ok: false as const,
      message: data.message ?? "이메일 또는 비밀번호가 올바르지 않습니다.",
    };
  }
  return { ok: true as const, accessToken };
}

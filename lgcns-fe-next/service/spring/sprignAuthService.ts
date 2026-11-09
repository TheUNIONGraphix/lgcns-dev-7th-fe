import { matchApiUrl } from "@/config/apiuri";
import { springFetch } from "@/lib/fetchClients";
import { SpringLoginData } from "@/types/response/springApiResponseType";

function isLoginData(value: SpringLoginData | null): value is SpringLoginData {
  return Boolean(value && value.accessToken && typeof value.userId === "number" && value.email);
}

export async function springAuthLogin(email: string, password: string) {
  const response = await springFetch.post<SpringLoginData>(matchApiUrl.auth.login, {
    email: email.trim(),
    password,
  });
  if (!response.success || !isLoginData(response.data)) {
    return {
      ok: false as const,
      message: response.message || "이메일 또는 비밀번호가 올바르지 않습니다.",
    };
  }
  console.log(response.data);
  return { ok: true as const, data: response.data };
}

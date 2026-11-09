import { matchApiUrl } from "@/config/apiuri";
import { springFetch } from "@/lib/fetchClients";
import { SpringLoginData } from "@/types/response/springApiResponseType";

function isLoginData(value: SpringLoginData | null): value is SpringLoginData {
  return Boolean(value && value.accessToken && typeof value.userId === "number" && value.email);
}

export async function springAuthLogin(email: string, password: string) {
//   const response = await springFetch.post<SpringLoginData>(matchApiUrl.auth.login, {
//     email: email.trim(),
//     password,
//   });

//fetch example
// try {
//      const response = await fetch(matchApiUrl.auth.login, {
//         method: "POST",
//         body: JSON.stringify({
//           email: email.trim(),
//           password,
//         }),
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })
//       if (!response.ok) {
//         return {
//           ok: false as const,
//           message: "이메일 또는 비밀번호가 올바르지 않습니다.",
//         };
//       }
//       const data = await response.json();
//       return { ok: true as const, data: data };
//     } catch (error) {
//       return {
//         ok: false as const,
//         message: "이메일 또는 비밀번호가 올바르지 않습니다.",
//       };
//     }
// }

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
  return { ok: true as const, data: response.data };
}

export async function springUserGetData(accessToken: string) {
  if (!accessToken) {
    return {
      ok: false as const,
      message: "인증 정보를 찾을 수 없습니다.",
    };
  }
  const response = await springFetch.get<SpringLoginData>(matchApiUrl.auth.getUserData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.success || !isLoginData(response.data)) {
    return {
      ok: false as const,
      message: response.message || "사용자 정보를 조회할 수 없습니다.",
    };
  }
  return { ok: true as const, data: response.data };
  
}

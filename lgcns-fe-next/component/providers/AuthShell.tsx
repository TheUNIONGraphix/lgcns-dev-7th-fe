import { cookies } from "next/headers";
import { AuthProvider } from "@/component/providers/AuthProvider";
import { ACCESS_TOKEN_COOKIE } from "@/component/providers/authCookie";

export default async function AuthShell({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;

  return <AuthProvider accessToken={accessToken}>{children}</AuthProvider>;
}

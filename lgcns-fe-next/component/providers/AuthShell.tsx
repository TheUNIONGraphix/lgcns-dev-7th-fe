import { readAccessToken } from "@/lib/readAccessToken";
import { AuthProvider } from "@/component/providers/AuthProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export default async function AuthShell({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  console.log("=============getServerSession=============");
  console.log(session);
  console.log("=============AuthShell=============");
  console.log(session);

  return <AuthProvider accessToken={session?.accessToken ?? null}>{children}</AuthProvider>;
}

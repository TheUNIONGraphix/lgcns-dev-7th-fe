import { connection } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { AuthProvider } from "@/component/providers/AuthProvider";

export default async function AuthShell({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken ?? null;

  return <AuthProvider accessToken={accessToken}>{children}</AuthProvider>;
}

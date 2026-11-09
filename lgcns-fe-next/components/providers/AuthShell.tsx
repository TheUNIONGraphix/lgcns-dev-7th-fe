import { connection } from "next/server";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { getServerSession } from "next-auth";
import { verifyAccessToken } from "@/lib/accessJwt";
import { authOptions } from "@/lib/authOptions";

export default async function AuthShell({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken ?? "";
  const verified = accessToken ? await verifyAccessToken(accessToken) : null;

  return (
    <AuthProvider accessToken={verified ? accessToken : null}>
      {children}
    </AuthProvider>
  );
}

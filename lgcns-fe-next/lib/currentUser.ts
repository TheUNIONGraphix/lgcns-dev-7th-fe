import { connection } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function readCurrentUser() {
  await connection();
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user?.id) return null;
  return {
    id: user.id,
    email: user.email ?? "",
    name: user.name || user.email || "회원",
  };
}

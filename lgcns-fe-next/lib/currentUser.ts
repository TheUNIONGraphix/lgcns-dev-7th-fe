import { cookies } from "next/headers";
import { connection } from "next/server";
import { getToken, type GetTokenParams } from "next-auth/jwt";
import { verifyAccessToken } from "@/lib/accessJwt";
import { userService } from "@/service/userService";

export async function readCurrentUser() {
  await connection();
  const cookieStore = await cookies();
  const req = {
    cookies: Object.fromEntries(
      cookieStore.getAll().map((cookie) => [cookie.name, cookie.value]),
    ),
    headers: {},
  } as GetTokenParams["req"];
  const token = await getToken({ req });
  const accessToken = token?.accessToken;
  if (typeof accessToken !== "string") return null;
  const payload = await verifyAccessToken(accessToken);
  if (!payload) return null;

  return userService.findSessionUser(payload.id);
}

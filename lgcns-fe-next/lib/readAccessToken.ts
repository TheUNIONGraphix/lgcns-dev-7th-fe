import { cookies } from "next/headers";
import { connection } from "next/server";
import { getToken, type GetTokenParams } from "next-auth/jwt";

export async function readAccessToken() {
  await connection();
  const cookieStore = await cookies();
  const req = {
    cookies: Object.fromEntries(cookieStore.getAll().map((cookie) => [cookie.name, cookie.value])),
    headers: {},
  } as GetTokenParams["req"];
  const token = await getToken({ req });
  const accessToken = token?.accessToken;
  if (typeof accessToken !== "string" || accessToken.length === 0) return null;
  return accessToken;
}

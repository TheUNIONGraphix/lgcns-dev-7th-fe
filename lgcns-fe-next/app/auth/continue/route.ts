import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  RETURN_TO_COOKIE,
  decodeReturnTo,
  returnToCookieOptions,
} from "@/lib/returnTo";

export async function GET(request: Request) {
  const jar = await cookies();
  const path = decodeReturnTo(jar.get(RETURN_TO_COOKIE)?.value);
  jar.delete(RETURN_TO_COOKIE);
  return NextResponse.redirect(new URL(path, request.url));
}

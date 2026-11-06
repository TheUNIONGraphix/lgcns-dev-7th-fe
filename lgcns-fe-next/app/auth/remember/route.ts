import { NextResponse } from "next/server";
import {
  RETURN_TO_COOKIE,
  encodeReturnTo,
  returnToCookieOptions,
} from "@/lib/returnTo";

export function GET(request: Request) {
  const returnTo = new URL(request.url).searchParams.get("returnTo");
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set(RETURN_TO_COOKIE, encodeReturnTo(returnTo), returnToCookieOptions());
  return response;
}

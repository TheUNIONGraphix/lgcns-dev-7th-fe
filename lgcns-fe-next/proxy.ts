import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { verifyAccessToken } from "./lib/accessJwt";
import {
  authPrefixList,
  authUrlList,
  withoutAuthUrlList,
} from "./config/initial";
import {
  RETURN_TO_COOKIE,
  decodeReturnTo,
  encodeReturnTo,
  returnToCookieOptions,
} from "./lib/returnTo";

async function isLoggedIn(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const accessToken = token?.accessToken;
    if (typeof accessToken !== "string") return false;
    return (await verifyAccessToken(accessToken)) !== null;
  } catch {
    return false;
  }
}

function requiresAuth(pathname: string) {
  if (authUrlList.includes(pathname)) return true;
  return authPrefixList.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function loginRedirect(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set(
    RETURN_TO_COOKIE,
    encodeReturnTo(`${request.nextUrl.pathname}${request.nextUrl.search}`),
    returnToCookieOptions(),
  );
  return response;
}

function continueRedirect(request: NextRequest) {
  const path = decodeReturnTo(request.cookies.get(RETURN_TO_COOKIE)?.value);
  const response = NextResponse.redirect(new URL(path, request.url));
  response.cookies.set(RETURN_TO_COOKIE, "", { ...returnToCookieOptions(), maxAge: 0 });
  return response;
}

export async function proxy(request: NextRequest) {
  const loggedIn = await isLoggedIn(request);
  const { pathname } = request.nextUrl;

  if (withoutAuthUrlList.includes(pathname)) {
    if (!loggedIn) return NextResponse.next();
    return continueRedirect(request);
  }

  if (requiresAuth(pathname) && !loggedIn) return loginRedirect(request);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/postwrite",
    "/postwrite/:path*",
    "/cart",
    "/order",
    "/login",
    "/signup",
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

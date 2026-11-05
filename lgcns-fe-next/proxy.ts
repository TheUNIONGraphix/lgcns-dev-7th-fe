import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { verifyAccessToken } from "./lib/accessJwt";
import {
  authPrefixList,
  authUrlList,
  safeCallbackPath,
  withoutAuthUrlList,
} from "./config/initial";

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
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "callbackUrl",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  const loggedIn = await isLoggedIn(request);
  const { pathname } = request.nextUrl;

  if (withoutAuthUrlList.includes(pathname)) {
    if (!loggedIn) return NextResponse.next();
    const callbackUrl = safeCallbackPath(
      request.nextUrl.searchParams.get("callbackUrl"),
    );
    return NextResponse.redirect(new URL(callbackUrl, request.url));
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

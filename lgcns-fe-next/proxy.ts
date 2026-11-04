import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { authUrlList, safeCallbackPath, withoutAuthUrlList } from "./config/initial";

export async function proxy(request: NextRequest) {
    const token = await getToken({ req: request });
    const accessToken = token?.accessToken;
    const loggedIn = typeof accessToken === "string" && accessToken.length > 0;
    const { pathname } = request.nextUrl;

    if (withoutAuthUrlList.includes(pathname)) {
        if (!loggedIn) return NextResponse.next();
        const callbackUrl = safeCallbackPath(request.nextUrl.searchParams.get("callbackUrl"));
        return NextResponse.redirect(new URL(callbackUrl, request.url));
    }

    if (authUrlList.includes(pathname) && !loggedIn) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
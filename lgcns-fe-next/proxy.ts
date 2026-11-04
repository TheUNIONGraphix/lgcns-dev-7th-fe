import { NextRequest, NextResponse } from "next/server";
import { withoutAuthUrlList, authUrlList } from "./config/initial";
import { getServerSession } from "next-auth";
import { authOptions } from "./lib/authOptions";

export async function proxy(request: NextRequest) {
    const session = await getServerSession(authOptions);
    const { pathname } = request.nextUrl;

    if (session?.accessToken) {
        if (!authUrlList.includes(pathname)) {
            return NextResponse.next();
        }
    }
    
    if (withoutAuthUrlList.includes(pathname)) {
        return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
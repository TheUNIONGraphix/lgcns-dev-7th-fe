import { getToken } from "next-auth/jwt";
import { connection, NextRequest, NextResponse } from "next/server";

function returnUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (!local || (url.protocol !== "http:" && url.protocol !== "https:")) return null;
    return url;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  await connection();
  const destination = returnUrl(request.nextUrl.searchParams.get("returnTo"));
  if (!destination) {
    return new NextResponse("돌아갈 주소가 올바르지 않습니다.", {
      status: 400,
      headers: { "cache-control": "no-store" },
    });
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const accessToken = token?.accessToken;
  if (typeof accessToken !== "string" || accessToken.length === 0) {
    const login = new URL("/login", request.url);
    login.searchParams.set(
      "callbackUrl",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(login);
  }

  destination.hash = `accessToken=${accessToken}`;
  const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><title>로그인</title><p>이동 중...</p><script>location.replace(${JSON.stringify(destination.href)})</script></html>`;
  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

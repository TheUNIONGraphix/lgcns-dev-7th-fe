import { NextResponse } from "next/server";
import { z } from "zod";
import { loginWithCredentials } from "@/actions/authActions";
import { signAccessToken } from "@/lib/accessJwt";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

const loginSchema = z.object({
  email: z.string().min(1, "이메일을 입력해 주세요."),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message:
          parsed.error.issues[0]?.message ?? "요청 본문을 확인해 주세요.",
      },
      { status: 400, headers: corsHeaders },
    );
  }

  const result = await loginWithCredentials(parsed.data.email, parsed.data.password);
  if (!result.ok) {
    return NextResponse.json(
      { success: false, message: result.message },
      { status: 401, headers: corsHeaders },
    );
  }

  const accessToken = await signAccessToken({
    id: result.user.id,
    email: result.user.email,
    name: result.user.name,
  });

  return NextResponse.json(
    {
      success: true,
      message: "OK",
      data: {
        accessToken,
        expiresIn: result.user.expiresIn,
        email: result.user.email,
        name: result.user.name,
        userId: result.user.id,
      },
    },
    { headers: corsHeaders },
  );
}

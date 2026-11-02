import { NextResponse } from "next/server";
import { z } from "zod";
import { userService } from "@/service/userService";

const loginSchema = z.object({
  email: z.string().min(1, "이메일을 입력해 주세요."),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? "요청 본문을 확인해 주세요." },
      { status: 400 },
    );
  }

  const result = await userService.login(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ success: false, message: result.message }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    message: "OK",
    data: {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      email: result.user.email,
      name: result.user.name,
      userId: result.user.id,
    },
  });
}

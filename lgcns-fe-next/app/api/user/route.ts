import { NextResponse } from "next/server";
import { z } from "zod";
import { userService } from "@/service/userService";

const createUserSchema = z.object({
  email: z.string().email("이메일을 확인해 주세요."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
  name: z.string().min(1).optional(),
});

export async function GET() {
  const users = await userService.list();
  return NextResponse.json({ success: true, data: users });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? "요청 본문을 확인해 주세요." },
      { status: 400 },
    );
  }

  const result = await userService.create(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ success: false, message: result.message }, { status: 409 });
  }

  return NextResponse.json({ success: true, data: result.user }, { status: 201 });
}

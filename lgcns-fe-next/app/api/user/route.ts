import { NextResponse } from "next/server";
import { z } from "zod";
import { signupIdentitySchema, signupPasswordSchema } from "@/schema/signupSchema";
import { userService } from "@/service/userService";

const createUserSchema = signupIdentitySchema.extend({
  password: signupPasswordSchema,
  name: z.string().min(1).optional(),
  interests: z.array(z.string()).optional(),
  profileImageUrl: z.string().optional(),
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
    return NextResponse.json({ success: false, message: result.message }, { status: result.status });
  }

  return NextResponse.json({ success: true, data: result.user }, { status: 201 });
}

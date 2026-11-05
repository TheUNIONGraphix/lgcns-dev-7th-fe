import { z } from "zod";
import { UserPayloadType } from "@/types/request/RequestType";

const loginSchema = z.object({
  userId: z.string().min(1, "아이디를 입력해 주세요."),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

type LoginFieldName = keyof UserPayloadType;

function loginFieldMessage(field: LoginFieldName, value: string) {
  const result = loginSchema.shape[field].safeParse(value);
  if (result.success) return "";
  return result.error.issues[0]?.message ?? "";
}

export { loginFieldMessage };
export default loginSchema;

"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { interestsFromText, signupIdentitySchema, signupPasswordSchema } from "@/schema/signupSchema";
import { userService } from "@/service/userService";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function checkSignupIdentity(input: { userId: string; email: string }) {
  const userId = typeof input?.userId === "string" ? input.userId : "";
  const email = typeof input?.email === "string" ? input.email : "";
  const parsed = signupIdentitySchema.safeParse({ userId, email });
  const userIdError = parsed.success
    ? ""
    : parsed.error.issues.find((issue) => issue.path[0] === "userId")?.message ?? "";
  const emailError = parsed.success
    ? ""
    : parsed.error.issues.find((issue) => issue.path[0] === "email")?.message ?? "";

  try {
    const taken = await userService.checkIdentity({
      userId: userIdError ? "" : userId,
      email: emailError ? "" : email,
    });
    const nextUserIdError = userIdError || (taken.userIdTaken ? "이미 사용 중인 아이디입니다." : "");
    const nextEmailError = emailError || (taken.emailTaken ? "이미 등록된 이메일입니다." : "");
    if (nextUserIdError || nextEmailError) {
      return { ok: false as const, userIdError: nextUserIdError, emailError: nextEmailError };
    }
    return { ok: true as const, userIdError: "" as const, emailError: "" as const };
  } catch (error) {
    unstable_rethrow(error);
    return {
      ok: false as const,
      userIdError,
      emailError,
      message: "중복 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}

export async function createSignup(formData: FormData) {
  const identity = signupIdentitySchema.safeParse({
    userId: readText(formData, "userId"),
    email: readText(formData, "email"),
  });
  if (!identity.success) {
    return { ok: false as const, message: identity.error.issues[0]?.message ?? "입력값을 확인해 주세요." };
  }

  const password = signupPasswordSchema.safeParse(readText(formData, "password"));
  if (!password.success) {
    return {
      ok: false as const,
      message: password.error.issues[0]?.message ?? "비밀번호는 8자 이상이어야 합니다.",
    };
  }

  const interests = interestsFromText(readText(formData, "interests"));
  if (!interests.ok) {
    return { ok: false as const, message: interests.message };
  }

  try {
    const result = await userService.create({
      userId: identity.data.userId,
      email: identity.data.email,
      password: password.data,
      interests: interests.interests,
      profileImageUrl: readText(formData, "profileImageUrl"),
    });
    if (!result.ok) return { ok: false as const, message: result.message };
  } catch (error) {
    unstable_rethrow(error);
    return { ok: false as const, message: "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요." };
  }

  redirect("/login");
}

export async function submitSignup(formData: FormData) {
  await createSignup(formData);
}

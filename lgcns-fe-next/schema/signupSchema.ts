import { z } from "zod";

const signupIdentitySchema = z.object({
  userId: z
    .string()
    .trim()
    .min(1, "아이디를 입력해 주세요.")
    .max(50, "아이디는 50자 이내로 입력해 주세요."),
  email: z.string().trim().min(1, "이메일을 입력해 주세요.").email("이메일을 확인해 주세요."),
});

const signupPasswordSchema = z.string().min(8, "비밀번호는 8자 이상이어야 합니다.");

const MAX_PROFILE_IMAGE_CHARS = 700_000;

function validateInterests(interests: string[]) {
  const items = interests.map((item) => item.trim()).filter(Boolean);
  if (items.length > 20) {
    return { ok: false as const, message: "관심사는 20개까지 등록할 수 있습니다." };
  }
  if (items.some((item) => item.length > 40)) {
    return { ok: false as const, message: "관심사는 하나당 40자 이내로 입력해 주세요." };
  }
  return { ok: true as const, interests: items };
}

function interestsFromText(raw: string) {
  return validateInterests(raw.split(/[,，]/));
}

function parseProfileImage(raw: string) {
  const value = raw.trim();
  if (!value) return { ok: true as const, profileImageUrl: undefined };

  const isDataImage = /^data:image\/(png|jpeg|gif|webp);base64,/i.test(value);
  let isHttpUrl = false;
  try {
    const url = new URL(value);
    isHttpUrl = url.protocol === "http:" || url.protocol === "https:";
  } catch {
    isHttpUrl = false;
  }

  if (!isDataImage && !isHttpUrl) {
    return { ok: false as const, message: "프로필 사진은 이미지 파일로 등록해 주세요." };
  }
  if (value.length > MAX_PROFILE_IMAGE_CHARS) {
    return { ok: false as const, message: "프로필 사진은 500KB 이하로 등록해 주세요." };
  }
  return { ok: true as const, profileImageUrl: value };
}

export {
  interestsFromText,
  parseProfileImage,
  signupIdentitySchema,
  signupPasswordSchema,
  validateInterests,
};

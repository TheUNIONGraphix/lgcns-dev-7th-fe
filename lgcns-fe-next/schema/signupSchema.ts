import { z } from "zod";

const signupUserIdSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9_]{4,20}$/, "영문 소문자, 숫자, 밑줄(_)을 조합해 4~20자로 입력해주세요.");

const signupEmailSchema = z
  .string()
  .trim()
  .min(1, "이메일을 입력해 주세요.")
  .email("이메일을 확인해 주세요.");

const signupIdentitySchema = z.object({
  userId: signupUserIdSchema,
  email: signupEmailSchema,
});

const signupPasswordSchema = z
  .string()
  .refine(
    (value) =>
      value.length >= 8 &&
      value.length <= 20 &&
      /[A-Za-z]/.test(value) &&
      /\d/.test(value) &&
      /[^A-Za-z0-9]/.test(value),
    "영문, 숫자, 특수문자를 포함한 8~20자로 입력해 주세요.",
  );

const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PROFILE_IMAGE_CHARS = Math.ceil((MAX_PROFILE_IMAGE_BYTES * 4) / 3) + 64;

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

  const isDataImage = /^data:image\/(png|jpeg);base64,/i.test(value);
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
    return { ok: false as const, message: "프로필 사진은 5MB 이하로 등록해 주세요." };
  }
  return { ok: true as const, profileImageUrl: value };
}

export {
  interestsFromText,
  MAX_PROFILE_IMAGE_BYTES,
  parseProfileImage,
  signupEmailSchema,
  signupIdentitySchema,
  signupPasswordSchema,
  signupUserIdSchema,
  validateInterests,
};

"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import {
  interestsFromText,
  parseProfileImage,
  signupIdentitySchema,
  signupPasswordSchema,
  validateInterests,
} from "@/schema/signupSchema";
import { userService } from "@/service/userService";
import {
  clearSignupState,
  furthestSignupStep,
  readSignupDraft,
  writeSignupDraft,
  writeSignupErrors,
  type SignupDraft,
  type SignupErrors,
  type SignupStep,
} from "./draft";

const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function ensureReached(draft: SignupDraft, step: SignupStep) {
  const max = furthestSignupStep(draft);
  if (step > max) {
    await writeSignupDraft({ ...draft, step: max });
    await writeSignupErrors({});
    redirect("/signup");
  }
}

async function profileImageFromForm(formData: FormData) {
  const blocked = readText(formData, "profileImageBlocked");
  if (blocked === "type") {
    return { ok: false as const, message: "PNG, JPEG, GIF, WEBP 이미지만 등록할 수 있습니다." };
  }
  if (blocked === "size") {
    return { ok: false as const, message: "프로필 사진은 500KB 이하로 등록해 주세요." };
  }

  const entry = formData.get("profileImage");
  if (entry instanceof Blob && entry.size > 0) {
    if (!IMAGE_TYPES.has(entry.type)) {
      return { ok: false as const, message: "PNG, JPEG, GIF, WEBP 이미지만 등록할 수 있습니다." };
    }
    if (entry.size > 500 * 1024) {
      return { ok: false as const, message: "프로필 사진은 500KB 이하로 등록해 주세요." };
    }
    const bytes = Buffer.from(await entry.arrayBuffer());
    return parseProfileImage(`data:${entry.type};base64,${bytes.toString("base64")}`);
  }
  return parseProfileImage(readText(formData, "profileImageUrl"));
}

async function finishSignup(profileImageUrl: string | undefined) {
  const draft = await readSignupDraft();
  await ensureReached(draft, 4);

  const identity = signupIdentitySchema.safeParse({ userId: draft.userId, email: draft.email });
  if (!identity.success || !draft.identityOk) {
    await writeSignupDraft({ ...draft, identityOk: false, step: 1 });
    redirect("/signup");
  }

  const password = signupPasswordSchema.safeParse(draft.password);
  if (!password.success || !draft.passwordOk) {
    await writeSignupDraft({ ...draft, passwordOk: false, step: 2 });
    redirect("/signup");
  }

  const interests = validateInterests(draft.interests);
  if (!draft.interestsConfirmed || !interests.ok) {
    await writeSignupErrors({
      interests: interests.ok ? "관심사를 확인해 주세요." : interests.message,
    });
    await writeSignupDraft({ ...draft, interestsConfirmed: false, step: 3 });
    redirect("/signup");
  }

  let failure: { step: SignupStep; errors: SignupErrors; clearIdentity?: boolean } | null = null;
  try {
    const result = await userService.create({
      userId: identity.data.userId,
      email: identity.data.email,
      password: password.data,
      interests: interests.interests,
      profileImageUrl,
    });
    if (!result.ok) {
      if (result.message.includes("아이디")) {
        failure = { step: 1, errors: { userId: result.message }, clearIdentity: true };
      } else if (result.message.includes("이메일")) {
        failure = { step: 1, errors: { email: result.message }, clearIdentity: true };
      } else {
        failure = { step: 4, errors: { form: result.message } };
      }
    }
  } catch (error) {
    unstable_rethrow(error);
    failure = { step: 4, errors: { form: "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요." } };
  }

  if (failure) {
    if (failure.clearIdentity) {
      await writeSignupDraft({ ...draft, identityOk: false, step: failure.step });
    } else {
      await writeSignupDraft({ ...draft, step: failure.step });
    }
    await writeSignupErrors(failure.errors);
    redirect("/signup");
  }

  await clearSignupState();
  redirect("/login");
}

export async function submitSignupIdentity(formData: FormData) {
  const current = await readSignupDraft();
  const userId = readText(formData, "userId");
  const email = readText(formData, "email");
  const parsed = signupIdentitySchema.safeParse({ userId, email });
  const userIdError = parsed.success
    ? ""
    : (parsed.error.issues.find((issue) => issue.path[0] === "userId")?.message ?? "");
  const emailError = parsed.success
    ? ""
    : (parsed.error.issues.find((issue) => issue.path[0] === "email")?.message ?? "");

  let taken = { userIdTaken: false, emailTaken: false };
  let formError = "";
  try {
    taken = await userService.checkIdentity({
      userId: userIdError ? "" : userId.trim(),
      email: emailError ? "" : email.trim(),
    });
  } catch (error) {
    unstable_rethrow(error);
    formError = "중복 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  }

  const nextUserIdError = userIdError || (taken.userIdTaken ? "이미 사용 중인 아이디입니다." : "");
  const nextEmailError = emailError || (taken.emailTaken ? "이미 등록된 이메일입니다." : "");

  if (!parsed.success || nextUserIdError || nextEmailError || formError) {
    await writeSignupDraft({
      ...current,
      userId: userId.trim(),
      email: email.trim(),
      identityOk: false,
      step: 1,
    });
    await writeSignupErrors({
      userId: nextUserIdError,
      email: nextEmailError,
      form: formError,
    });
    redirect("/signup");
  }

  await writeSignupDraft({
    ...current,
    userId: parsed.data.userId,
    email: parsed.data.email,
    identityOk: true,
    step: 2,
  });
  await writeSignupErrors({});
  redirect("/signup");
}

export async function submitSignupPassword(formData: FormData) {
  const draft = await readSignupDraft();
  await ensureReached(draft, 2);
  const password = readText(formData, "password");
  const parsed = signupPasswordSchema.safeParse(password);
  if (!parsed.success) {
    await writeSignupDraft({ ...draft, password, passwordOk: false, step: 2 });
    await writeSignupErrors({
      password: parsed.error.issues[0]?.message ?? "비밀번호는 8자 이상이어야 합니다.",
    });
    redirect("/signup");
  }

  await writeSignupDraft({ ...draft, password: parsed.data, passwordOk: true, step: 3 });
  await writeSignupErrors({});
  redirect("/signup");
}

export async function submitSignupInterests(formData: FormData) {
  const draft = await readSignupDraft();
  await ensureReached(draft, 3);
  const interestsText = readText(formData, "interests");
  const parsed = interestsFromText(interestsText);
  if (!parsed.ok) {
    await writeSignupDraft({
      ...draft,
      interestsText,
      interestsConfirmed: false,
      step: 3,
    });
    await writeSignupErrors({ interests: parsed.message });
    redirect("/signup");
  }

  await writeSignupDraft({
    ...draft,
    interestsText,
    interests: parsed.interests,
    interestsConfirmed: true,
    step: 4,
  });
  await writeSignupErrors({});
  redirect("/signup");
}

export async function skipSignupInterests() {
  const draft = await readSignupDraft();
  await ensureReached(draft, 3);
  await writeSignupDraft({
    ...draft,
    interestsText: "",
    interests: [],
    interestsConfirmed: true,
    step: 4,
  });
  await writeSignupErrors({});
  redirect("/signup");
}

export async function submitSignupProfile(formData: FormData) {
  const draft = await readSignupDraft();
  await ensureReached(draft, 4);

  let image: Awaited<ReturnType<typeof profileImageFromForm>>;
  try {
    image = await profileImageFromForm(formData);
  } catch (error) {
    unstable_rethrow(error);
    await writeSignupDraft({ ...draft, step: 4 });
    await writeSignupErrors({ profileImageUrl: "프로필 사진을 읽지 못했습니다." });
    redirect("/signup");
  }

  if (!image.ok) {
    await writeSignupDraft({ ...draft, step: 4 });
    await writeSignupErrors({ profileImageUrl: image.message });
    redirect("/signup");
  }

  await finishSignup(image.profileImageUrl);
}

export async function skipSignupProfile() {
  await finishSignup(undefined);
}

export async function backSignupStep(formData: FormData) {
  const draft = await readSignupDraft();
  const raw = Number(readText(formData, "backStep"));
  const requested: SignupStep = raw === 2 || raw === 3 || raw === 4 ? raw : 1;
  const max = furthestSignupStep(draft);
  const step = requested > max ? max : requested;
  await writeSignupDraft({ ...draft, step });
  await writeSignupErrors({});
  redirect("/signup");
}

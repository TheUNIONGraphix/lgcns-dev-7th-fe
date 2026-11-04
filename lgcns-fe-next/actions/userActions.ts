"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import {
  interestsFromText,
  MAX_PROFILE_IMAGE_BYTES,
  parseProfileImage,
  signupEmailSchema,
  signupPasswordSchema,
  signupUserIdSchema,
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
} from "@/actions/draft";

const IMAGE_TYPES = new Set(["image/png", "image/jpeg"]);

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function signupPath(step: SignupStep) {
  return `/signup?step=${step}`;
}

async function ensureReached(draft: SignupDraft, step: SignupStep) {
  const max = furthestSignupStep(draft);
  if (step > max) {
    await writeSignupDraft({ ...draft, step: max });
    await writeSignupErrors({});
    redirect(signupPath(max));
  }
}

async function profileImageFromForm(formData: FormData) {
  const blocked = readText(formData, "profileImageBlocked");
  if (blocked === "type") {
    return { ok: false as const, message: "JPG, PNG 이미지만 등록할 수 있습니다." };
  }
  if (blocked === "size") {
    return { ok: false as const, message: "프로필 사진은 5MB 이하로 등록해 주세요." };
  }

  const entry = formData.get("profileImage");
  if (entry instanceof Blob && entry.size > 0) {
    if (!IMAGE_TYPES.has(entry.type)) {
      return { ok: false as const, message: "JPG, PNG 이미지만 등록할 수 있습니다." };
    }
    if (entry.size > MAX_PROFILE_IMAGE_BYTES) {
      return { ok: false as const, message: "프로필 사진은 5MB 이하로 등록해 주세요." };
    }
    const bytes = Buffer.from(await entry.arrayBuffer());
    return parseProfileImage(`data:${entry.type};base64,${bytes.toString("base64")}`);
  }
  return parseProfileImage(readText(formData, "profileImageUrl"));
}

async function finishSignup(profileImageUrl: string | undefined) {
  const draft = await readSignupDraft();
  await ensureReached(draft, 4);

  const userId = signupUserIdSchema.safeParse(draft.userId);
  if (!userId.success || !draft.userIdOk) {
    await writeSignupDraft({ ...draft, userIdOk: false, step: 1 });
    redirect(signupPath(1));
  }

  const password = signupPasswordSchema.safeParse(draft.password);
  if (!password.success || !draft.passwordOk) {
    await writeSignupDraft({ ...draft, passwordOk: false, step: 2 });
    redirect(signupPath(2));
  }

  const email = signupEmailSchema.safeParse(draft.email);
  if (!email.success || !draft.emailOk) {
    await writeSignupDraft({ ...draft, emailOk: false, step: 3 });
    redirect(signupPath(3));
  }

  const interests = validateInterests(draft.interests);
  if (!interests.ok) {
    await writeSignupErrors({ form: interests.message });
    await writeSignupDraft({ ...draft, step: 4 });
    redirect(signupPath(4));
  }

  let failure: { step: SignupStep; errors: SignupErrors; clearIdentity?: boolean } | null = null;
  try {
    const result = await userService.create({
      userId: userId.data,
      email: email.data,
      password: password.data,
      interests: interests.interests,
      profileImageUrl,
    });
    if (!result.ok) {
      if (result.message.includes("아이디")) {
        failure = { step: 1, errors: { userId: result.message }, clearIdentity: true };
      } else if (result.message.includes("이메일")) {
        failure = { step: 3, errors: { email: result.message }, clearIdentity: true };
      } else {
        failure = { step: 4, errors: { form: result.message } };
      }
    }
  } catch (error) {
    unstable_rethrow(error);
    failure = { step: 4, errors: { form: "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요." } };
  }

  if (failure) {
    if (failure.clearIdentity && failure.step === 1) {
      await writeSignupDraft({ ...draft, userIdOk: false, step: 1 });
    } else if (failure.clearIdentity && failure.step === 3) {
      await writeSignupDraft({ ...draft, emailOk: false, step: 3 });
    } else {
      await writeSignupDraft({ ...draft, step: failure.step });
    }
    await writeSignupErrors(failure.errors);
    redirect(signupPath(failure.step));
  }

  await clearSignupState();
  redirect("/login");
}

export async function submitSignupIdentity(formData: FormData) {
  const current = await readSignupDraft();
  const userId = readText(formData, "userId");
  const parsed = signupUserIdSchema.safeParse(userId);
  const userIdError = parsed.success ? "" : (parsed.error.issues[0]?.message ?? "아이디를 확인해 주세요.");

  let taken = { userIdTaken: false, emailTaken: false };
  let formError = "";
  try {
    taken = await userService.checkIdentity({
      userId: userIdError ? "" : userId.trim(),
      email: "",
    });
  } catch (error) {
    unstable_rethrow(error);
    formError = "중복 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  }

  const nextUserIdError = userIdError || (taken.userIdTaken ? "이미 사용 중인 아이디입니다." : "");

  if (!parsed.success || nextUserIdError || formError) {
    await writeSignupDraft({
      ...current,
      userId: userId.trim(),
      userIdOk: false,
      step: 1,
    });
    await writeSignupErrors({
      userId: nextUserIdError,
      form: formError,
    });
    redirect(signupPath(1));
  }

  await writeSignupDraft({
    ...current,
    userId: parsed.data,
    userIdOk: true,
    step: 2,
  });
  await writeSignupErrors({});
  redirect(signupPath(2));
}

export async function submitSignupPassword(formData: FormData) {
  const draft = await readSignupDraft();
  await ensureReached(draft, 2);
  const password = readText(formData, "password");
  const passwordConfirm = readText(formData, "passwordConfirm");
  const parsed = signupPasswordSchema.safeParse(password);
  const confirmError = password === passwordConfirm ? "" : "비밀번호가 일치하지 않아요.";
  if (!parsed.success || confirmError) {
    await writeSignupDraft({ ...draft, password, passwordOk: false, step: 2 });
    await writeSignupErrors({
      password: parsed.success ? "" : (parsed.error.issues[0]?.message ?? "비밀번호를 확인해 주세요."),
      passwordConfirm: confirmError,
    });
    redirect(signupPath(2));
  }

  await writeSignupDraft({ ...draft, password: parsed.data, passwordOk: true, step: 3 });
  await writeSignupErrors({});
  redirect(signupPath(3));
}

export async function submitSignupEmail(formData: FormData) {
  const draft = await readSignupDraft();
  await ensureReached(draft, 3);
  const email = readText(formData, "email");
  const parsed = signupEmailSchema.safeParse(email);
  const emailError = parsed.success ? "" : (parsed.error.issues[0]?.message ?? "이메일을 확인해 주세요.");

  let taken = { userIdTaken: false, emailTaken: false };
  let formError = "";
  try {
    taken = await userService.checkIdentity({
      userId: "",
      email: emailError ? "" : email.trim(),
    });
  } catch (error) {
    unstable_rethrow(error);
    formError = "중복 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  }

  const nextEmailError = emailError || (taken.emailTaken ? "이미 등록된 이메일입니다." : "");
  if (!parsed.success || nextEmailError || formError) {
    await writeSignupDraft({
      ...draft,
      email: email.trim(),
      emailOk: false,
      step: 3,
    });
    await writeSignupErrors({
      email: nextEmailError,
      form: formError,
    });
    redirect(signupPath(3));
  }

  await writeSignupDraft({
    ...draft,
    email: parsed.data,
    emailOk: true,
    step: 4,
  });
  await writeSignupErrors({});
  redirect(signupPath(4));
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
    redirect(signupPath(3));
  }

  await writeSignupDraft({
    ...draft,
    interestsText,
    interests: parsed.interests,
    interestsConfirmed: true,
    step: 4,
  });
  await writeSignupErrors({});
  redirect(signupPath(4));
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
  redirect(signupPath(4));
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
    redirect(signupPath(4));
  }

  if (!image.ok) {
    await writeSignupDraft({ ...draft, step: 4 });
    await writeSignupErrors({ profileImageUrl: image.message });
    redirect(signupPath(4));
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
  redirect(signupPath(step));
}

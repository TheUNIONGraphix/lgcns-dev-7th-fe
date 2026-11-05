"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import {
  initialSignupState,
  type SignupErrors,
  type SignupFormState,
  type SignupIntent,
  type SignupStep,
} from "@/actions/signupForm";
import { userService } from "@/service/userService";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readIntent(formData: FormData): SignupIntent {
  const intent = readText(formData, "intent");
  if (intent === "back" || intent === "skip") return intent;
  return "next";
}

function readStep(formData: FormData): SignupStep {
  const raw = Number(readText(formData, "step"));
  if (raw === 2 || raw === 3 || raw === 4) return raw;
  return 1;
}

function postedState(
  prev: SignupFormState,
  formData: FormData,
  step: SignupStep,
  errors: SignupErrors,
  overrides?: Partial<
    Pick<SignupFormState, "userId" | "password" | "passwordConfirm" | "email">
  >,
): SignupFormState {
  return {
    step,
    userId: readText(formData, "userId"),
    password: readText(formData, "password"),
    passwordConfirm: readText(formData, "passwordConfirm"),
    email: readText(formData, "email"),
    errors,
    seq: prev.seq + 1,
    ...overrides,
  };
}

async function profileImageFromForm(formData: FormData) {
  const entry = formData.get("profileImage");
  const file =
    entry instanceof Blob && entry.size > 0
      ? {
          type: entry.type,
          size: entry.size,
          dataUrl: `data:${entry.type};base64,${Buffer.from(await entry.arrayBuffer()).toString("base64")}`,
        }
      : null;
  return userService.acceptProfileImage({
    blocked: readText(formData, "profileImageBlocked"),
    file,
    profileImageUrl: "",
  });
}

export async function submitSignup(
  prev: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const requested = readIntent(formData);
  const step = readStep(formData);
  const intent: SignupIntent =
    requested === "skip" && step !== 4 ? "next" : requested;

  if (intent === "back") {
    const previous: SignupStep = step > 1 ? ((step - 1) as SignupStep) : 1;
    return postedState(prev, formData, previous, {});
  }

  let userId = readText(formData, "userId");
  let password = readText(formData, "password");
  const passwordConfirm = readText(formData, "passwordConfirm");
  let email = readText(formData, "email");

  try {
    const acceptedId = await userService.acceptSignupUserId(userId);
    if (!acceptedId.ok) {
      return postedState(prev, formData, 1, { userId: acceptedId.fieldError }, {
        userId: acceptedId.userId,
      });
    }
    userId = acceptedId.userId;
    if (step === 1) {
      return postedState(prev, formData, 2, {}, { userId });
    }

    const acceptedPassword = userService.acceptSignupPassword(
      password,
      passwordConfirm,
    );
    if (!acceptedPassword.ok) {
      return postedState(
        prev,
        formData,
        2,
        {
          password: acceptedPassword.passwordError,
          passwordConfirm: acceptedPassword.confirmError,
        },
        { userId, password: acceptedPassword.password },
      );
    }
    password = acceptedPassword.password;
    if (step === 2) {
      return postedState(prev, formData, 3, {}, { userId, password });
    }

    const acceptedEmail = await userService.acceptSignupEmail(email);
    if (!acceptedEmail.ok) {
      return postedState(prev, formData, 3, { email: acceptedEmail.fieldError }, {
        userId,
        password,
        email: acceptedEmail.email,
      });
    }
    email = acceptedEmail.email;
    if (step === 3) {
      return postedState(prev, formData, 4, {}, { userId, password, email });
    }
  } catch (error) {
    unstable_rethrow(error);
    return postedState(
      prev,
      formData,
      step,
      { form: "중복 확인에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { userId, password, passwordConfirm, email },
    );
  }

  let profileImageUrl: string | undefined;
  if (intent !== "skip") {
    try {
      const image = await profileImageFromForm(formData);
      if (!image.ok) {
        return postedState(
          prev,
          formData,
          4,
          { profileImageUrl: image.message },
          { userId, password, email },
        );
      }
      profileImageUrl = image.profileImageUrl;
    } catch (error) {
      unstable_rethrow(error);
      return postedState(
        prev,
        formData,
        4,
        { profileImageUrl: "프로필 사진을 읽지 못했습니다." },
        { userId, password, email },
      );
    }
  }

  const account = userService.prepareSignupAccount({
    userId,
    userIdOk: true,
    password,
    passwordOk: true,
    email,
    emailOk: true,
    interests: [],
  });
  if (!account.ok) {
    const errors: SignupErrors =
      account.step === 4 && "message" in account
        ? { form: account.message }
        : account.step === 2
          ? { password: "비밀번호를 확인해 주세요." }
          : account.step === 3
            ? { email: "이메일을 확인해 주세요." }
            : { userId: "아이디를 확인해 주세요." };
    return postedState(prev, formData, account.step, errors, {
      userId,
      password,
      email,
    });
  }

  try {
    const result = await userService.create({
      userId: account.userId,
      email: account.email,
      password: account.password,
      interests: account.interests,
      profileImageUrl,
    });
    if (!result.ok) {
      if (result.message.includes("아이디")) {
        return postedState(prev, formData, 1, { userId: result.message }, { userId, password, email });
      }
      if (result.message.includes("이메일")) {
        return postedState(prev, formData, 3, { email: result.message }, { userId, password, email });
      }
      return postedState(prev, formData, 4, { form: result.message }, { userId, password, email });
    }
  } catch (error) {
    unstable_rethrow(error);
    return postedState(
      prev,
      formData,
      4,
      { form: "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { userId, password, email },
    );
  }

  redirect("/login");
  return initialSignupState;
}

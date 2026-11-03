import { cookies } from "next/headers";
import { connection } from "next/server";
import { signupIdentitySchema, signupPasswordSchema, validateInterests } from "@/schema/signupSchema";

const DRAFT_COOKIE = "signup-draft";
const ERROR_COOKIE = "signup-errors";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 30,
};

type SignupStep = 1 | 2 | 3 | 4;

type SignupDraft = {
  userId: string;
  email: string;
  identityOk: boolean;
  password: string;
  passwordOk: boolean;
  interestsText: string;
  interests: string[];
  interestsConfirmed: boolean;
  step: SignupStep;
};

type SignupErrors = {
  userId?: string;
  email?: string;
  password?: string;
  interests?: string;
  profileImageUrl?: string;
  form?: string;
};

function emptySignupDraft(): SignupDraft {
  return {
    userId: "",
    email: "",
    identityOk: false,
    password: "",
    passwordOk: false,
    interestsText: "",
    interests: [],
    interestsConfirmed: false,
    step: 1,
  };
}

function clip(value: string, max: number) {
  return value.length > max ? value.slice(0, max) : value;
}

function asStep(value: unknown): SignupStep {
  if (value === 2 || value === 3 || value === 4) return value;
  return 1;
}

function normalizeSignupDraft(value: Partial<SignupDraft> | null | undefined): SignupDraft {
  const interests = Array.isArray(value?.interests)
    ? value.interests
        .filter((item): item is string => typeof item === "string")
        .slice(0, 20)
        .map((item) => clip(item, 40))
    : [];

  return {
    userId: clip(typeof value?.userId === "string" ? value.userId : "", 50),
    email: clip(typeof value?.email === "string" ? value.email : "", 254),
    identityOk: value?.identityOk === true,
    password: clip(typeof value?.password === "string" ? value.password : "", 1024),
    passwordOk: value?.passwordOk === true,
    interestsText: clip(typeof value?.interestsText === "string" ? value.interestsText : "", 2000),
    interests,
    interestsConfirmed: value?.interestsConfirmed === true,
    step: asStep(value?.step),
  };
}

function normalizeSignupErrors(value: Partial<SignupErrors> | null | undefined): SignupErrors {
  const next: SignupErrors = {};
  const keys = ["userId", "email", "password", "interests", "profileImageUrl", "form"] as const;
  for (const key of keys) {
    const message = value?.[key];
    if (typeof message === "string" && message.trim()) next[key] = clip(message, 200);
  }
  return next;
}

function furthestSignupStep(draft: SignupDraft): SignupStep {
  const identity = signupIdentitySchema.safeParse({ userId: draft.userId, email: draft.email });
  if (!draft.identityOk || !identity.success) return 1;
  const password = signupPasswordSchema.safeParse(draft.password);
  if (!draft.passwordOk || !password.success) return 2;
  if (!draft.interestsConfirmed) return 3;
  const interests = validateInterests(draft.interests);
  if (!interests.ok) return 3;
  return 4;
}

async function readSignupDraft() {
  await connection();
  const cookieStore = await cookies();
  const raw = cookieStore.get(DRAFT_COOKIE)?.value;
  if (!raw) return emptySignupDraft();
  try {
    return normalizeSignupDraft(JSON.parse(raw) as Partial<SignupDraft>);
  } catch {
    return emptySignupDraft();
  }
}

async function writeSignupDraft(draft: SignupDraft) {
  const cookieStore = await cookies();
  cookieStore.set(DRAFT_COOKIE, JSON.stringify(normalizeSignupDraft(draft)), COOKIE_OPTIONS);
}

async function readSignupErrors() {
  await connection();
  const cookieStore = await cookies();
  const raw = cookieStore.get(ERROR_COOKIE)?.value;
  if (!raw) return {};
  try {
    return normalizeSignupErrors(JSON.parse(raw) as SignupErrors);
  } catch {
    return {};
  }
}

async function writeSignupErrors(errors: SignupErrors) {
  const cookieStore = await cookies();
  const next = normalizeSignupErrors(errors);
  if (Object.keys(next).length === 0) {
    cookieStore.set(ERROR_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
    return;
  }
  cookieStore.set(ERROR_COOKIE, JSON.stringify(next), COOKIE_OPTIONS);
}

async function clearSignupState() {
  const cookieStore = await cookies();
  cookieStore.set(DRAFT_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  cookieStore.set(ERROR_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
}

export type { SignupDraft, SignupErrors, SignupStep };
export {
  clearSignupState,
  furthestSignupStep,
  readSignupDraft,
  readSignupErrors,
  writeSignupDraft,
  writeSignupErrors,
};

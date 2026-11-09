import { createHash, randomBytes, scryptSync } from "node:crypto";
import { Prisma } from "@prisma/client";
import { EXPIRES_IN_SECONDS, signAccessToken } from "@/lib/accessJwt";
import { prisma } from "@/lib/prisma";
import { authType } from "@/types/response/ResponseType";
import {
  interestsFromText,
  MAX_PROFILE_IMAGE_BYTES,
  parseProfileImage,
  signupEmailSchema,
  signupPasswordSchema,
  signupUserIdSchema,
  validateInterests,
} from "@/schema/signupSchema";

const USER_COLLECTION = "User";

type PublicUser = {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  interests: string[];
  profileImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function duplicateMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const target = error.meta?.target;
    const fields = Array.isArray(target)
      ? target.map(String)
      : [String(target ?? "")];
    if (fields.some((field) => field.includes("userId")))
      return "이미 사용 중인 아이디입니다.";
    if (fields.some((field) => field.includes("email")))
      return "이미 등록된 이메일입니다.";
  }
  const message = error instanceof Error ? error.message : "";
  if (message.includes("userId")) return "이미 사용 중인 아이디입니다.";
  if (message.includes("email")) return "이미 등록된 이메일입니다.";
  return "이미 사용 중인 아이디 또는 이메일입니다.";
}

function isDuplicateError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )
    return true;
  return message.includes("E11000") || message.includes("duplicate key");
}

function jsonObject(
  value: Prisma.JsonValue | undefined,
): Prisma.JsonObject | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value;
}

function firstBatch(result: Prisma.JsonObject) {
  const batch = jsonObject(result.cursor)?.firstBatch;
  if (!Array.isArray(batch)) return [];
  return batch.flatMap((item) => {
    const document = jsonObject(item);
    return document ? [document] : [];
  });
}

function readString(value: Prisma.JsonValue | undefined) {
  return typeof value === "string" ? value : "";
}

function readNullableString(value: Prisma.JsonValue | undefined) {
  return typeof value === "string" ? value : null;
}

function readInterests(value: Prisma.JsonValue | undefined) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

async function findDocuments(
  filter: Prisma.InputJsonObject,
  projection: Prisma.InputJsonObject,
) {
  const result = await prisma.$runCommandRaw({
    find: USER_COLLECTION,
    filter,
    projection,
    limit: 1,
  });
  return firstBatch(result);
}

async function list(): Promise<PublicUser[]> {
  const [users, extraResult] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.$runCommandRaw({
      find: USER_COLLECTION,
      filter: {},
      projection: {
        _id: 0,
        email: 1,
        userId: 1,
        interests: 1,
        profileImageUrl: 1,
      },
      batchSize: 1000,
    }),
  ]);

  const extras = new Map(
    firstBatch(extraResult).map((document) => [
      readString(document.email),
      document,
    ]),
  );
  return users.map((user) => {
    const extra = extras.get(user.email);
    return {
      id: user.id,
      userId: extra ? readString(extra.userId) : "",
      email: user.email,
      name: user.name,
      interests: extra ? readInterests(extra.interests) : [],
      profileImageUrl: extra ? readNullableString(extra.profileImageUrl) : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  });
}

async function checkIdentity(input: { userId: string; email: string }) {
  const userId = input.userId.trim();
  const email = input.email.trim();
  const [byUserId, byEmail] = await Promise.all([
    userId ? findDocuments({ userId }, { _id: 1 }) : Promise.resolve([]),
    email
      ? prisma.user.findUnique({ where: { email }, select: { id: true } })
      : Promise.resolve(null),
  ]);

  return {
    userIdTaken: byUserId.length > 0,
    emailTaken: Boolean(byEmail),
  };
}

async function create(input: {
  userId: string;
  email: string;
  password: string;
  name?: string;
  interests?: string[];
  profileImageUrl?: string;
}) {
  const userId = input.userId.trim();
  const email = input.email.trim();
  if (!userId) {
    return {
      ok: false as const,
      status: 400 as const,
      message: "아이디를 입력해 주세요.",
    };
  }
  if (input.password.length < 8) {
    return {
      ok: false as const,
      status: 400 as const,
      message: "비밀번호는 8자 이상이어야 합니다.",
    };
  }

  const interests = validateInterests(input.interests ?? []);
  if (!interests.ok) {
    return {
      ok: false as const,
      status: 400 as const,
      message: interests.message,
    };
  }

  const image = parseProfileImage(input.profileImageUrl ?? "");
  if (!image.ok) {
    return { ok: false as const, status: 400 as const, message: image.message };
  }

  const taken = await checkIdentity({ userId, email });
  if (taken.userIdTaken) {
    return {
      ok: false as const,
      status: 409 as const,
      message: "이미 사용 중인 아이디입니다.",
    };
  }
  if (taken.emailTaken) {
    return {
      ok: false as const,
      status: 409 as const,
      message: "이미 등록된 이메일입니다.",
    };
  }

  const now = new Date().toISOString();
  try {
    await prisma.$runCommandRaw({
      insert: USER_COLLECTION,
      documents: [
        {
          userId,
          email,
          name: input.name ?? null,
          password: hashPassword(input.password),
          interests: interests.interests,
          profileImageUrl: image.profileImageUrl ?? null,
          createdAt: { $date: now },
          updatedAt: { $date: now },
        },
      ],
    });

    const saved = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!saved) {
      return {
        ok: false as const,
        status: 500 as const,
        message: "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      };
    }

    const user: PublicUser = {
      id: saved.id,
      userId,
      email: saved.email,
      name: saved.name,
      interests: interests.interests,
      profileImageUrl: image.profileImageUrl ?? null,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
    return { ok: true as const, user };
  } catch (error) {
    if (isDuplicateError(error)) {
      return {
        ok: false as const,
        status: 409 as const,
        message: duplicateMessage(error),
      };
    }
    throw error;
  }
}

// async function login(input: { email: string; password: string }) {
//   const result = await prisma.(input.email, input.password);
//   if (!result.ok) return result;

//   const profile = {
//     id: String(result.data.userId),
//     email: result.data.email,
//     name: result.data.name ?? "",
//   };
//   return {
//     ok: true as const,
//     accessToken: await signAccessToken(profile),
//     springAccessToken: result.data.accessToken,
//     refreshToken: result.data.refreshToken,
//     expiresIn: result.data.expiresIn || EXPIRES_IN_SECONDS,
//     user: profile,
//   };
// }

function socialUserId(provider: string, providerAccountId: string) {
  const prefix = provider === "google" ? "g_" : "k_";
  const hash = createHash("sha256")
    .update(`${provider}:${providerAccountId}`)
    .digest("hex")
    .slice(0, 12);
  return `${prefix}${hash}`;
}

function syntheticEmail(provider: string, providerAccountId: string) {
  return `${socialUserId(provider, providerAccountId)}@oauth.local`;
}

async function linkSocialAccount(input: {
  provider: string;
  providerAccountId: string;
  email?: string | null;
  name?: string | null;
  profileImageUrl?: string | null;
}) {
  const providerAccountId = input.providerAccountId.trim();
  const email = input.email?.trim().toLowerCase() || null;
  const name = input.name?.trim() || null;
  const profileImageUrl = input.profileImageUrl?.trim() || null;

  const linked = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: input.provider,
        providerAccountId,
      },
    },
    include: {
      user: {
        select: { id: true, email: true, name: true, profileImageUrl: true },
      },
    },
  });

  if (linked) {
    const nextEmail =
      linked.user.email.endsWith("@oauth.local") && email
        ? email
        : linked.user.email;
    const emailOwner = email
      ? await prisma.user.findUnique({
          where: { email },
          select: { id: true },
        })
      : null;
    const canReplaceEmail = nextEmail !== linked.user.email && !emailOwner;
    if (
      canReplaceEmail ||
      (name && !linked.user.name) ||
      (profileImageUrl && !linked.user.profileImageUrl)
    ) {
      await prisma.user.update({
        where: { id: linked.user.id },
        data: {
          email: canReplaceEmail ? nextEmail : undefined,
          name: name && !linked.user.name ? name : undefined,
          profileImageUrl:
            profileImageUrl && !linked.user.profileImageUrl
              ? profileImageUrl
              : undefined,
        },
      });
    }
    return {
      id: linked.user.id,
      email: canReplaceEmail ? nextEmail : linked.user.email,
      name: linked.user.name || name,
      profileImageUrl: linked.user.profileImageUrl || profileImageUrl,
    };
  }

  if (email) {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, profileImageUrl: true },
    });
    if (existing) {
      await prisma.account.create({
        data: {
          provider: input.provider,
          providerAccountId,
          userId: existing.id,
        },
      });
      if ((name && !existing.name) || (profileImageUrl && !existing.profileImageUrl)) {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            name: name && !existing.name ? name : undefined,
            profileImageUrl:
              profileImageUrl && !existing.profileImageUrl
                ? profileImageUrl
                : undefined,
          },
        });
      }
      return {
        id: existing.id,
        email: existing.email,
        name: existing.name || name,
        profileImageUrl: existing.profileImageUrl || profileImageUrl,
      };
    }
  }

  const created = await prisma.user.create({
    data: {
      userId: socialUserId(input.provider, providerAccountId),
      email: email ?? syntheticEmail(input.provider, providerAccountId),
      name,
      profileImageUrl,
      interests: [],
      accounts: {
        create: { provider: input.provider, providerAccountId },
      },
    },
    select: { id: true, email: true, name: true, profileImageUrl: true },
  });
  return {
    id: created.id,
    email: created.email,
    name: created.name,
    profileImageUrl: created.profileImageUrl,
  };
}

const PROFILE_IMAGE_TYPES = new Set(["image/png", "image/jpeg"]);

async function findSessionUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true },
  });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name || user.email || "회원",
  };
}

async function acceptSignupUserId(userId: string) {
  const parsed = signupUserIdSchema.safeParse(userId);
  const trimmed = userId.trim();
  if (!parsed.success) {
    return {
      ok: false as const,
      userId: trimmed,
      fieldError: parsed.error.issues[0]?.message ?? "아이디를 확인해 주세요.",
    };
  }
  const taken = await checkIdentity({ userId: parsed.data, email: "" });
  if (taken.userIdTaken) {
    return {
      ok: false as const,
      userId: trimmed,
      fieldError: "이미 사용 중인 아이디입니다.",
    };
  }
  return { ok: true as const, userId: parsed.data };
}

function acceptSignupPassword(password: string, passwordConfirm: string) {
  const parsed = signupPasswordSchema.safeParse(password);
  const confirmError =
    password === passwordConfirm ? "" : "비밀번호가 일치하지 않아요.";
  if (!parsed.success || confirmError) {
    return {
      ok: false as const,
      password,
      passwordError: parsed.success
        ? ""
        : (parsed.error.issues[0]?.message ?? "비밀번호를 확인해 주세요."),
      confirmError,
    };
  }
  return { ok: true as const, password: parsed.data };
}

async function acceptSignupEmail(email: string) {
  const parsed = signupEmailSchema.safeParse(email);
  const trimmed = email.trim();
  if (!parsed.success) {
    return {
      ok: false as const,
      email: trimmed,
      fieldError: parsed.error.issues[0]?.message ?? "이메일을 확인해 주세요.",
    };
  }
  const taken = await checkIdentity({ userId: "", email: parsed.data });
  if (taken.emailTaken) {
    return {
      ok: false as const,
      email: trimmed,
      fieldError: "이미 등록된 이메일입니다.",
    };
  }
  return { ok: true as const, email: parsed.data };
}

function acceptSignupInterests(interestsText: string) {
  const parsed = interestsFromText(interestsText);
  if (!parsed.ok) {
    return { ok: false as const, interestsText, message: parsed.message };
  }
  return {
    ok: true as const,
    interestsText,
    interests: parsed.interests,
  };
}

function prepareSignupAccount(input: {
  userId: string;
  userIdOk: boolean;
  password: string;
  passwordOk: boolean;
  email: string;
  emailOk: boolean;
  interests: string[];
}) {
  const userId = signupUserIdSchema.safeParse(input.userId);
  if (!userId.success || !input.userIdOk) {
    return { ok: false as const, step: 1 as const, clearUserId: true };
  }
  const password = signupPasswordSchema.safeParse(input.password);
  if (!password.success || !input.passwordOk) {
    return { ok: false as const, step: 2 as const };
  }
  const email = signupEmailSchema.safeParse(input.email);
  if (!email.success || !input.emailOk) {
    return { ok: false as const, step: 3 as const, clearEmail: true };
  }
  const interests = validateInterests(input.interests);
  if (!interests.ok) {
    return { ok: false as const, step: 4 as const, message: interests.message };
  }
  return {
    ok: true as const,
    userId: userId.data,
    email: email.data,
    password: password.data,
    interests: interests.interests,
  };
}

function acceptProfileImage(input: {
  blocked: string;
  file: { type: string; size: number; dataUrl: string } | null;
  profileImageUrl: string;
}) {
  if (input.blocked === "type") {
    return { ok: false as const, message: "JPG, PNG 이미지만 등록할 수 있습니다." };
  }
  if (input.blocked === "size") {
    return { ok: false as const, message: "프로필 사진은 5MB 이하로 등록해 주세요." };
  }
  if (input.file) {
    if (!PROFILE_IMAGE_TYPES.has(input.file.type)) {
      return { ok: false as const, message: "JPG, PNG 이미지만 등록할 수 있습니다." };
    }
    if (input.file.size > MAX_PROFILE_IMAGE_BYTES) {
      return { ok: false as const, message: "프로필 사진은 5MB 이하로 등록해 주세요." };
    }
    return parseProfileImage(input.file.dataUrl);
  }
  return parseProfileImage(input.profileImageUrl);
}

export const userService = {
  list,
  create,
  // login,
  checkIdentity,
  linkSocialAccount,
  findSessionUser,
  acceptSignupUserId,
  acceptSignupPassword,
  acceptSignupEmail,
  acceptSignupInterests,
  acceptProfileImage,
  prepareSignupAccount,
};

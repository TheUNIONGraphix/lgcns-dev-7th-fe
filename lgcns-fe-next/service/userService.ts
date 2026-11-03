import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseProfileImage, validateInterests } from "@/schema/signupSchema";

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

function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

function duplicateMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const target = error.meta?.target;
    const fields = Array.isArray(target) ? target.map(String) : [String(target ?? "")];
    if (fields.some((field) => field.includes("userId"))) return "이미 사용 중인 아이디입니다.";
    if (fields.some((field) => field.includes("email"))) return "이미 등록된 이메일입니다.";
  }
  const message = error instanceof Error ? error.message : "";
  if (message.includes("userId")) return "이미 사용 중인 아이디입니다.";
  if (message.includes("email")) return "이미 등록된 이메일입니다.";
  return "이미 사용 중인 아이디 또는 이메일입니다.";
}

function isDuplicateError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return true;
  return message.includes("E11000") || message.includes("duplicate key");
}

function jsonObject(value: Prisma.JsonValue | undefined): Prisma.JsonObject | null {
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

async function findDocuments(filter: Prisma.InputJsonObject, projection: Prisma.InputJsonObject) {
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
      projection: { _id: 0, email: 1, userId: 1, interests: 1, profileImageUrl: 1 },
      batchSize: 1000,
    }),
  ]);

  const extras = new Map(firstBatch(extraResult).map((document) => [readString(document.email), document]));
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
    return { ok: false as const, status: 400 as const, message: "아이디를 입력해 주세요." };
  }
  if (input.password.length < 8) {
    return { ok: false as const, status: 400 as const, message: "비밀번호는 8자 이상이어야 합니다." };
  }

  const interests = validateInterests(input.interests ?? []);
  if (!interests.ok) {
    return { ok: false as const, status: 400 as const, message: interests.message };
  }

  const image = parseProfileImage(input.profileImageUrl ?? "");
  if (!image.ok) {
    return { ok: false as const, status: 400 as const, message: image.message };
  }

  const taken = await checkIdentity({ userId, email });
  if (taken.userIdTaken) {
    return { ok: false as const, status: 409 as const, message: "이미 사용 중인 아이디입니다." };
  }
  if (taken.emailTaken) {
    return { ok: false as const, status: 409 as const, message: "이미 등록된 이메일입니다." };
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
      return { ok: false as const, status: 500 as const, message: "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요." };
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
      return { ok: false as const, status: 409 as const, message: duplicateMessage(error) };
    }
    throw error;
  }
}

async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
    },
  });
  if (!user || !verifyPassword(input.password, user.password)) {
    return { ok: false as const, message: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  console.log("=============userService.login=============");
  console.log(user);

  return {
    ok: true as const,
    accessToken: randomBytes(32).toString("hex"),
    expiresIn: 60 * 60 * 2,
    user: { id: user.id, email: user.email, name: user.name },
  };
}

export const userService = { list, create, login, checkIdentity };

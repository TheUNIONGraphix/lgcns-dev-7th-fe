import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseProfileImage, validateInterests } from "@/schema/signupSchema";

const publicUser = {
  id: true,
  userId: true,
  email: true,
  name: true,
  interests: true,
  profileImageUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

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

function duplicateMessage(error: Prisma.PrismaClientKnownRequestError) {
  const target = error.meta?.target;
  const fields = Array.isArray(target) ? target.map(String) : [String(target ?? "")];
  if (fields.some((field) => field.includes("userId"))) return "이미 사용 중인 아이디입니다.";
  if (fields.some((field) => field.includes("email"))) return "이미 등록된 이메일입니다.";
  return "이미 사용 중인 아이디 또는 이메일입니다.";
}

async function list() {
  return prisma.user.findMany({
    select: publicUser as unknown as Prisma.UserSelect,
    orderBy: { createdAt: "desc" },
  });
}

async function checkIdentity(input: { userId: string; email: string }) {
  const userId = input.userId.trim();
  const email = input.email.trim();
  const [byUserId, byEmail] = await Promise.all([
    userId
      ? prisma.user.findUnique({
          where: { userId } as unknown as Prisma.UserWhereUniqueInput,
          select: { id: true },
        })
      : Promise.resolve(null),
    email
      ? prisma.user.findUnique({ where: { email }, select: { id: true } })
      : Promise.resolve(null),
  ]);

  return {
    userIdTaken: Boolean(byUserId),
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

  try {
    const user = await prisma.user.create({
      data: {
        userId,
        email,
        name: input.name,
        password: hashPassword(input.password),
        interests: interests.interests,
        profileImageUrl: image.profileImageUrl,
      } as unknown as Prisma.UserCreateInput,
      select: publicUser as unknown as Prisma.UserSelect,
    });

    return { ok: true as const, user };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
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

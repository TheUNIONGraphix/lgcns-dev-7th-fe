import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

const publicUser = {
  id: true,
  email: true,
  name: true,
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

async function list() {
  return prisma.user.findMany({
    select: publicUser,
    orderBy: { createdAt: "desc" },
  });
}

async function create(input: { email: string; password: string; name?: string }) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    return { ok: false as const, message: "이미 등록된 이메일입니다." };
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      password: hashPassword(input.password),
    },
    select: publicUser,
  });

  return { ok: true as const, user };
}

async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !verifyPassword(input.password, user.password)) {
    return { ok: false as const, message: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  return {
    ok: true as const,
    accessToken: randomBytes(32).toString("hex"),
    expiresIn: 60 * 60 * 2,
    user: { id: user.id, email: user.email, name: user.name },
  };
}

export const userService = { list, create, login };

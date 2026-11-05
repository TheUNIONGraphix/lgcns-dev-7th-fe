import { randomBytes, scryptSync } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const COUNT = 1000;
const PASSWORD = "Sample1234!";
const SAMPLE_USER_ID = /^sample\d{4}$/;

function loadEnvFile(file) {
  if (!existsSync(file)) return;
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index < 0) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function pad(index) {
  return String(index).padStart(4, "0");
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const appEnv = process.env.APP_ENV ?? "local";
const databaseKey =
  appEnv === "develop" ? "DATABASE_URL_DEVELOP" : "DATABASE_URL_LOCAL";
const databaseUrl = process.env[databaseKey];
if (!databaseUrl) {
  console.error(`${databaseKey} 이 없습니다.`);
  process.exit(1);
}
process.env.DATABASE_URL = databaseUrl;

const prisma = new PrismaClient();
const password = hashPassword(PASSWORD);
const interests = ["여행", "맛집", "개발", "음악", "운동"];
const now = Date.now();

const users = Array.from({ length: COUNT }, (_, offset) => {
  const number = offset + 1;
  const id = `sample${pad(number)}`;
  return {
    userId: id,
    email: `${id}@example.com`,
    name: `샘플 사용자 ${number}`,
    password,
    interests: [interests[offset % interests.length]],
    createdAt: new Date(now - (COUNT - offset) * 60_000),
    updatedAt: new Date(now - (COUNT - offset) * 60_000),
  };
});

async function removePreviousSample() {
  const existing = await prisma.user.findMany({
    where: { userId: { startsWith: "sample" } },
    select: { id: true, userId: true },
  });
  const ids = existing
    .filter((user) => SAMPLE_USER_ID.test(user.userId))
    .map((user) => user.id);
  if (ids.length === 0) return;

  const posts = await prisma.post.findMany({
    where: { authorId: { in: ids } },
    select: { id: true },
  });
  const postIds = posts.map((post) => post.id);
  await prisma.like.deleteMany({
    where: {
      OR: [
        { userId: { in: ids } },
        ...(postIds.length > 0 ? [{ postId: { in: postIds } }] : []),
      ],
    },
  });
  await prisma.comment.deleteMany({
    where: {
      OR: [
        { authorId: { in: ids } },
        ...(postIds.length > 0 ? [{ postId: { in: postIds } }] : []),
      ],
    },
  });
  await prisma.post.deleteMany({ where: { authorId: { in: ids } } });
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
}

try {
  await removePreviousSample();
  await prisma.user.createMany({ data: users });
  const savedUsers = await prisma.user.findMany({
    where: { userId: { startsWith: "sample" } },
    orderBy: { userId: "asc" },
    select: { id: true, userId: true, name: true },
  });
  const sampleUsers = savedUsers.filter((user) =>
    SAMPLE_USER_ID.test(user.userId),
  );
  if (sampleUsers.length !== COUNT) {
    throw new Error(`사용자 ${sampleUsers.length}명만 저장되었습니다.`);
  }

  await prisma.post.createMany({
    data: sampleUsers.map((user, offset) => ({
      authorId: user.id,
      authorName: user.name ?? user.userId,
      body: `<p>샘플 게시글 ${offset + 1}. 피드와 상세에서 볼 수 있는 기본 데이터입니다.</p>`,
      createdAt: new Date(now - (COUNT - offset) * 60_000),
    })),
  });
  const posts = await prisma.post.findMany({
    where: { authorId: { in: sampleUsers.map((user) => user.id) } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (posts.length !== COUNT) {
    throw new Error(`게시글 ${posts.length}개만 저장되었습니다.`);
  }

  await prisma.comment.createMany({
    data: posts.map((post, offset) => {
      const author = sampleUsers[(offset + 1) % COUNT];
      return {
        postId: post.id,
        authorId: author.id,
        authorName: author.name ?? author.userId,
        body: `샘플 댓글 ${offset + 1}입니다.`,
        createdAt: new Date(now - (COUNT - offset) * 30_000),
      };
    }),
  });
  await prisma.like.createMany({
    data: posts.map((post, offset) => ({
      postId: post.id,
      userId: sampleUsers[(offset + 2) % COUNT].id,
      createdAt: new Date(now - (COUNT - offset) * 30_000),
    })),
  });

  const [userCount, postCount, commentCount, likeCount] = await Promise.all([
    prisma.user.count({ where: { userId: { startsWith: "sample" } } }),
    prisma.post.count({
      where: { authorId: { in: sampleUsers.map((user) => user.id) } },
    }),
    prisma.comment.count({
      where: { authorId: { in: sampleUsers.map((user) => user.id) } },
    }),
    prisma.like.count({
      where: { userId: { in: sampleUsers.map((user) => user.id) } },
    }),
  ]);
  console.log(
    `users ${userCount}, posts ${postCount}, comments ${commentCount}, likes ${likeCount}`,
  );
} finally {
  await prisma.$disconnect();
}

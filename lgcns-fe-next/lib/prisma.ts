import { PrismaClient } from "@prisma/client";

const databaseUrlKey = {
  local: "DATABASE_URL_LOCAL",
  develop: "DATABASE_URL_DEVELOP",
} as const;

const appEnv = process.env.APP_ENV ?? "local";
if (appEnv !== "local" && appEnv !== "develop") {
  throw new Error(`APP_ENV는 local 또는 develop 이어야 합니다: ${appEnv}`);
}

const configuredDatabaseUrl = process.env[databaseUrlKey[appEnv]];
if (!configuredDatabaseUrl) {
  throw new Error(`${databaseUrlKey[appEnv]} 이 .env에 없습니다.`);
}
export const databaseUrl = configuredDatabaseUrl;
process.env.DATABASE_URL = databaseUrl;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

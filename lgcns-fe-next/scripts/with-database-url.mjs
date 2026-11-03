import { spawn } from "node:child_process";

const profiles = {
  local: "DATABASE_URL_LOCAL",
  develop: "DATABASE_URL_DEVELOP",
};

const appEnv = process.env.APP_ENV ?? "local";
const key = profiles[appEnv];
if (!key) {
  console.error(`APP_ENV는 local 또는 develop 이어야 합니다: ${appEnv}`);
  process.exit(1);
}

const url = process.env[key];
if (!url) {
  console.error(`${key} 이 .env에 없습니다.`);
  process.exit(1);
}

process.env.DATABASE_URL = url;

const child = spawn(
  process.execPath,
  ["./node_modules/prisma/build/index.js", ...process.argv.slice(2)],
  { stdio: "inherit", env: process.env },
);

child.on("exit", (code) => process.exit(code ?? 1));

"use server";

import { prismaAuthAdapter } from "@/service/auth/prismaAuthAdapter";
import { springAuthAdapter } from "@/service/auth/springAuthAdapter";
import type { AuthPort, SocialLinkInput } from "@/service/auth/authPort";

function authAdapter(): AuthPort {
  if (process.env.AUTH_ADAPTER === "prisma") return prismaAuthAdapter;
  return springAuthAdapter;
}

export async function loginWithCredentials(email: string, password: string) {
  return authAdapter().login({ email, password });
}

export async function linkAuthSocialAccount(input: SocialLinkInput) {
  return authAdapter().linkSocialAccount(input);
}

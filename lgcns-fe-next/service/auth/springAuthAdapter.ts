import { springAuthLogin } from "@/service/spring/sprignAuthService";
import { prismaAuthAdapter } from "@/service/auth/prismaAuthAdapter";
import type {
  AuthPort,
  CredentialLoginInput,
  SocialLinkInput,
} from "@/service/auth/authPort";

async function login(input: CredentialLoginInput) {
  const result = await springAuthLogin(input.email, input.password);
  if (!result.ok) return result;
  const data = result.data;
  return {
    ok: true as const,
    user: {
      id: String(data.userId),
      email: data.email,
      name: data.name,
      profileImageUrl: data.avatarUrl ?? "",
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      role: data.role,
      platformRole: data.platformRole,
      avatarUrl: data.avatarUrl ?? "",
      presenceStatus: data.presenceStatus,
      statusMessage: data.statusMessage ?? "",
      accountStatus: data.accountStatus,
      companyId: data.companyId?.toString() ?? "",
    },
  };
}

function linkSocialAccount(input: SocialLinkInput) {
  return prismaAuthAdapter.linkSocialAccount(input);
}

export const springAuthAdapter: AuthPort = {
  login,
  linkSocialAccount,
};

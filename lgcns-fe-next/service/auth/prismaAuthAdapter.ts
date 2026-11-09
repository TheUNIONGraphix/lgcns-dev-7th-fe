import { EXPIRES_IN_SECONDS } from "@/lib/accessJwt";
import { userService } from "@/service/userService";
import type {
  AuthPort,
  CredentialLoginInput,
  SocialLinkInput,
} from "@/service/auth/authPort";

async function login(input: CredentialLoginInput) {
  const result = await userService.login(input);
  if (!result.ok) return result;
  return {
    ok: true as const,
    user: {
      id: result.data.id,
      email: result.data.email,
      name: result.data.name ?? "",
      profileImageUrl: result.data.profileImageUrl ?? "",
      accessToken: "",
      refreshToken: "",
      expiresIn: EXPIRES_IN_SECONDS,
      role: "",
      platformRole: "",
      avatarUrl: result.data.profileImageUrl ?? "",
      presenceStatus: "",
      statusMessage: "",
      accountStatus: "",
      companyId: "",
    },
  };
}

function linkSocialAccount(input: SocialLinkInput) {
  return userService.linkSocialAccount(input);
}

export const prismaAuthAdapter: AuthPort = {
  login,
  linkSocialAccount,
};

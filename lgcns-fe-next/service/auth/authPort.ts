export type CredentialLoginInput = {
  email: string;
  password: string;
};

export type AuthAccount = {
  id: string;
  email: string;
  name: string;
  profileImageUrl: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  role: string;
  platformRole: string;
  avatarUrl: string;
  presenceStatus: string;
  statusMessage: string;
  accountStatus: string;
  companyId: string;
};

export type SocialLinkInput = {
  provider: string;
  providerAccountId: string;
  email?: string | null;
  name?: string | null;
  profileImageUrl?: string | null;
};

export type LinkedSocialAccount = {
  id: string;
  email: string;
  name: string | null;
  profileImageUrl: string | null;
};

export type AuthLoginResult =
  | { ok: true; user: AuthAccount }
  | { ok: false; message: string };

export type AuthPort = {
  login(input: CredentialLoginInput): Promise<AuthLoginResult>;
  linkSocialAccount(input: SocialLinkInput): Promise<LinkedSocialAccount>;
};

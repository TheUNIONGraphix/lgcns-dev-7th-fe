import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import KakaoProvider from "next-auth/providers/kakao";
import GoogleProvider from "next-auth/providers/google";

import { EXPIRES_IN_SECONDS, signAccessToken } from "@/lib/accessJwt";
import { userService } from "@/service/userService";
import { springAuthLogin } from "@/service/spring/sprignAuthService";
import { SpringLoginData } from "@/types/response/springApiResponseType";

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function socialProfile(
  provider: string,
  profile: unknown,
  user: { email?: string | null; name?: string | null; image?: string | null },
) {
  const record =
    profile && typeof profile === "object"
      ? (profile as {
          email?: string;
          name?: string;
          picture?: string;
          kakao_account?: {
            email?: string;
            profile?: { nickname?: string; profile_image_url?: string };
          };
        })
      : {};
  const kakao = record.kakao_account;
  return {
    email: text(user.email) ?? text(record.email) ?? text(kakao?.email),
    name:
      text(user.name) ??
      text(record.name) ??
      text(kakao?.profile?.nickname) ??
      provider,
    profileImageUrl:
      text(user.image) ??
      text(record.picture) ??
      text(kakao?.profile?.profile_image_url),
  };
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: EXPIRES_IN_SECONDS },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Login ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) return null;

        // const result = await userService.login({
        //   email: credentials.email,
        //   password: credentials.password,
        // });
        const result = await springAuthLogin(credentials.email, credentials.password);
        const data = result.data as SpringLoginData;
        if (!result.ok) return null;

        return {
          id: data.userId.toString(),
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
        } as User;
      },
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID ?? "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET ?? "",
      authorization: {
        url: "https://kauth.kakao.com/oauth/authorize",
        params: {
          scope: "profile_nickname,profile_image,account_email",
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (
        account &&
        (account.provider === "kakao" || account.provider === "google")
      ) {
        const social = socialProfile(account.provider, profile, user ?? {});
        const linked = await userService.linkSocialAccount({
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          email: social.email,
          name: social.name,
          profileImageUrl: social.profileImageUrl,
        });
        token.accessToken = await signAccessToken({
          id: linked.id,
          email: linked.email,
          name: linked.name ?? "",
        });
        token.expiresIn = EXPIRES_IN_SECONDS;
        token.id = linked.id;
        token.email = linked.email;
        token.name = linked.name ?? "";
        token.profileImageUrl = linked.profileImageUrl ?? undefined;
        return token;
      }

      if (account?.provider === "credentials" && user) {
        token.springAccessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessToken = await signAccessToken({
          id: user.id,
          email: user.email ?? "",
          name: user.name ?? "",
        });
        token.expiresIn = user.expiresIn;
        token.id = user.id;
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
        token.profileImageUrl = user.profileImageUrl;
        return token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken ?? "";
      session.expiresIn = token.expiresIn ?? EXPIRES_IN_SECONDS;
      session.user = {
        id: token.id ?? "",
        email: token.email ?? "",
        name: token.name ?? "",
        profileImageUrl: token.profileImageUrl ?? "",
        accessToken: token.accessToken ?? "",
        refreshToken: token.refreshToken ?? "",
        expiresIn: token.expiresIn ?? EXPIRES_IN_SECONDS,
      } as User;
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};

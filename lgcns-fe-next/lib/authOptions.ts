import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import KakaoProvider from "next-auth/providers/kakao";
import GoogleProvider from "next-auth/providers/google";

import { userService } from "@/service/userService";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 2 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Login ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const result = await userService.login({
          email: credentials.email,
          password: credentials.password,
        });
        if (!result.ok) return null;
        console.log("=============authOptions.authorize=============");
        console.log(result);

        return {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name ?? "",
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        };
      },
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID ?? "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET ?? "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "kakao") {
        const kakao = profile as {
          id?: number;
          kakao_account?: {
            email?: string;
            profile?: { nickname?: string; profile_image_url?: string };
          };
        };
        console.log("=============kakao profile=============");
        console.log(profile);
        console.log("=============kakao account=============");
        console.log(account);
        console.log("=============kakao user=============");
        console.log(user);

        token.accessToken = account.access_token;
        if (typeof account.expires_at === "number") {
          token.expiresIn = account.expires_at - Math.floor(Date.now() / 1000);
        }
        token.id = user?.id ?? String(kakao.id ?? account.providerAccountId);
        token.email = user?.email ?? kakao.kakao_account?.email ?? token.email;
        token.name = user?.name ?? kakao.kakao_account?.profile?.nickname ?? token.name;
        token.profileImageUrl =
          user?.image ?? kakao.kakao_account?.profile?.profile_image_url ?? token.profileImageUrl;
        return token;
      }

      if (account?.provider === "google") {
        const google = profile as {
          id?: string;
          email?: string;
          name?: string;
          image?: string;
        };
        console.log("=============google profile=============");
        console.log(profile);
        console.log("=============google account=============");
        console.log(account);
        console.log("=============google user=============");
        console.log(user);

        token.accessToken = account.access_token;
        if (typeof account.expires_at === "number") {
          token.expiresIn = account.expires_at - Math.floor(Date.now() / 1000);
        }
        token.id = user?.id ?? String(google.id ?? account.providerAccountId);
        token.email = user?.email ?? google.email ?? token.email;
        token.name = user?.name ?? google.name ?? token.name;
        token.profileImageUrl = user?.image ?? google.image ?? token.profileImageUrl;
        return token;
      }

      if (account?.provider === "credentials" && user) {
        token.accessToken = user.accessToken;
        token.expiresIn = user.expiresIn;
        token.id = user.id;
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
        return token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken ?? "";
      session.expiresIn = token.expiresIn ?? 60 * 60 * 2;
      session.user = {
        id: token.id ?? "",
        email: token.email ?? "",
        name: token.name ?? "",
        profileImageUrl: token.profileImageUrl,
      };
      console.log("=============session=============");
      console.log(session);
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};
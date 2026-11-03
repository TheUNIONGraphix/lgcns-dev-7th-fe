import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.expiresIn = user.expiresIn;
        token.id = user.id;
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
      };
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};
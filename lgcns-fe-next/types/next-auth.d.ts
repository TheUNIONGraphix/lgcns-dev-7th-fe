import "next-auth";
import "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    springAccessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    id?: string;
    profileImageUrl?: string;
  }
}

declare module "next-auth" {
  interface Session {
    accessToken: string;
    expiresIn: number;
    user: {
      id: string;
      email: string;
      name: string;
      profileImageUrl?: string;
    };
  }
  // interface User {
  //   id: string;
  //   accessToken?: string;
  //   springAccessToken?: string;
  //   refreshToken?: string;
  //   expiresIn?: number;
  //   profileImageUrl?: string;
  // }
  interface User extends SpringLoginData {
    // "refreshToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0MSIsInR5cCI6InJlZnJlc2giLCJpYXQiOjE3OTQxOTk1NzgsImV4cCI6MTc5NTQwOTE3OH0.xuC7cJQyDNvdq0GeXXHAKcERpksICwTABjLSpJGAWWU",
    // "expiresIn": 7200,
    // "tokenType": "Bearer",
    // "userId": 41,
    // "email": "student@example.com",
    // "name": "홍길동",
    // "role": "STUDENT",
    // "platformRole": "USER",
    // "avatarUrl": null,
    // "presenceStatus": "ONLINE",
    // "statusMessage": null,
    // "accountStatus": "ACTIVE",
    // "companyId": null
    id: string;
    email: string;
    name: string;
    profileImageUrl: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    profileImageUrl: string;
    role: string;
    platformRole: string;
    avatarUrl: string;
    presenceStatus: string;
    statusMessage: string;
    accountStatus: string;
    companyId: string;
  }
}

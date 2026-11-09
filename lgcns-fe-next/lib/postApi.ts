import { verifyAccessToken } from "@/lib/accessJwt";
import { userService } from "@/service/userService";

export const postCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function userFromRequest(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  if (!payload) return null;
  const user = await userService.findSessionUser(payload.id);
  if (user) return user;
  return {
    id: payload.id,
    email: payload.email,
    name: payload.name || payload.email || "회원",
  };
}

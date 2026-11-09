import { SignJWT, jwtVerify } from "jose";

const EXPIRES_IN_SECONDS = 60 * 60 * 2;

function secret() {
  const value = process.env.NEXTAUTH_SECRET;
  if (!value) throw new Error("NEXTAUTH_SECRET이 없습니다.");
  return new TextEncoder().encode(value);
}

export async function signAccessToken(user: {
  id: string;
  email: string;
  name: string;
}) {
  return new SignJWT({ email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${EXPIRES_IN_SECONDS}s`)
    .sign(secret());
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret(), {
      algorithms: ["HS256"],
    });
    if (!payload.sub || /\s/.test(payload.sub)) return null;
    return {
      id: payload.sub,
      email: typeof payload.email === "string" ? payload.email : "",
      name: typeof payload.name === "string" ? payload.name : "",
    };
  } catch {
    return null;
  }
}

export { EXPIRES_IN_SECONDS };

import { safeCallbackPath } from "@/config/initial";

const RETURN_TO_COOKIE = "returnTo";
const CONTINUE_PATH = "/auth/continue";
const RETURN_TO_MAX_AGE = 60 * 30;

function returnToCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: RETURN_TO_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  };
}

function encodeReturnTo(value: string | null | undefined) {
  return encodeURIComponent(safeCallbackPath(value));
}

function decodeReturnTo(value: string | undefined) {
  if (!value) return "/";
  try {
    return safeCallbackPath(decodeURIComponent(value));
  } catch {
    return "/";
  }
}

export {
  CONTINUE_PATH,
  RETURN_TO_COOKIE,
  decodeReturnTo,
  encodeReturnTo,
  returnToCookieOptions,
};

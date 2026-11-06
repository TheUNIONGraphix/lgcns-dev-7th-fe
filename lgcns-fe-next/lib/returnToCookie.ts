import { cookies } from "next/headers";
import { RETURN_TO_COOKIE, encodeReturnTo, returnToCookieOptions } from "@/lib/returnTo";

async function saveReturnTo(value: string | null | undefined) {
  const jar = await cookies();
  jar.set(RETURN_TO_COOKIE, encodeReturnTo(value), returnToCookieOptions());
}

export { saveReturnTo };

"use client";

import { useSearchParams } from "next/navigation";
import { safeCallbackPath } from "@/config/initial";
import LoginForm from "../organisms/LoginForm";
import KakaoLoginButton from "../molecules/KakaoLoginButton";
import GoogleLoginButton from "../molecules/GoogleLoginButton";

export default function LoginSection() {
  const callbackUrl = safeCallbackPath(useSearchParams().get("callbackUrl"));

  return (
    <section>
      <LoginForm callbackUrl={callbackUrl} />
      <KakaoLoginButton callbackUrl={callbackUrl} />
      <GoogleLoginButton callbackUrl={callbackUrl} />
    </section>
  );
}

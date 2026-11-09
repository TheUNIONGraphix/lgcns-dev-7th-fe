"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { CONTINUE_PATH } from "@/lib/returnTo";

export default function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    signIn("google", {
      redirect: true,
      callbackUrl: CONTINUE_PATH,
    });
  };
  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleLogin}
      className="h-14 w-full gap-3 rounded-[12px] border-[#d1d5db] bg-white text-[15px] font-semibold text-[#374151] shadow-none hover:bg-[#f9fafb]"
    >
      구글로 로그인
    </Button>
  );
}

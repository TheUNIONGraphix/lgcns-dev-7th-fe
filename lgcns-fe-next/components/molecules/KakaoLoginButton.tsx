"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { CONTINUE_PATH } from "@/lib/returnTo";

export default function KakaoLoginButton() {
  const handleKakaoLogin = () => {
    signIn("kakao", {
      redirect: true,
      callbackUrl: CONTINUE_PATH,
    });
  };
  return (
    <Button
      type="button"
      onClick={handleKakaoLogin}
      className="h-14 w-full gap-3 rounded-[12px] border-transparent bg-[#fee500] text-[15px] font-semibold text-[#3a1d1d] shadow-none hover:bg-[#f5dc00]"
    >
      카카오로 로그인
    </Button>
  );
}

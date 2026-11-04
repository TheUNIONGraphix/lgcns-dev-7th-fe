"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function GoogleLoginButton({ callbackUrl }: { callbackUrl: string }) {
    const handleGoogleLogin = () => {
        signIn("google", {
            redirect: true,
            callbackUrl: callbackUrl || "/",
        });
    };
    return (
        <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="h-14 w-full gap-3 rounded-[12px] border-[#d1d5db] bg-white text-[15px] font-semibold text-[#374151] shadow-none hover:bg-[#f9fafb]"
        >
            <img src="/login/google-circle-x.svg" alt="" width={20} height={20} />
            구글로 로그인
        </Button>
    );
}

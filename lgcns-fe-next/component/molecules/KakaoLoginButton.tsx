"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function KakaoLoginButton({ callbackUrl }: { callbackUrl: string }) {
    const handleKakaoLogin = () => {
        signIn("kakao", {
            redirect: true,
            callbackUrl: callbackUrl || "/",
        });
    };
    return (
        <Button onClick={handleKakaoLogin} variant="outline" className="w-full py-4 py-4">
            kakao login
        </Button>
    );
}
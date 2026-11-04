"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function KakaoLoginButton() {
    const handleKakaoLogin = () => {
        signIn("kakao");
    };
    return (
        <Button onClick={handleKakaoLogin} variant="outline" className="w-full py-4 py-4">
            kakao login
        </Button>
    );
}
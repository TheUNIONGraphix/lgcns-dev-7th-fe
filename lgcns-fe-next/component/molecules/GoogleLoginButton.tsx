"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function GoogleLoginButton() {
    const handleGoogleLogin = () => {
        signIn("google", {
            redirect: true,
            callbackUrl: "/",
        });
    };
    return (
        <Button onClick={handleGoogleLogin} variant="outline" className="w-full py-4 py-4">
            google login
        </Button>
    );
}
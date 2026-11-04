"use client";

import { useAuth } from "@/component/providers/AuthProvider";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";

export default function LoginStatus() {
  const { isLoggedIn } = useAuth();
  const [isPending, startTransition] = useTransition();
  if (!isLoggedIn) return null;

  const handleLogout = async () => {
    startTransition(async () => {
      // TODO: 로그아웃 처리 api 호출
      await signOut({ callbackUrl: "/" });
    });
  };

  return (<Button onClick={handleLogout} disabled={isPending}>{isPending ? "로그아웃 중..." : "로그아웃"}</Button>);
}

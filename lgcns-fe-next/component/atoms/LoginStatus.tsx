"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/component/providers/AuthProvider";

export default function LoginStatus() {
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    const callbackUrl =
      pathname === "/login" || pathname === "/signup" ? "/" : pathname;
    return (
      <Button
        nativeButton={false}
        render={
          <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} />
        }
        className="shrink-0"
      >
        로그인
      </Button>
    );
  }

  const handleLogout = () => {
    startTransition(async () => {
      await signOut({ callbackUrl: "/" });
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={isPending}
      className="shrink-0"
    >
      {isPending ? "로그아웃 중..." : "로그아웃"}
    </Button>
  );
}

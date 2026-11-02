"use client";

import { useAuth } from "@/component/providers/AuthProvider";

export default function LoginStatus() {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return null;

  return <span>로그인됨</span>;
}

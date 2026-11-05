"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const REFRESH_INTERVAL_MS = 5000;

export default function PostLiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState !== "visible") return;
      router.refresh();
    };

    let timer = window.setInterval(refreshIfVisible, REFRESH_INTERVAL_MS);

    const onVisibilityChange = () => {
      window.clearInterval(timer);
      if (document.visibilityState !== "visible") return;
      refreshIfVisible();
      timer = window.setInterval(refreshIfVisible, REFRESH_INTERVAL_MS);
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [router]);

  return null;
}

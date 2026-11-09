"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const STREAM_URL = "/api/posts/stream";

export default function PostInsertStream() {
  const router = useRouter();

  useEffect(() => {
    let source: EventSource | null = null;

    const open = () => {
      if (source || document.visibilityState !== "visible") return;
      source = new EventSource(STREAM_URL);
      source.onmessage = (message) => {
        try {
          const value = JSON.parse(message.data) as { type?: unknown };
          if (value?.type === "insert") router.refresh();
        } catch {
          return;
        }
      };
    };

    const close = () => {
      source?.close();
      source = null;
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") open();
      else close();
    };

    open();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      close();
    };
  }, [router]);

  return null;
}

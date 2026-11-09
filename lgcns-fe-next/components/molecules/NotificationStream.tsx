"use client";

import { useEffect } from "react";
import type { NotificationStreamEvent } from "@/types/notification";

const STREAM_URL = "/api/notifications/stream";

function parseEvent(raw: string): NotificationStreamEvent | null {
  try {
    const value = JSON.parse(raw) as NotificationStreamEvent;
    if (!value || typeof value !== "object" || !("type" in value)) return null;
    return value;
  } catch {
    return null;
  }
}

export default function NotificationStream({
  enabled,
  onEvent,
}: {
  enabled: boolean;
  onEvent: (event: NotificationStreamEvent) => void;
}) {
  useEffect(() => {
    if (!enabled) return;

    let source: EventSource | null = null;

    const open = () => {
      if (source || document.visibilityState !== "visible") return;
      source = new EventSource(STREAM_URL);
      source.onmessage = (message) => {
        const event = parseEvent(message.data);
        if (event) onEvent(event);
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
  }, [enabled, onEvent]);

  return null;
}

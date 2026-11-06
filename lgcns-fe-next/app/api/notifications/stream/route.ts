import { connection } from "next/server";
import { readCurrentUser } from "@/lib/currentUser";
import { notificationService } from "@/service/notificationService";
import type { NotificationLiveEvent, NotificationStreamEvent } from "@/types/notification";

export async function GET(request: Request) {
  await connection();
  const user = await readCurrentUser();
  if (!user) return new Response(null, { status: 401 });

  const encoder = new TextEncoder();
  let unsubscribe = () => {};
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let closed = false;

  const cleanup = () => {
    if (closed) return;
    closed = true;
    if (heartbeat) clearInterval(heartbeat);
    unsubscribe();
  };

  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: NotificationStreamEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };
      controller.enqueue(encoder.encode("retry: 10000\n\n"));

      const pending: NotificationLiveEvent[] = [];
      let ready = false;
      unsubscribe = notificationService.subscribe(user.id, (event) => {
        if (!ready) {
          pending.push(event);
          return;
        }
        try {
          send(event);
        } catch {
          cleanup();
        }
      });

      try {
        await notificationService.whenReady();
        const snapshot = await notificationService.listForUser(user.id);
        send({ type: "snapshot", items: snapshot.items, unreadCount: snapshot.unreadCount });
        ready = true;
        for (const event of pending) send(event);
        heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(": ping\n\n"));
          } catch {
            cleanup();
          }
        }, 25000);
      } catch {
        cleanup();
        controller.error(new Error("알림 스트림을 시작하지 못했습니다."));
      }
    },
    cancel() {
      cleanup();
    },
  });

  request.signal.addEventListener("abort", cleanup);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

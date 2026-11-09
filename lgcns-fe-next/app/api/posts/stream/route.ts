import { revalidateTag } from "next/cache";
import { connection } from "next/server";
import { postWatch } from "@/service/postWatch";

export async function GET(request: Request) {
  await connection();

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
      const sendInsert = () => {
        controller.enqueue(encoder.encode('data: {"type":"insert"}\n\n'));
      };
      controller.enqueue(encoder.encode("retry: 10000\n\n"));

      const publish = () => {
        try {
          revalidateTag("posts", { expire: 0 });
        } catch {
          // 글을 만든 서버 액션이나 API가 이미 posts 태그를 갱신한다.
        }
        sendInsert();
      };

      let ready = false;
      let pending = false;
      unsubscribe = postWatch.subscribe(() => {
        if (!ready) {
          pending = true;
          return;
        }
        try {
          publish();
        } catch {
          cleanup();
        }
      });

      try {
        await postWatch.whenReady();
        ready = true;
        if (pending) {
          publish();
          pending = false;
        }
        heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(": ping\n\n"));
          } catch {
            cleanup();
          }
        }, 25000);
      } catch {
        cleanup();
        controller.error(new Error("글 스트림을 시작하지 못했습니다."));
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

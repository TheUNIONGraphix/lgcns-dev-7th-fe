"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/actions/notificationActions";
import { useAuth } from "@/component/providers/AuthProvider";
import NotificationToast from "../atoms/NotificationToast";
import NotificationItemRow from "../molecules/NotificationItem";

const POLL_MS = 5000;

type Snapshot = {
  items: NotificationItem[];
  unreadCount: number;
};

type Toast = {
  id: string;
  message: string;
  postId: string;
};

function messageOf(item: NotificationItem) {
  if (item.kind === "like") return `${item.actorName}님이 내 글에 좋아요를 눌렀습니다.`;
  return `${item.actorName}님이 내 글에 댓글을 남겼습니다.`;
}

export default function NotificationMenu() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<Snapshot>({ items: [], unreadCount: 0 });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [trackedLogin, setTrackedLogin] = useState(isLoggedIn);
  const seenRef = useRef<Set<string> | null>(null);

  if (trackedLogin !== isLoggedIn) {
    setTrackedLogin(isLoggedIn);
    setSnapshot({ items: [], unreadCount: 0 });
    setToasts([]);
    setOpen(false);
  }

  const apply = useCallback((next: Snapshot) => {
    setSnapshot(next);
    if (seenRef.current === null) {
      seenRef.current = new Set(next.items.map((item) => item.id));
      return;
    }
    const fresh = next.items.filter((item) => !item.read && !seenRef.current?.has(item.id));
    for (const item of next.items) seenRef.current.add(item.id);
    if (fresh.length === 0) return;
    setToasts((current) =>
      [
        ...fresh.map((item) => ({
          id: item.id,
          message: messageOf(item),
          postId: item.postId,
        })),
        ...current,
      ].slice(0, 3),
    );
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      seenRef.current = null;
      return;
    }

    let stopped = false;
    let timer = 0;

    const load = async () => {
      if (document.visibilityState !== "visible") return;
      const next = await listNotifications();
      if (!stopped) apply(next);
    };

    const arm = () => {
      window.clearInterval(timer);
      if (document.visibilityState !== "visible") return;
      timer = window.setInterval(() => {
        void load();
      }, POLL_MS);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") void load();
      arm();
    };

    void load();
    arm();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [apply, isLoggedIn]);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = window.setTimeout(() => {
      setToasts((current) => current.slice(0, -1));
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [toasts]);

  const markReadLocal = (id: string) => {
    setSnapshot((current) => {
      const target = current.items.find((item) => item.id === id);
      if (!target || target.read) return current;
      return {
        unreadCount: Math.max(0, current.unreadCount - 1),
        items: current.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
      };
    });
    seenRef.current?.add(id);
  };

  const openNotification = async (id: string, postId: string) => {
    const formData = new FormData();
    formData.set("notificationId", id);
    markReadLocal(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
    setOpen(false);
    await markNotificationRead(formData);
    router.push(`/postdetail/${postId}`);
  };

  const readAll = async () => {
    setSnapshot((current) => ({
      unreadCount: 0,
      items: current.items.map((item) => ({ ...item, read: true })),
    }));
    await markAllNotificationsRead();
  };

  if (!isLoggedIn) return null;

  const badge = snapshot.unreadCount > 9 ? "9+" : String(snapshot.unreadCount);

  return (
    <>
      <div className="relative">
        <button
          type="button"
          aria-expanded={open}
          aria-label={snapshot.unreadCount > 0 ? `알림 ${snapshot.unreadCount}개` : "알림"}
          onClick={() => setOpen((value) => !value)}
          className="relative rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground"
        >
          알림
          {snapshot.unreadCount > 0 ? (
            <span className="absolute -top-2 -right-2 inline-flex min-w-5 items-center justify-center rounded-full bg-[#2563eb] px-1 text-[11px] leading-5 font-semibold text-white">
              {badge}
            </span>
          ) : null}
        </button>
        {open ? (
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-border bg-card text-card-foreground shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-sm font-semibold">알림</span>
              <button
                type="button"
                onClick={() => void readAll()}
                className="text-xs font-medium text-[#2563eb]"
              >
                모두 읽음
              </button>
            </div>
            {snapshot.items.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">알림이 없습니다.</p>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {snapshot.items.map((item) => (
                  <li key={item.id} className="border-b border-border last:border-b-0">
                    <NotificationItemRow
                      message={messageOf(item)}
                      createdAt={item.createdAt}
                      read={item.read}
                      onOpen={() => void openNotification(item.id, item.postId)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
      <div className="fixed right-4 bottom-4 z-30 flex flex-col gap-2">
        {toasts.map((toast) => (
          <NotificationToast
            key={toast.id}
            message={toast.message}
            onOpen={() => void openNotification(toast.id, toast.postId)}
            onClose={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
          />
        ))}
      </div>
    </>
  );
}

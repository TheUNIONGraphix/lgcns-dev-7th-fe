"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import NotificationToast from "../atoms/NotificationToast";
import NotificationItemRow from "../molecules/NotificationItem";
import NotificationStream from "../molecules/NotificationStream";
import type { NotificationItem, NotificationSnapshot, NotificationStreamEvent } from "@/types/notification";

type MarkRead = (formData: FormData) => Promise<{ ok: boolean }>;
type MarkAll = () => Promise<{ ok: boolean }>;

const empty: NotificationSnapshot = { items: [], unreadCount: 0 };

function messageOf(item: NotificationItem) {
  if (item.kind === "like") return `${item.actorName}님이 내 글에 좋아요를 눌렀습니다.`;
  if (item.kind === "commentLike") return `${item.actorName}님이 내 댓글에 좋아요를 눌렀습니다.`;
  if (item.kind === "reply") return `${item.actorName}님이 내 댓글에 답글을 남겼습니다.`;
  return `${item.actorName}님이 내 글에 댓글을 남겼습니다.`;
}

export default function NotificationMenu({
  notifications,
  markRead,
  markAll,
}: {
  notifications: NotificationSnapshot | null;
  markRead: MarkRead;
  markAll: MarkAll;
}) {
  const { isLoggedIn } = useAuth();
  const [snapshot, setSnapshot] = useState<NotificationSnapshot>(notifications ?? empty);
  const [toasts, setToasts] = useState<{ id: string; message: string; postId: string }[]>([]);
  const [trackedLogin, setTrackedLogin] = useState(isLoggedIn);
  const menuRef = useRef<HTMLDetailsElement>(null);
  const seenRef = useRef<Set<string> | null>(null);
  const initialIds = useRef((notifications?.items ?? []).map((item) => item.id));

  if (trackedLogin !== isLoggedIn) {
    setTrackedLogin(isLoggedIn);
    setSnapshot(isLoggedIn ? (notifications ?? empty) : empty);
    setToasts([]);
  }

  useEffect(() => {
    if (!isLoggedIn) seenRef.current = null;
  }, [isLoggedIn]);

  const pushToasts = useCallback((items: NotificationItem[]) => {
    if (items.length === 0) return;
    setToasts((current) =>
      [
        ...items.map((item) => ({
          id: item.id,
          message: messageOf(item),
          postId: item.postId,
        })),
        ...current,
      ].slice(0, 3),
    );
  }, []);

  const markReadLocal = useCallback((id: string) => {
    setSnapshot((current) => {
      const target = current.items.find((item) => item.id === id);
      if (!target || target.read) return current;
      return {
        unreadCount: Math.max(0, current.unreadCount - 1),
        items: current.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
      };
    });
    seenRef.current?.add(id);
  }, []);

  const onEvent = useCallback(
    (event: NotificationStreamEvent) => {
      const seen = seenRef.current ?? new Set(initialIds.current);
      seenRef.current = seen;

      if (event.type === "snapshot") {
        setSnapshot({ items: event.items, unreadCount: event.unreadCount });
        const fresh = event.items.filter((item) => !item.read && !seen.has(item.id));
        for (const item of event.items) seen.add(item.id);
        pushToasts(fresh);
        return;
      }

      if (event.type === "insert") {
        setSnapshot((current) => {
          if (current.items.some((item) => item.id === event.item.id)) return current;
          return {
            unreadCount: event.item.read ? current.unreadCount : current.unreadCount + 1,
            items: [event.item, ...current.items].slice(0, 20),
          };
        });
        if (!event.item.read && !seen.has(event.item.id)) {
          seen.add(event.item.id);
          pushToasts([event.item]);
        }
        return;
      }

      if (event.type === "read") {
        markReadLocal(event.id);
        return;
      }

      setSnapshot((current) => {
        const target = current.items.find((item) => item.id === event.id);
        if (!target) return current;
        return {
          unreadCount: target.read ? current.unreadCount : Math.max(0, current.unreadCount - 1),
          items: current.items.filter((item) => item.id !== event.id),
        };
      });
    },
    [markReadLocal, pushToasts],
  );

  const openNotification = async (id: string, postId: string) => {
    const formData = new FormData();
    formData.set("notificationId", id);
    formData.set("postId", postId);
    markReadLocal(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
    if (menuRef.current) menuRef.current.open = false;
    await markRead(formData);
  };

  const readAll = async () => {
    setSnapshot((current) => ({
      unreadCount: 0,
      items: current.items.map((item) => ({ ...item, read: true })),
    }));
    await markAll();
  };

  if (!isLoggedIn || !notifications) return null;

  const badge = snapshot.unreadCount > 9 ? "9+" : String(snapshot.unreadCount);

  return (
    <>
      <NotificationStream enabled onEvent={onEvent} />
      <details ref={menuRef} className="relative">
        <summary
          aria-label={snapshot.unreadCount > 0 ? `알림 ${snapshot.unreadCount}개` : "알림"}
          className="relative inline-block cursor-pointer list-none rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden"
        >
          알림
          {snapshot.unreadCount > 0 ? (
            <span className="absolute -top-2 -right-2 inline-flex min-w-5 items-center justify-center rounded-full bg-[#2563eb] px-1 text-[11px] leading-5 font-semibold text-white">
              {badge}
            </span>
          ) : null}
        </summary>
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
      </details>
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

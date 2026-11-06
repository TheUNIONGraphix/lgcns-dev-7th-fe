"use server";

import { readCurrentUser } from "@/lib/currentUser";
import {
  notificationService,
  type NotificationItem,
} from "@/service/notificationService";

export type { NotificationItem };

const empty = { items: [] as NotificationItem[], unreadCount: 0 };

export async function listNotifications() {
  const user = await readCurrentUser();
  if (!user) return empty;
  return notificationService.listForUser(user.id);
}

export async function markNotificationRead(formData: FormData) {
  const user = await readCurrentUser();
  if (!user) return { ok: false as const };
  return notificationService.markRead({
    userId: user.id,
    notificationId: String(formData.get("notificationId") ?? ""),
  });
}

export async function markAllNotificationsRead() {
  const user = await readCurrentUser();
  if (!user) return { ok: false as const };
  return notificationService.markAllRead(user.id);
}

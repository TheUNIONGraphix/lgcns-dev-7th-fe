import { prisma } from "@/lib/prisma";
import { toNotificationItem } from "@/service/notificationItem";
import { notificationWatch } from "@/service/notificationWatch";
import type { NotificationLiveEvent, NotificationSnapshot } from "@/types/notification";

function isObjectId(value: string) {
  return /^[a-f\d]{24}$/i.test(value);
}

async function listForUser(userId: string): Promise<NotificationSnapshot> {
  const [rows, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.notification.count({
      where: { recipientId: userId, readAt: null },
    }),
  ]);
  return {
    items: rows.flatMap((row) => {
      const item = toNotificationItem(row);
      return item ? [item] : [];
    }),
    unreadCount
  };
}

async function markRead(input: { userId: string; notificationId: string }) {
  if (!isObjectId(input.notificationId)) return { ok: false as const };
  const row = await prisma.notification.findUnique({
    where: { id: input.notificationId },
    select: { recipientId: true, readAt: true },
  });
  if (!row || row.recipientId !== input.userId) return { ok: false as const };
  if (!row.readAt) {
    await prisma.notification.update({
      where: { id: input.notificationId },
      data: { readAt: new Date() },
    });
  }
  return { ok: true as const };
}

async function markAllRead(userId: string) {
  await prisma.notification.updateMany({
    where: { recipientId: userId, readAt: null },
    data: { readAt: new Date() },
  });
  return { ok: true as const };
}

function subscribe(recipientId: string, listener: (event: NotificationLiveEvent) => void) {
  return notificationWatch.subscribe(recipientId, listener);
}

function whenReady() {
  return notificationWatch.whenReady();
}

export const notificationService = {
  listForUser,
  markRead,
  markAllRead,
  subscribe,
  whenReady,
};

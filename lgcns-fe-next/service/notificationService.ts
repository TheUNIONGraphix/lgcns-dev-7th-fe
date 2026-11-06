import { prisma } from "@/lib/prisma";

export type NotificationItem = {
  id: string;
  kind: "like" | "comment";
  actorName: string;
  postId: string;
  read: boolean;
  createdAt: string;
};

function isObjectId(value: string) {
  return /^[a-f\d]{24}$/i.test(value);
}

function toItem(row: {
  id: string;
  kind: string;
  actorName: string;
  postId: string;
  readAt: Date | null;
  createdAt: Date;
}): NotificationItem | null {
  if (row.kind !== "like" && row.kind !== "comment") return null;
  return {
    id: row.id,
    kind: row.kind,
    actorName: row.actorName,
    postId: row.postId,
    read: row.readAt !== null,
    createdAt: row.createdAt.toISOString(),
  };
}

async function listForUser(userId: string) {
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
      const item = toItem(row);
      return item ? [item] : [];
    }),
    unreadCount,
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

export const notificationService = {
  listForUser,
  markRead,
  markAllRead,
};

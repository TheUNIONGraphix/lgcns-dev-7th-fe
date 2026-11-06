import type { NotificationItem } from "@/types/notification";

export function toNotificationItem(row: {
  id: string;
  kind: string;
  actorName: string;
  postId: string;
  readAt: Date | null;
  createdAt: Date;
}): NotificationItem | null {
  if (
    row.kind !== "like" &&
    row.kind !== "comment" &&
    row.kind !== "reply" &&
    row.kind !== "commentLike"
  ) {
    return null;
  }
  return {
    id: row.id,
    kind: row.kind,
    actorName: row.actorName,
    postId: row.postId,
    read: row.readAt !== null,
    createdAt: row.createdAt.toISOString(),
  };
}

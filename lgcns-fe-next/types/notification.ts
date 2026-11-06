export type NotificationItem = {
  id: string;
  kind: "like" | "comment" | "reply" | "commentLike";
  actorName: string;
  postId: string;
  read: boolean;
  createdAt: string;
};

export type NotificationSnapshot = {
  items: NotificationItem[];
  unreadCount: number;
};

export type NotificationLiveEvent =
  | { type: "insert"; item: NotificationItem }
  | { type: "read"; id: string }
  | { type: "delete"; id: string };

export type NotificationStreamEvent =
  | ({ type: "snapshot" } & NotificationSnapshot)
  | NotificationLiveEvent;

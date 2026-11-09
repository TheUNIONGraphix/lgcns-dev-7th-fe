function formatTime(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function NotificationItem({
  message,
  createdAt,
  read,
  onOpen,
}: {
  message: string;
  createdAt: string;
  read: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex w-full flex-col gap-1 px-3 py-2 text-left text-sm ${
        read ? "text-muted-foreground" : "text-card-foreground"
      }`}
    >
      <span>{message}</span>
      <time dateTime={createdAt} className="text-xs text-muted-foreground">
        {formatTime(createdAt)}
      </time>
    </button>
  );
}

export default function NotificationToast({
  message,
  onOpen,
  onClose,
}: {
  message: string;
  onOpen: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex w-72 items-start gap-2 rounded-xl border border-border bg-card p-3 text-sm text-card-foreground shadow-lg">
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        {message}
      </button>
      <button type="button" onClick={onClose} className="text-muted-foreground" aria-label="닫기">
        닫기
      </button>
    </div>
  );
}

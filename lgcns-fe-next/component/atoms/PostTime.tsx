function formatTime(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function PostTime({ iso }: { iso: string }) {
  return (
    <time dateTime={iso} className="text-sm text-[#6b7280]">
      {formatTime(iso)}
    </time>
  );
}

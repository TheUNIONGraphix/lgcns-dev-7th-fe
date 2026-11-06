export default function PostCommentCount({
  count,
  pressed,
  onClick,
}: {
  count: number;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={pressed}
      onClick={onClick}
      className={
        pressed
          ? "inline-flex h-9 items-center rounded-full bg-[#dbeafe] px-3 text-sm font-medium text-[#1d4ed8]"
          : "inline-flex h-9 items-center rounded-full bg-[#f3f4f6] px-3 text-sm font-medium text-[#4b5563] hover:bg-[#e5e7eb]"
      }
    >
      댓글 {count}
    </button>
  );
}

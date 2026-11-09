"use client";

import { useFormStatus } from "react-dom";

export default function LikeSubmit({
  count,
  liked,
  compact = false,
}: {
  count: number;
  liked: boolean;
  compact?: boolean;
}) {
  const { pending } = useFormStatus();
  const size = compact
    ? "h-8 rounded-full px-3 text-[13px]"
    : "h-9 rounded-full px-4 text-sm";

  return (
    <button
      type="submit"
      disabled={pending}
      aria-pressed={liked}
      className={
        liked
          ? `${size} border border-[#2563eb] bg-[#2563eb] font-semibold text-white disabled:opacity-70`
          : `${size} border border-[#e5e7eb] bg-[#f9fafb] font-medium text-[#374151] hover:bg-white disabled:opacity-70`
      }
    >
      좋아요 {count}
    </button>
  );
}

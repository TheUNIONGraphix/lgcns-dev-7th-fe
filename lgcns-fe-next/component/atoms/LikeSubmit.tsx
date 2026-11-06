"use client";

import { useFormStatus } from "react-dom";

export default function LikeSubmit({ count, liked }: { count: number; liked: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-pressed={liked}
      className={
        liked
          ? "rounded-lg border border-[#2563eb] bg-[#2563eb] px-3 py-1.5 font-medium text-white disabled:opacity-70"
          : "rounded-lg border border-[#d1d5db] bg-white px-3 py-1.5 font-medium text-[#111827] disabled:opacity-70"
      }
    >
      좋아요 {count}
    </button>
  );
}

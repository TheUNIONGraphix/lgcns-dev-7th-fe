import type { RefObject } from "react";
import { Button } from "@/components/ui/button";

export default function LoginRequiredDialog({
  dialogRef,
  messageRef,
  onLogin,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  messageRef: RefObject<HTMLParagraphElement | null>;
  onLogin: () => void;
}) {
  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-[min(calc(100%-2rem),24rem)] rounded-xl border border-[#e5e7eb] bg-white p-6 text-[#111827] shadow-lg backdrop:bg-black/40"
    >
      <h2 className="text-lg font-semibold">로그인이 필요해요</h2>
      <p ref={messageRef} className="mt-2 text-sm text-[#6b7280]">
        좋아요는 로그인 후 이용할 수 있어요.
      </p>
      <form method="dialog" className="mt-6 flex justify-end gap-2">
        <Button type="submit" variant="outline">
          취소
        </Button>
        <Button type="button" onClick={onLogin}>
          로그인
        </Button>
      </form>
    </dialog>
  );
}

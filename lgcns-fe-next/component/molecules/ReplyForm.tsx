"use client";

import { useRef } from "react";

export default function ReplyForm({
  postId,
  parentId,
  action,
  onBeforeSubmit,
}: {
  postId: string;
  parentId: string;
  action: (formData: FormData) => void | Promise<void>;
  onBeforeSubmit?: () => boolean;
}) {
  const toggleRef = useRef<HTMLInputElement>(null);
  const inputId = `reply-${parentId}`;

  const close = () => {
    if (toggleRef.current) toggleRef.current.checked = false;
  };

  const submit = async (formData: FormData) => {
    if (onBeforeSubmit && !onBeforeSubmit()) return;
    formData.set("returnTo", `${window.location.pathname}${window.location.search}`);
    await action(formData);
    close();
  };

  return (
    <div className="group/reply has-[:checked]:basis-full">
      <input ref={toggleRef} id={inputId} type="checkbox" className="sr-only" />
      <label
        htmlFor={inputId}
        onClick={(event) => {
          if (onBeforeSubmit && !onBeforeSubmit()) event.preventDefault();
        }}
        className="cursor-pointer text-[13px] font-medium text-[#2563eb] group-has-[:checked]/reply:hidden hover:underline"
      >
        답글
      </label>
      <form action={submit} className="mt-2 hidden gap-2 group-has-[:checked]/reply:flex">
        <input type="hidden" name="postId" value={postId} />
        <input type="hidden" name="parentId" value={parentId} />
        <input
          name="body"
          required
          maxLength={300}
          placeholder="답글"
          className="h-9 min-w-0 flex-1 rounded-full border border-[#e5e7eb] bg-white px-3 text-[13px] text-[#111827] outline-none placeholder:text-[#9ca3af] focus:border-[#2563eb]"
        />
        <button
          type="submit"
          className="h-9 rounded-full bg-[#2563eb] px-4 text-[13px] font-semibold text-white hover:bg-[#1d4ed8]"
        >
          등록
        </button>
        <button
          type="button"
          onClick={close}
          className="h-9 rounded-full border border-[#e5e7eb] bg-white px-3 text-[13px] font-medium text-[#374151]"
        >
          취소
        </button>
      </form>
    </div>
  );
}

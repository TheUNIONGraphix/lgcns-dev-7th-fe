"use client";

export default function PostCommentForm({
  postId,
  action,
}: {
  postId: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const submit = (formData: FormData) => {
    formData.set("returnTo", `${window.location.pathname}${window.location.search}`);
    return action(formData);
  };

  return (
    <form action={submit} className="flex gap-2">
      <input type="hidden" name="postId" value={postId} />
      <input
        name="body"
        required
        maxLength={300}
        placeholder="댓글을 남겨 보세요"
        className="h-11 min-w-0 flex-1 rounded-full border border-[#e5e7eb] bg-white px-4 text-sm text-[#111827] outline-none placeholder:text-[#9ca3af] focus:border-[#2563eb]"
      />
      <button
        type="submit"
        className="h-11 rounded-full bg-[#2563eb] px-5 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
      >
        등록
      </button>
    </form>
  );
}

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
        placeholder="댓글"
        className="h-10 min-w-0 flex-1 rounded-lg border border-[#d1d5db] bg-white px-3 text-sm text-[#111827] outline-none placeholder:text-[#9ca3af] focus:border-[#2563eb]"
      />
      <button
        type="submit"
        className="h-10 rounded-lg bg-[#111827] px-3 text-sm font-semibold text-white"
      >
        등록
      </button>
    </form>
  );
}

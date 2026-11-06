"use client";

export default function PostDeleteForm({
  postId,
  action,
}: {
  postId: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form
      action={(formData) => {
        formData.set("returnTo", `${window.location.pathname}${window.location.search}`);
        return action(formData);
      }}
      onSubmit={(event) => {
        if (!window.confirm("이 글을 삭제할까요?")) event.preventDefault();
      }}
    >
      <input type="hidden" name="postId" value={postId} />
      <button type="submit" className="font-medium text-red-600 hover:underline">
        삭제
      </button>
    </form>
  );
}

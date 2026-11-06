import PostAuthorName from "../atoms/PostAuthorName";

export default function PostCommentItem({
  authorName,
  body,
}: {
  authorName: string;
  body: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <PostAuthorName name={authorName} />
      <p className="whitespace-pre-wrap text-sm leading-6 text-[#374151]">{body}</p>
    </div>
  );
}

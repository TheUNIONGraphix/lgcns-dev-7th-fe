import PostAuthorName from "../atoms/PostAuthorName";

export default function PostCommentItem({
  authorName,
  body,
}: {
  authorName: string;
  body: string;
}) {
  return (
    <li className="text-sm text-[#111827]">
      <PostAuthorName name={authorName} />
      <span className="ml-2">{body}</span>
    </li>
  );
}

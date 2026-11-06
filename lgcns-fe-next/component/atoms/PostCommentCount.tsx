export default function PostCommentCount({
  count,
  htmlFor,
}: {
  count: number;
  htmlFor: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="inline-flex h-9 cursor-pointer items-center rounded-full bg-[#f3f4f6] px-3 text-sm font-medium text-[#4b5563] group-has-[.comments-toggle:checked]/comments:bg-[#dbeafe] group-has-[.comments-toggle:checked]/comments:text-[#1d4ed8]"
    >
      댓글 {count}
    </label>
  );
}

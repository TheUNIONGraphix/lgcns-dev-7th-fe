import PostAuthorName from "../atoms/PostAuthorName";
import PostTime from "../atoms/PostTime";

export default function PostMeta({ authorName, createdAt }: { authorName: string; createdAt: string }) {
  return (
    <header className="flex items-baseline justify-between gap-3 text-sm text-[#6b7280]">
      <PostAuthorName name={authorName} />
      <PostTime iso={createdAt} />
    </header>
  );
}

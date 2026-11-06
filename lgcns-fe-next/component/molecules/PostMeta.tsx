import { Header } from "@/components/ui/landmark";
import PostAuthorName from "../atoms/PostAuthorName";
import PostTime from "../atoms/PostTime";

function initial(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.slice(0, 1) : "?";
}

export default function PostMeta({ authorName, createdAt }: { authorName: string; createdAt: string }) {
  return (
    <Header className="flex items-center gap-3">
      <span
        aria-hidden
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-sm font-semibold text-[#1d4ed8]"
      >
        {initial(authorName)}
      </span>
      <div className="flex min-w-0 flex-col">
        <PostAuthorName name={authorName} />
        <PostTime iso={createdAt} />
      </div>
    </Header>
  );
}

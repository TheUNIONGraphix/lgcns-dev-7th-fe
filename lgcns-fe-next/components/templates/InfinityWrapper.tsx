import PostInfinityScrollList from "@/components/organisms/PostInfinityScrollList";
import type { PostListShellProps } from "@/components/organisms/postListShell";

export default function PostInfinityWrapper(props: PostListShellProps) {
  return <PostInfinityScrollList {...props} />;
}

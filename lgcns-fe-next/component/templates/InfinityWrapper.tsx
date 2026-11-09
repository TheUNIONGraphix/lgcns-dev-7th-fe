import PostInfinityScrollList from "@/component/organisms/PostInfinityScrollList";
import type { PostListShellProps } from "@/component/organisms/postListShell";

export default function PostInfinityWrapper(props: PostListShellProps) {
  return <PostInfinityScrollList {...props} />;
}

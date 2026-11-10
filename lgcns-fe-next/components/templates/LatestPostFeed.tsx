import Link from "next/link";
import { Header, Section } from "@/components/ui/landmark";
import type { PostItem } from "@/lib/postCache";
import PostCard from "../organisms/PostCard";
import CustomFlexWrapper from "../atoms/CustomFlexWrapper";
import CustomLi from "../atoms/CustomLi";
import CustomParagraph from "../atoms/CustomParagraph";
import CustomUl from "../atoms/CustomUl";
import CustomTitle from "../atoms/CustomTitle";

export default function LatestPostFeed({
  posts,
  likedPostIds,
  likedCommentIds,
  viewerId,
}: {
  posts: PostItem[];
  likedPostIds: string[];
  likedCommentIds: string[];
  viewerId: string | null;
}) {
  const liked = new Set(likedPostIds);

  return (
    <Section>
      <CustomFlexWrapper direction="col" className="mx-auto w-full max-w-3xl gap-6">
        <Header className="flex items-end justify-between gap-4">
          <CustomFlexWrapper direction="col">
            <CustomTitle TitleType="h2" className="!font-sans text-[28px] leading-[normal] font-bold text-[#111827]">
              최신 글
            </CustomTitle>
            <CustomParagraph>최근에 올라온 글을 피드에서 확인해 보세요</CustomParagraph>
          </CustomFlexWrapper>
          <Link href="/posts" className="text-[14px] font-semibold text-[#2563eb]">
            전체 보기
          </Link>
        </Header>
        {posts.length === 0 ? (
          <CustomParagraph>아직 글이 없습니다.</CustomParagraph>
        ) : (
          <CustomUl>
            {posts.map((post) => (
              <CustomLi key={post.id}>
                <PostCard
                  post={post}
                  liked={liked.has(post.id)}
                  likedCommentIds={likedCommentIds}
                  canManage={post.authorId === viewerId}
                />
              </CustomLi>
            ))}
          </CustomUl>
        )}
      </CustomFlexWrapper>
    </Section>
  );
}

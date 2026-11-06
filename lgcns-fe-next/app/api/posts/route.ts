import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { commentIdsOf, getCachedPosts, normalizePostKeyword } from "@/lib/postCache";
import { postCorsHeaders, userFromRequest } from "@/lib/postApi";
import { postService } from "@/service/postService";

function readPage(value: string | null) {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) return 1;
  return page;
}

function readSort(value: string | null): "ASC" | "DESC" {
  return value === "ASC" ? "ASC" : "DESC";
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: postCorsHeaders });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const data = await getCachedPosts(
    readPage(url.searchParams.get("page")),
    readSort(url.searchParams.get("sort")),
    normalizePostKeyword(url.searchParams.get("q") ?? ""),
  );
  const user = await userFromRequest(request);
  const [likedPostIds, likedCommentIds] = user
    ? await Promise.all([
        postService.findLikedPostIds({
          userId: user.id,
          postIds: data.posts.map((post) => post.id),
        }),
        postService.findLikedCommentIds({
          userId: user.id,
          commentIds: commentIdsOf(data.posts),
        }),
      ])
    : [[], []];
  return NextResponse.json(
    {
      success: true,
      data: { ...data, viewerId: user?.id ?? null, likedPostIds, likedCommentIds },
    },
    { headers: postCorsHeaders },
  );
}

export async function POST(request: Request) {
  const user = await userFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "로그인이 필요합니다." },
      { status: 401, headers: postCorsHeaders },
    );
  }
  const body = (await request.json().catch(() => null)) as { body?: unknown } | null;
  const result = await postService.createPost({
    authorId: user.id,
    authorName: user.name,
    body: String(body?.body ?? ""),
  });
  if (!result.ok) {
    return NextResponse.json(
      { success: false, message: "글을 저장하지 못했습니다." },
      { status: 400, headers: postCorsHeaders },
    );
  }
  revalidateTag("posts", { expire: 0 });
  return NextResponse.json(
    { success: true, data: { id: result.id } },
    { headers: postCorsHeaders },
  );
}

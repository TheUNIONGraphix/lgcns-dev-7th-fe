import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getCachedPost } from "@/lib/postCache";
import { postCorsHeaders, userFromRequest } from "@/lib/postApi";
import { postService } from "@/service/postService";

type Context = { params: Promise<{ postId: string }> };

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: postCorsHeaders });
}

export async function GET(request: Request, { params }: Context) {
  const { postId } = await params;
  const post = await getCachedPost(postId);
  if (!post) {
    return NextResponse.json(
      { success: false, message: "글을 찾을 수 없습니다." },
      { status: 404, headers: postCorsHeaders },
    );
  }
  const user = await userFromRequest(request);
  const likedPostIds = user
    ? await postService.findLikedPostIds({ userId: user.id, postIds: [post.id] })
    : [];
  return NextResponse.json(
    {
      success: true,
      data: {
        post,
        liked: likedPostIds.includes(post.id),
        canManage: post.authorId === user?.id,
      },
    },
    { headers: postCorsHeaders },
  );
}

export async function PATCH(request: Request, { params }: Context) {
  const user = await userFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "로그인이 필요합니다." },
      { status: 401, headers: postCorsHeaders },
    );
  }
  const { postId } = await params;
  const body = (await request.json().catch(() => null)) as { body?: unknown } | null;
  const result = await postService.updatePost({
    postId,
    authorId: user.id,
    body: String(body?.body ?? ""),
  });
  if (!result.ok) {
    return NextResponse.json(
      { success: false, message: "글을 수정하지 못했습니다." },
      { status: result.reason === "forbidden" ? 403 : 400, headers: postCorsHeaders },
    );
  }
  revalidateTag("posts", { expire: 0 });
  return NextResponse.json({ success: true }, { headers: postCorsHeaders });
}

export async function DELETE(request: Request, { params }: Context) {
  const user = await userFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "로그인이 필요합니다." },
      { status: 401, headers: postCorsHeaders },
    );
  }
  const { postId } = await params;
  const result = await postService.deletePost({ postId, authorId: user.id });
  if (!result.ok) {
    return NextResponse.json(
      { success: false, message: "글을 삭제하지 못했습니다." },
      { status: result.reason === "forbidden" ? 403 : 400, headers: postCorsHeaders },
    );
  }
  revalidateTag("posts", { expire: 0 });
  return NextResponse.json({ success: true }, { headers: postCorsHeaders });
}

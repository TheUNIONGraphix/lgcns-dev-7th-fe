import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { postCorsHeaders, userFromRequest } from "@/lib/postApi";
import { postService } from "@/service/postService";

type Context = { params: Promise<{ postId: string; commentId: string }> };

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: postCorsHeaders });
}

export async function POST(request: Request, { params }: Context) {
  const user = await userFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "로그인이 필요합니다." },
      { status: 401, headers: postCorsHeaders },
    );
  }
  const { commentId } = await params;
  const result = await postService.toggleCommentLike({
    commentId,
    userId: user.id,
    actorName: user.name,
  });
  if (!result.ok) {
    return NextResponse.json(
      { success: false, message: "댓글 좋아요를 처리하지 못했습니다." },
      { status: result.reason === "missing" ? 404 : 400, headers: postCorsHeaders },
    );
  }
  revalidateTag("posts", { expire: 0 });
  return NextResponse.json({ success: true }, { headers: postCorsHeaders });
}

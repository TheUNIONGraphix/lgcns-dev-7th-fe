import type { PostListResponseType } from "@/types/response/ResponseType";

export type PostListShellProps = {
  posts: PostListResponseType;
  pageNumber: number;
  sortOrder: "ASC" | "DESC";
  keyword: string;
};

import type { PostItem } from "@/service/postService";

export interface ResponseType<T> {
  data: T;
  error: string | null;
  success: boolean;
}

export interface PostListResponseType {
  posts: PostItem[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

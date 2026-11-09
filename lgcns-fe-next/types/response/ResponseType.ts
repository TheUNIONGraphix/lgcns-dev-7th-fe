export interface ResponseType<T> {
  data: T;
  error: string | null;
  success: boolean;
}


export type CommentRow = {
  id: string;
  postId: string;
  parentId: string | null;
  authorName: string;
  body: string;
  createdAt: Date;
};

export type CommentReply = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
  likeCount: number;
};

export type CommentItem = CommentReply & {
  replies: CommentReply[];
};

export interface PostListResponseType {
  posts: PostItem[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type PostItem = {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  comments: CommentItem[];
};
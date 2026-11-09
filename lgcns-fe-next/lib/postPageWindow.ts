import type { PostItem, PostListResponseType } from "@/types/response/ResponseType";

export type PostPageGroup = {
  page: number;
  posts: PostItem[];
};

export type PostPageWindow = {
  queryKey: string;
  loadedKey: string;
  groups: PostPageGroup[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalPages: number;
  anchorPage: number;
};

function idsKey(posts: PostItem[]) {
  return posts.map((post) => post.id).join("\n");
}

export function postQueryKey(sortOrder: "ASC" | "DESC", keyword: string) {
  return `${sortOrder}:${keyword}`;
}

function singlePage(
  posts: PostListResponseType,
  pageNumber: number,
  queryKey: string,
): PostPageWindow {
  return {
    queryKey,
    loadedKey: `${pageNumber}:${idsKey(posts.posts)}`,
    groups: [{ page: pageNumber, posts: posts.posts }],
    hasNextPage: posts.hasNextPage,
    hasPreviousPage: posts.hasPreviousPage,
    totalPages: posts.totalPages,
    anchorPage: pageNumber,
  };
}

export function createPostPageWindow(
  posts: PostListResponseType,
  pageNumber: number,
  sortOrder: "ASC" | "DESC",
  keyword: string,
): PostPageWindow {
  return singlePage(posts, pageNumber, postQueryKey(sortOrder, keyword));
}

export function reducePostPageWindow(
  current: PostPageWindow,
  posts: PostListResponseType,
  pageNumber: number,
  sortOrder: "ASC" | "DESC",
  keyword: string,
): PostPageWindow {
  const queryKey = postQueryKey(sortOrder, keyword);
  const loadedKey = `${pageNumber}:${idsKey(posts.posts)}`;
  if (queryKey === current.queryKey && loadedKey === current.loadedKey) return current;
  if (queryKey !== current.queryKey) return singlePage(posts, pageNumber, queryKey);

  const firstPage = current.groups[0]?.page ?? pageNumber;
  const lastPage = current.groups[current.groups.length - 1]?.page ?? pageNumber;
  const base = { queryKey, loadedKey, totalPages: posts.totalPages };

  if (current.groups.some((group) => group.page === pageNumber)) {
    return {
      ...current,
      ...base,
      groups: current.groups.map((group) =>
        group.page === pageNumber ? { page: pageNumber, posts: posts.posts } : group,
      ),
      hasPreviousPage: pageNumber === firstPage ? posts.hasPreviousPage : current.hasPreviousPage,
      hasNextPage: pageNumber === lastPage ? posts.hasNextPage : current.hasNextPage,
    };
  }

  if (pageNumber === lastPage + 1) {
    return {
      ...current,
      ...base,
      groups: [...current.groups, { page: pageNumber, posts: posts.posts }],
      hasNextPage: posts.hasNextPage,
    };
  }

  if (pageNumber === firstPage - 1) {
    return {
      ...current,
      ...base,
      groups: [{ page: pageNumber, posts: posts.posts }, ...current.groups],
      hasPreviousPage: posts.hasPreviousPage,
    };
  }

  return singlePage(posts, pageNumber, queryKey);
}

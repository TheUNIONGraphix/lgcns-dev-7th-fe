export function postsListHref(
  page: number,
  sortOrder: "ASC" | "DESC",
  keyword: string,
) {
  const params = new URLSearchParams({
    page: String(page),
    sort: sortOrder,
  });
  if (keyword) params.set("q", keyword);
  return `/posts?${params.toString()}`;
}

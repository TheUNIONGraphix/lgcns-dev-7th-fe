import FeedNextButton from "@/component/molecules/FeedNextButton"

export default async function FeedContent({
  searchParams,
}: {
  searchParams: Promise<{
    page: string
    limit: string
    sort: string
    search: string
  }>
}) {
  const { page, limit, sort, search } = await searchParams

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1>Feed Page</h1>
      <p>page: {page}</p>
      <p>limit: {limit}</p>
      <p>sort: {sort}</p>
      <p>search: {search}</p>
      <FeedNextButton page={page} limit={limit} sort={sort} search={search} />
    </div>
  )
}

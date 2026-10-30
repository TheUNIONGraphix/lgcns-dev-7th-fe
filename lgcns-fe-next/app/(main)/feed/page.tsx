import { Suspense } from "react"
import FeedContent from "@/component/templates/FeedContent"

export default function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{
    page: string
    limit: string
    sort: string
    search: string
  }>
}) {

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <FeedContent searchParams={searchParams} />
    </Suspense>
  )
}

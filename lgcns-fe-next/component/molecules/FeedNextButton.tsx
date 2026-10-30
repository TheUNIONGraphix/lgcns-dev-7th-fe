"use client"
import { useRouter } from "next/navigation"

export default function FeedNextButton({
  page,
  limit,
  sort,
  search,
}: {
  page: string
  limit: string
  sort: string
  search: string
}) {
  const router = useRouter()

  return (
    <button
      onClick={() => {
        router.push(
          `/feed?page=${parseInt(page) + 1}&limit=${limit}&sort=${sort}&search=${search}`
        )
      }}
    >
      Next
    </button>
  )
}

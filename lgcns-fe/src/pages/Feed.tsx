import { useNavigate, useSearchParams } from "react-router-dom";

function Feed() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const page = params.get("page") ?? "";
  const limit = params.get("limit") ?? "";
  const sort = params.get("sort") ?? "";
  const search = params.get("search") ?? "";

  return (
    <div className="flex flex-col gap-4 p-4 text-left">
      <h1 className="text-2xl font-bold text-[#111827]">Feed Page</h1>
      <p>page: {page}</p>
      <p>limit: {limit}</p>
      <p>sort: {sort}</p>
      <p>search: {search}</p>
      <button
        type="button"
        className="w-fit rounded-lg border border-[#d1d5db] px-4 py-2"
        onClick={() => {
          const next = new URLSearchParams({
            page: String(parseInt(page) + 1),
            limit,
            sort,
            search,
          });
          navigate(`/feed?${next.toString()}`);
        }}
      >
        Next
      </button>
    </div>
  );
}

export default Feed;

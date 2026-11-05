import { useParams } from "react-router-dom";

function Blog() {
  const { blogId } = useParams();
  return (
    <div className="flex flex-col gap-2 p-4 text-left">
      <h1 className="text-2xl font-bold text-[#111827]">Blog Page</h1>
      <p>{blogId}</p>
    </div>
  );
}

export default Blog;

import { Suspense } from "react";
import BlogContent from "@/components/templates/BlogContent";

export default function BlogPage({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <BlogContent params={params} />
    </Suspense>
  );
}

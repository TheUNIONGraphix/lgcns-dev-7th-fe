export default async function BlogContent({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) {
  const { blogId } = await params;
  return (
    <div>
      <h1>Blog Page</h1>
      <p>{blogId}</p>
    </div>
  );
}

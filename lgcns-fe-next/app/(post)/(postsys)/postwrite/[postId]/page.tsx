import { Suspense } from "react";
import { redirect } from "next/navigation";

async function RedirectToQuery({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  redirect(`/postwrite?postId=${encodeURIComponent(postId)}`);
}

export default function LegacyPostWritePage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <RedirectToQuery params={params} />
    </Suspense>
  );
}

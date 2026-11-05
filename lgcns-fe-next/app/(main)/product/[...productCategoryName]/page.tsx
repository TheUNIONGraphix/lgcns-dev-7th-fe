import { Suspense } from "react";
import ProductContent from "@/component/templates/ProductContent";

export default function ProductPage({
  params,
}: {
  params: Promise<{ productCategoryName: string[] }>;
}) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ProductContent params={params} />
    </Suspense>
  );
}

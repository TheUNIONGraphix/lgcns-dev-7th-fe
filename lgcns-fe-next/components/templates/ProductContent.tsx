import CustomTitle from "@/components/atoms/CustomTitle";

export default async function ProductContent({
  params,
}: {
  params: Promise<{ productCategoryName: string[] }>;
}) {
  const { productCategoryName } = await params;
  console.log(productCategoryName.join("/"));
  return (
    <div>
      <CustomTitle TitleType="h1" className="text-2xl font-bold">
        {productCategoryName.join("/")}
      </CustomTitle>
      <p>{productCategoryName}</p>
    </div>
  );
}

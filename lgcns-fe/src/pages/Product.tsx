import { useParams } from "react-router-dom";

function Product() {
  const params = useParams();
  const productCategoryName = (params["*"] ?? "").split("/").filter(Boolean);
  return (
    <div className="flex flex-col gap-2 p-4 text-left">
      <h1 className="text-2xl font-bold text-[#111827]">
        {productCategoryName.join("/")}
      </h1>
      <p>{productCategoryName}</p>
    </div>
  );
}

export default Product;

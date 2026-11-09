import type { ReactNode } from "react";
import type { PostItem } from "@/types/response/ResponseType";

export default function PostPaginataionWrapper({
  children,
}: {
  children: ReactNode;
  data: PostItem[];
}) {
  return children;
}

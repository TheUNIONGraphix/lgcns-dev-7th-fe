"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const className =
  "inline-flex h-14 items-center justify-center rounded-[12px] bg-[#2563eb] px-5 text-[16px] font-semibold text-white shadow-[0px_4px_6px_rgba(37,99,235,0.2)] hover:bg-[#1d4ed8]";

export default function PostComposeLink() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  params.set("compose", "new");

  return (
    <Link href={`/posts?${params.toString()}`} className={className}>
      글쓰기
    </Link>
  );
}

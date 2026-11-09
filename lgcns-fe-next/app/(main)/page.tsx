import { Suspense } from "react";
import { Main } from "@/components/ui/landmark";
import HeroSection from "@/components/templates/HeroSection";
import HomePosts from "@/app/(main)/HomePosts";

export default function Home() {
  return (
    <Main>
      <HeroSection />
      <Suspense
        fallback={
          <p className="px-4 py-10 text-[14px] text-[#6b7280]">최신 글을 불러오는 중...</p>
        }
      >
        <HomePosts />
      </Suspense>
    </Main>
  );
}

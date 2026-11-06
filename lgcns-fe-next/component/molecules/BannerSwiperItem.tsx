import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CustomTitle from "../atoms/CustomTitle";

export default function BannerSwiperItem({
  priority = false,
}: {
  priority?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-[24px] bg-[#111827]">
      <Image
        src="https://i.pinimg.com/1200x/49/9b/65/499b651238e31591d4f0f15bd36042bf.jpg"
        alt="cat banner"
        width={1200}
        height={640}
        priority={priority}
        className="h-[280px] w-full object-cover sm:h-[380px]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-8">
        <CustomTitle TitleType="h3" className="!font-sans text-left text-[28px] text-white">
          Cat Banner Title
        </CustomTitle>
        <p className="text-[14px] text-white/80">Cat Banner Description</p>
        <Button
          nativeButton={false}
          render={<Link href="/posts" />}
          variant="default"
          size="lg"
          className="h-12 rounded-[12px] bg-[#2563eb] px-5 text-[16px] font-semibold text-white hover:bg-[#1d4ed8]"
        >
          View More
        </Button>
      </div>
    </div>
  );
}

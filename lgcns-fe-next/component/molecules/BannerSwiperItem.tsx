import Image from "next/image";
import CustomTitle from "../atoms/CustomTitle";
import { Button } from "@/components/ui/button";

export default function BannerSwiperItem() {
  return (
    <div id="swiper-item">
      <Image
        src={
          "https://i.pinimg.com/1200x/49/9b/65/499b651238e31591d4f0f15bd36042bf.jpg"
        }
        alt="cat banner"
        width={1000}
        height={1000}
      />
      <CustomTitle TitleType="h3" className="text-red-500">
        Cat Banner Title
      </CustomTitle>
      <p>Cat Banner Description</p>
      <Button variant="default" size="lg" className="customBtton-lgcns">
        View More
      </Button>
    </div>
  );
}

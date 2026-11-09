"use client";

import { useEffect, useState } from "react";
import BannerSwiperItem from "../molecules/BannerSwiperItem";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@/components/ui/carousel";

const slides = [0, 1, 2];

function BannerSwipeDots() {
  const { api } = useCarousel();
  const [selected, setSelected] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    const update = () => {
      setCount(api.scrollSnapList().length);
      setSelected(api.selectedScrollSnap());
    };
    update();
    api.on("select", update);
    api.on("reInit", update);
    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);

  return (
    <div className="mt-3 flex items-center justify-center gap-2">
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`${index + 1}번 배너`}
          aria-current={index === selected ? "true" : undefined}
          onClick={() => api?.scrollTo(index)}
          className={
            index === selected
              ? "size-2.5 rounded-full bg-[#2563eb]"
              : "size-2.5 rounded-full bg-[#d1d5db]"
          }
        />
      ))}
    </div>
  );
}

export default function HeroSwiperBanner() {
  return (
    <Carousel opts={{ loop: true, align: "start" }} aria-label="메인 배너">
      <div className="relative">
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide}>
              <BannerSwiperItem priority={slide === 0} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          className="left-3 size-10 border-[#e5e7eb] bg-white text-[#111827]"
          aria-label="이전 배너"
        />
        <CarouselNext
          className="right-3 size-10 border-[#e5e7eb] bg-white text-[#111827]"
          aria-label="다음 배너"
        />
      </div>
      <BannerSwipeDots />
    </Carousel>
  );
}

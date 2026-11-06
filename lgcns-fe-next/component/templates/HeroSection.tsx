import { Section } from "@/components/ui/landmark";
import ContainerWrapper from "../atoms/ContainerWrapper";
import HeroSwiperBanner from "../organisms/HeroSwiperBanner";

export default function HeroSection() {
  return (
    <Section className="px-4 pt-10">
      <ContainerWrapper>
        <HeroSwiperBanner />
      </ContainerWrapper>
    </Section>
  );
}

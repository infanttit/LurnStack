import CategoriesSection from "../sections/landing/CategoriesSection";
import SliderSection from "../sections/landing/SliderSection";
import CtaSection from "../sections/landing/CtaSection";
import HeroSection from "../sections/landing/HeroSection";
import LearningAppSection from "../sections/landing/LearningAppSection";
import PassionCategoriesSection from "../sections/landing/PassionCategoriesSection";
import WhyChooseSection from "../sections/landing/WhyChooseSection";
import { useAuth } from "../auth";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <main>
      <HeroSection />
      {!isAuthenticated ? <WhyChooseSection /> : null}
      {!isAuthenticated ? <LearningAppSection /> : null}
      {!isAuthenticated ? <PassionCategoriesSection /> : null}
      {isAuthenticated ? <CategoriesSection /> : null}
      <SliderSection />
      <CtaSection />
    </main>
  );
}

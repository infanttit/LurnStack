import CategoriesSection from "../sections/landing/CategoriesSection";
import SliderSection from "../sections/landing/SliderSection";
import CtaSection from "../sections/landing/CtaSection";
import HeroSection from "../sections/landing/HeroSection";
import LearningAppSection from "../sections/landing/LearningAppSection";
import PassionCategoriesSection from "../sections/landing/PassionCategoriesSection";
import WhyChooseSection from "../sections/landing/WhyChooseSection";
import { useAuth } from "../auth";
import { useSEO } from "../shared/hooks/useSEO";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  useSEO({
    title: "Home",
    description: "LurnStack — Live trainer-led masterclasses for web development, database, cloud, and UI/UX. Start learning with expert trainers today.",
    keywords: "LurnStack, online learning, live classes, web development, database, cloud, UI/UX, EdTech",
    canonical: "/",
  });

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

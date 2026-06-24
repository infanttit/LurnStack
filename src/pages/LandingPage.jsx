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
    title: "LearnStack – Online Learning Platform | IT Courses, Certification & Career Training",
    description: "LearnStack is an online learning platform where expert trainers offer industry-ready IT and professional courses. Learn SQL, Python, Azure, AWS, DevOps, Power BI, Data Analytics and more with certificates and career support.",
    keywords: "LearnStack, LurnStack, online learning platform, IT courses, SQL training, Python online course, Azure certification, AWS training, DevOps course, Power BI course, Data Analytics course, certification, career training",
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

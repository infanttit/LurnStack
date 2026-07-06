import CategoriesSection from "../sections/landing/CategoriesSection";
import SliderSection from "../sections/landing/SliderSection";
import CtaSection from "../sections/landing/CtaSection";
import HeroSection, { UpcomingSessionsTicker } from "../sections/landing/HeroSection";
import LearningAppSection from "../sections/landing/LearningAppSection";
import PassionCategoriesSection from "../sections/landing/PassionCategoriesSection";
import WhyChooseSection from "../sections/landing/WhyChooseSection";
import HeroPromoCarousel from "../sections/landing/HeroPromoCarousel";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth";
import { useSEO } from "../shared/hooks/useSEO";
import { PATHS } from "../app/router/paths";

export default function LandingPage() {
  const { isAuthenticated, bootstrapped } = useAuth();

  useSEO({
    title: "LearnStack – Online Learning Platform | IT Courses, Certification & Career Training",
    description: "LearnStack is an online learning platform where expert trainers offer industry-ready IT and professional courses. Learn SQL, Python, Azure, AWS, DevOps, Power BI, Data Analytics and more with certificates and career support.",
    keywords: "LearnStack, LurnStack, online learning platform, IT courses, SQL training, Python online course, Azure certification, AWS training, DevOps course, Power BI course, Data Analytics course, certification, career training",
    canonical: "/",
  });

  if (!bootstrapped) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm font-semibold text-slate-500">
        Loading your session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={PATHS.LOGIN} replace />;
  }

  return (
    <main>
      <UpcomingSessionsTicker />
      <HeroPromoCarousel />
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

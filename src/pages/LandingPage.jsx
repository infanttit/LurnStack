import CategoriesSection from "../sections/landing/CategoriesSection";
import SliderSection from "../sections/landing/SliderSection";
import CtaSection from "../sections/landing/CtaSection";
import FeaturedCoursesSection from "../sections/landing/FeaturedCoursesSection";
import HeroSection from "../sections/landing/HeroSection";
import TestimonialSection from "../sections/landing/TestimonialSection"; // Changed to uppercase T

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <CategoriesSection />
      <SliderSection />
      <FeaturedCoursesSection />
      <TestimonialSection /> {/* Changed to uppercase T */}
      <CtaSection />
    </main>
  );
}
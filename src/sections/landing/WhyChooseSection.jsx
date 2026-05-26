import { FiBarChart2, FiBookOpen, FiCalendar, FiEdit3 } from "react-icons/fi";
import { motion } from "framer-motion";

const FEATURES = [
  {
    title: "Progress Tracking and Certifications",
    description:
      "Track completion percentage, session progress, and performance achievements as you learn.",
    icon: FiBarChart2,
    color: "from-[#ff7a3d] to-[#ef4f32]",
  },
  {
    title: "Accessibility and Convenience",
    description:
      "Learn anytime, anywhere with flexible live sessions and course access across devices.",
    icon: FiCalendar,
    color: "from-[#14a3cf] to-[#0878a8]",
  },
  {
    title: "Diverse Course Selection",
    description:
      "Explore a wide range of subjects and practical topics designed for real skill growth.",
    icon: FiBookOpen,
    color: "from-[#ffbf3f] to-[#f28c13]",
  },
  {
    title: "Interactive Learning Experience",
    description:
      "Join trainer-led sessions, exercises, discussions, and guided learning activities.",
    icon: FiEdit3,
    color: "from-[#36b8a4] to-[#148872]",
  },
];

function PaperPlaneDoodle() {
  return (
    <svg viewBox="0 0 90 80" className="hidden md:block absolute left-[16%] top-[120px] h-16 w-16 text-gray-500" fill="none" aria-hidden="true">
      <path d="M12 38 78 13 54 66 41 43 24 54 31 41 12 38Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M31 41 78 13" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M7 25 14 29M20 14l4 8M35 8l-2 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloudDoodle() {
  return (
    <svg viewBox="0 0 92 70" className="hidden md:block absolute right-[17%] top-[86px] h-16 w-16 text-gray-500" fill="none" aria-hidden="true">
      <path d="M16 47c-4-12 7-22 18-17 2-14 19-19 28-8 8 0 15 6 15 15 7 2 10 9 8 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FeatureCard({ feature, index }) {
  const Icon = feature.icon;
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="rounded-2xl bg-white px-5 py-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)] sm:px-6"
    >
      <div className="grid grid-cols-[64px_1fr] gap-5">
        <div className={["flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-lg", feature.color].join(" ")}>
          <Icon className="text-2xl" />
        </div>
        <div>
          <h3 className="text-lg font-black leading-snug text-black">{feature.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">{feature.description}</p>
        </div>
      </div>
    </motion.article>
  );
}

export default function WhyChooseSection() {
  return (
    <section className="relative overflow-hidden bg-[#f7f7f7] py-16 sm:py-20">
      <PaperPlaneDoodle />
      <CloudDoodle />

      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex rounded-full bg-[#e4f4ee] px-6 py-2 text-[12px] font-black uppercase tracking-[0.34em] text-[#13866f]">
            Why Choose Us
          </div>
          <h2 className="mt-5 text-3xl font-black leading-tight text-black sm:text-4xl lg:text-5xl">
            Dive into online courses on diverse subjects
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

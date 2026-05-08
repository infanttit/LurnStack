import { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiTrendingUp } from "react-icons/fi";
import {
  FaBookOpen,
  FaBrain,
  FaChartLine,
  FaCode,
  FaShieldHalved,
} from "react-icons/fa6";
import { MdOutlineDesignServices } from "react-icons/md";

const categorySections = [
  {
    id: "development",
    name: "Development",
    icon: FaCode,
    description:
      "Build real-world apps with modern frameworks, APIs, testing, and deployment.",
  },
  {
    id: "business",
    name: "Business",
    icon: FaChartLine,
    description:
      "Strategy, operations, leadership, and analytics for high-impact teams.",
  },
  {
    id: "design",
    name: "Design",
    icon: MdOutlineDesignServices,
    description:
      "UI/UX fundamentals, systems thinking, prototyping, and product design workflows.",
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: FiTrendingUp,
    description:
      "Growth, SEO, performance marketing, content strategy, and brand building.",
  },
  {
    id: "ai-ml",
    name: "AI & ML",
    icon: FaBrain,
    description:
      "Machine learning foundations, model building, and practical AI applications.",
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    icon: FaShieldHalved,
    description:
      "Security fundamentals, blue-team skills, and defensive best practices.",
  },
];

function scrollToCategory(id) {
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

export default function CategoriesPage() {
  const location = useLocation();

  const targetCategoryId = useMemo(() => {
    const fromState = location?.state?.categoryId;
    if (typeof fromState === "string" && fromState.trim()) return fromState;
    const hash = (location?.hash || "").replace("#", "");
    if (hash) return hash;
    return "";
  }, [location?.hash, location?.state]);

  useEffect(() => {
    if (!targetCategoryId) return;
    const ok = scrollToCategory(targetCategoryId);
    if (ok) return;
    const t = window.setTimeout(() => scrollToCategory(targetCategoryId), 50);
    return () => window.clearTimeout(t);
  }, [targetCategoryId]);

  return (
    <main className="max-w-container-max mx-auto px-margin-desktop py-20">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="font-h2 text-h2 text-primary">Categories</h1>
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Browse learning tracks by domain. Choose a category to see the
            recommended path and starter topics.
          </p>
        </div>
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
        >
          Explore Courses <FiArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-12 gap-8">
        <aside className="md:col-span-4 lg:col-span-3">
          <div className="rounded-2xl border border-outline-variant bg-surface p-5 sticky top-24">
            <div className="flex items-center gap-2 text-on-surface font-semibold">
              <FaBookOpen className="w-4 h-4 text-primary" />
              Jump to
            </div>
            <div className="mt-4 space-y-2">
              {categorySections.map(({ id, name }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToCategory(id)}
                  className={[
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                    targetCategoryId === id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-surface-container-low text-on-surface-variant",
                  ].join(" ")}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="md:col-span-8 lg:col-span-9 space-y-6">
          {categorySections.map(({ id, name, icon: Icon, description }) => (
            <motion.div
              key={id}
              id={id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border border-outline-variant bg-surface p-6 scroll-mt-28"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-on-surface">{name}</h2>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {description}
                    </p>
                  </div>
                </div>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  View courses <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </section>
      </div>
    </main>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
import { motion } from "framer-motion";

import { useAuth } from "../../auth";
import { getStudentSessions } from "../../courses/api/studentSessionsApi";
import { getAllCourses } from "../../courses/data/courseCatalog";
import { categoryHashPath } from "../../app/router/paths";

const CATEGORY_STYLES = [
  "from-[#111827] via-[#14532d] to-[#0f766e]",
  "from-[#020617] via-[#1e3a8a] to-[#0891b2]",
  "from-[#18181b] via-[#7c2d12] to-[#ca8a04]",
  "from-[#111827] via-[#4c1d95] to-[#be185d]",
  "from-[#0f172a] via-[#334155] to-[#64748b]",
  "from-[#052e16] via-[#166534] to-[#84cc16]",
  "from-[#1f2937] via-[#991b1b] to-[#f97316]",
  "from-[#0c0a09] via-[#365314] to-[#14b8a6]",
];

const COLLAPSED_WIDTH = 96;
const TABLET_COLLAPSED_WIDTH = 84;
const CARD_GAP = 12;
const PREVIEW_CARDS_BEFORE_ACTIVE = 3;

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeCategory(value) {
  return String(value || "").trim();
}

function categoryFromItem(item) {
  return normalizeCategory(item.category || item.topic || item.tab || "Trainer Courses");
}

function buildCategorySlides(items = []) {
  const counts = new Map();

  items.forEach((item) => {
    const category = categoryFromItem(item);
    if (!category) return;
    counts.set(category, (counts.get(category) || 0) + 1);
  });

  return Array.from(counts.entries()).map(([name, count], index) => ({
    id: slugify(name) || `category-${index}`,
    name,
    count,
    gradient: CATEGORY_STYLES[index % CATEGORY_STYLES.length],
  }));
}

function CategorySlide({ slide, active, activeWidth, collapsedWidth, onActivate, onOpen }) {
  return (
    <motion.button
      type="button"
      layout
      onClick={active ? onOpen : onActivate}
      transition={{ type: "spring", stiffness: 170, damping: 24 }}
      className={[
        "relative h-[320px] shrink-0 overflow-hidden rounded-[20px] bg-gradient-to-br text-left outline-none sm:h-[380px] sm:rounded-[24px] lg:h-[420px] lg:rounded-[28px]",
        slide.gradient,
      ].join(" ")}
      style={{ width: active ? activeWidth : collapsedWidth }}
      aria-label={active ? `Open ${slide.name}` : `Show ${slide.name}`}
    >
      <div className="absolute inset-0 bg-black/20" />

      {!active ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="-rotate-90 whitespace-nowrap text-sm font-black text-white">
            {slide.name}
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-8 lg:p-10">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white sm:text-sm sm:tracking-[0.28em]">
              LurnStack Categories
            </p>
            <h2 className="mt-5 max-w-[560px] text-2xl font-black leading-tight text-white sm:mt-8 sm:text-4xl lg:text-5xl">
              {slide.name}
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="text-sm font-bold leading-relaxed text-white sm:text-base">
                Explore {slide.count} published learning {slide.count === 1 ? "session" : "sessions"} in this category.
              </p>
              <p className="mt-3 text-xs font-semibold text-white sm:text-sm">
                Click to view related category sessions.
              </p>
            </div>

            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1267ff] text-white transition-transform duration-300 hover:scale-105 sm:h-14 sm:w-14">
              <FiArrowUpRight className="text-xl sm:text-2xl" />
            </span>
          </div>
        </div>
      )}
    </motion.button>
  );
}

function MobileCategorySlide({ slide, active, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: active ? 1 : 0, y: active ? 0 : 16, scale: active ? 1 : 0.98 }}
      exit={{ opacity: 0, y: -16, scale: 0.98 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={[
        "relative h-[300px] w-full overflow-hidden rounded-[22px] bg-gradient-to-br p-5 text-left outline-none",
        slide.gradient,
      ].join(" ")}
      aria-label={`Open ${slide.name}`}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative flex h-full flex-col justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white">
            LurnStack Categories
          </p>
          <h2 className="mt-6 text-3xl font-black leading-tight text-white">
            {slide.name}
          </h2>
        </div>

        <div>
          <p className="text-sm font-bold leading-relaxed text-white">
            Explore {slide.count} published learning {slide.count === 1 ? "session" : "sessions"}.
          </p>
          <div className="mt-5 flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-white">Tap to view related sessions</span>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1267ff] text-white">
              <FiArrowUpRight className="text-xl" />
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export default function SliderSection({ compact = false }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1280);

  useEffect(() => {
    let cancelled = false;
    const loader = isAuthenticated ? getStudentSessions() : Promise.resolve(getAllCourses());

    loader
      .then((items) => {
        if (cancelled) return;
        setSlides(buildCategorySlides(items || []));
        setActiveIndex(0);
      })
      .catch(() => {
        if (!cancelled) setSlides([]);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (paused || slides.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 10000);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const orderedSlides = useMemo(() => {
    return slides;
  }, [slides]);

  const isMobileSlider = viewportWidth < 768;
  const collapsedWidth = viewportWidth < 1024 ? TABLET_COLLAPSED_WIDTH : COLLAPSED_WIDTH;
  const activeWidth = viewportWidth < 1024 ? Math.min(560, viewportWidth * 0.62) : Math.min(720, viewportWidth * 0.64);

  const trackOffset = Math.max(
    0,
    activeIndex * (collapsedWidth + CARD_GAP) -
      PREVIEW_CARDS_BEFORE_ACTIVE * (collapsedWidth + CARD_GAP)
  );

  if (!slides.length) return null;

  return (
    <section className={compact ? "bg-transparent py-0" : "bg-white py-10 sm:py-16"}>
      <div className={compact ? "mx-auto max-w-none px-0" : "mx-auto max-w-7xl px-4 sm:px-8"}>
        {isMobileSlider ? (
          <div>
            <div
              className="overflow-hidden"
              onTouchStart={() => setPaused(true)}
              onTouchEnd={() => setPaused(false)}
            >
              <MobileCategorySlide
                key={slides[activeIndex]?.id}
                slide={slides[activeIndex]}
                active
                onClick={() => navigate(categoryHashPath(slides[activeIndex]?.name))}
              />
            </div>

            <div className="mt-5 flex justify-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={[
                    "h-2 rounded-full transition-all",
                    index === activeIndex ? "w-8 bg-[#54d410]" : "w-2 bg-gray-300",
                  ].join(" ")}
                  aria-label={`Show ${slide.name}`}
                />
              ))}
            </div>
          </div>
        ) : (
        <div
          className="overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <motion.div
            className="flex items-center gap-3 pb-2"
            animate={{ x: -trackOffset }}
            transition={{ type: "spring", stiffness: 120, damping: 24 }}
          >
            {orderedSlides.map((slide) => {
              const realIndex = slides.findIndex((item) => item.id === slide.id);
              const active = realIndex === activeIndex;
              return (
                <CategorySlide
                  key={slide.id}
                  slide={slide}
                  active={active}
                  activeWidth={activeWidth}
                  collapsedWidth={collapsedWidth}
                  onActivate={() => setActiveIndex(realIndex)}
                  onOpen={() => navigate(categoryHashPath(slide.name))}
                />
              );
            })}
          </motion.div>
        </div>
        )}
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { getPublicSessions } from "../../courses/api/studentSessionsApi";
import { getAllCourses } from "../../courses/data/courseCatalog";
import { categoryHashPath } from "../../app/router/paths";
import learnerImage from "../../assets/Images/sample.png";
import programmingImage from "../../assets/Images/categories/Categories1.jpeg";
import marketingImage from "../../assets/Images/categories/categories3.jpeg";
import businessImage from "../../assets/Images/categories/categories4.jpeg";
import trainerImage from "../../assets/Images/categories/categories5.jpeg";

const floatingImages = [
  {
    src: programmingImage,
    alt: "Learner working on programming courses",
    className: "",
    delay: 0,
  },
  {
    src: learnerImage,
    alt: "Student learning online",
    className: "",
    delay: 0.35,
  },
  {
    src: businessImage,
    alt: "Dashboard course analytics",
    className: "",
    delay: 0.65,
  },
  {
    src: marketingImage,
    alt: "Team learning marketing skills",
    className: "",
    delay: 0.95,
  },
  {
    src: trainerImage,
    alt: "Professional trainer course",
    className: "",
    delay: 1.2,
  },
];

function FloatingImage({ item, index, activeIndex }) {
  const imageSlots = [
    { x: -360, y: -175, rotate: -4, scale: 1, zIndex: 2 },
    { x: 350, y: -150, rotate: 3, scale: 1, zIndex: 2 },
    { x: 380, y: 35, rotate: -2, scale: 1, zIndex: 3 },
    { x: -380, y: 80, rotate: 2.5, scale: 1, zIndex: 3 },
    { x: 250, y: 155, rotate: -1.5, scale: 1, zIndex: 2 },
  ];
  const slot = imageSlots[(index + activeIndex) % imageSlots.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.35 }}
      animate={{
        x: slot.x,
        y: slot.y,
        rotate: slot.rotate,
        scale: slot.scale,
      }}
      transition={{
        opacity: { duration: 0.45, delay: item.delay },
        x: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
        y: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
        rotate: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
      }}
      style={{ zIndex: slot.zIndex }}
      className={[
        "absolute left-1/2 top-1/2 hidden h-24 w-36 overflow-hidden rounded-lg bg-white shadow-[0_22px_50px_rgba(15,23,42,0.12)] ring-1 ring-black/5 lg:block",
        item.className,
      ].join(" ")}
    >
      <img src={item.src} alt={item.alt} className="h-full w-full object-cover" loading="lazy" />
    </motion.div>
  );
}

function normalizeCategoryName(course) {
  const raw = course?.category || course?.topic || course?.tab || course?.skill || "";
  const text = String(raw).trim();
  if (!text) return "Popular Courses";
  if (/python|javascript|programming|development|full stack|frontend|backend/i.test(text)) {
    return "Tech & Programming";
  }
  if (/business|marketing|finance|sales/i.test(text)) {
    return "Business & Marketing";
  }
  if (/design|ui|ux|creative/i.test(text)) {
    return "Design & Creativity";
  }
  if (/photo|video|visual/i.test(text)) {
    return "Photography & Visual Arts";
  }
  if (/personal|career|communication|soft skill/i.test(text)) {
    return "Personal Development";
  }
  return text;
}

function buildCourseCategories(items = []) {
  const counts = new Map();
  items.forEach((course) => {
    const name = normalizeCategoryName(course);
    counts.set(name, (counts.get(name) || 0) + 1);
  });

  const built = [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return built.slice(0, 7);
}

export default function PassionCategoriesSection() {
  const [sessions, setSessions] = useState([]);
  const categories = useMemo(() => buildCourseCategories(sessions), [sessions]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPublicSessions()
      .then((items) => {
        if (!cancelled) setSessions(items?.length ? items : getAllCourses());
      })
      .catch(() => {
        if (!cancelled) setSessions(getAllCourses());
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (categories.length <= 1) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % categories.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [categories.length]);

  useEffect(() => {
    const update = () => setIsCompact(window.innerWidth < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!categories.length) return null;

  return (
    <section className="relative overflow-hidden bg-white px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(84,212,16,0.08),transparent_68%)]" />
      <div className="pointer-events-none absolute left-[18%] top-[22%] h-2 w-2 rounded-full bg-[#54d410]/60 blur-[1px]" />
      <div className="pointer-events-none absolute right-[22%] bottom-[24%] h-2 w-2 rounded-full bg-emerald-400/60 blur-[1px]" />

      {floatingImages.map((item, index) => (
        <FloatingImage key={item.alt} item={item} index={index} activeIndex={activeIndex} />
      ))}

      <div className="relative mx-auto flex min-h-[540px] max-w-7xl items-center justify-center sm:min-h-[600px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-xl text-center"
        >
          <h2 className="mx-auto max-w-[620px] text-3xl font-black leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Find Courses That
            <span className="block">Fit Your Passion</span>
          </h2>

          <div className="relative mx-auto mt-10 h-64 w-full max-w-[min(520px,100vw-32px)] text-left sm:h-72">
            <div className="pointer-events-none absolute left-1/2 top-[50%] h-48 w-[min(310px,86vw)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-gray-200 sm:h-60 sm:w-[500px]" />
            {categories.map((category, index) => {
              const position = (index - activeIndex + categories.length) % categories.length;
              const desktopSlots = [
                { x: 0, y: -106, scale: 1.1, opacity: 1, zIndex: 7 },
                { x: 150, y: -72, scale: 0.96, opacity: 0.58, zIndex: 6 },
                { x: 200, y: 0, scale: 0.86, opacity: 0.42, zIndex: 5 },
                { x: 142, y: 78, scale: 0.78, opacity: 0.28, zIndex: 4 },
                { x: -142, y: 78, scale: 0.78, opacity: 0.28, zIndex: 4 },
                { x: -200, y: 0, scale: 0.86, opacity: 0.42, zIndex: 5 },
                { x: -150, y: -72, scale: 0.96, opacity: 0.58, zIndex: 6 },
              ];
              const compactSlots = [
                { x: 0, y: -94, scale: 1.02, opacity: 1, zIndex: 7 },
                { x: 88, y: -56, scale: 0.82, opacity: 0.5, zIndex: 6 },
                { x: 116, y: 0, scale: 0.72, opacity: 0.34, zIndex: 5 },
                { x: 80, y: 62, scale: 0.66, opacity: 0.22, zIndex: 4 },
                { x: -80, y: 62, scale: 0.66, opacity: 0.22, zIndex: 4 },
                { x: -116, y: 0, scale: 0.72, opacity: 0.34, zIndex: 5 },
                { x: -88, y: -56, scale: 0.82, opacity: 0.5, zIndex: 6 },
              ];
              const slots = isCompact ? compactSlots : desktopSlots;
              const slot = slots[position] || slots[slots.length - 1];
              const isActive = position === 0;
              return (
                <motion.div
                  key={category.name}
                  initial={false}
                  animate={{
                    x: slot.x,
                    y: slot.y,
                    scale: slot.scale,
                    opacity: slot.opacity,
                  }}
                  transition={{
                    duration: 0.75,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ zIndex: slot.zIndex }}
                  className={[
                    "absolute left-1/2 top-1/2 w-max max-w-[190px] -translate-x-1/2 -translate-y-1/2 text-sm transition-colors sm:max-w-none sm:text-lg",
                    isActive ? "font-black text-gray-950" : "font-semibold text-gray-300",
                  ].join(" ")}
                >
                  <Link
                    to={categoryHashPath(category.name)}
                    className="inline-flex items-baseline justify-center rounded-full px-2 py-1 text-center leading-tight transition hover:bg-[#54d410]/10 hover:text-gray-950 sm:px-3"
                  >
                    <span>{category.name}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="relative z-20 mt-10"
          >
            <Link
              to="/courses"
              className="group inline-flex items-center gap-2 rounded-lg bg-[#54d410] px-5 py-3 text-sm font-black text-gray-950 shadow-[0_14px_28px_rgba(84,212,16,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(84,212,16,0.32)]"
            >
              All Categories
              <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

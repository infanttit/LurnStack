import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiTrendingUp, FiArrowRight } from "react-icons/fi";
import { HiCheckBadge } from "react-icons/hi2";
import { MdOutlineDesignServices } from "react-icons/md";
import {
  FaBookOpen,
  FaBrain,
  FaChartLine,
  FaCode,
  FaGraduationCap,
  FaMicrochip,
  FaShieldHalved,
  FaStar,
  FaUserGraduate,
  FaUsers,
  FaHeadset,
} from "react-icons/fa6";

const categories = [
  {
    id: "development",
    name: "Development",
    icon: FaCode,
    color: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-500",
    accentFrom: "#3B82F6",
    courseCount: 342,
    studentsCount: "128K",
    topCourse: "Full-Stack Web Dev Bootcamp",
    gradient: "blue",
  },
  {
    id: "business",
    name: "Business",
    icon: FaChartLine,
    color: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-500",
    accentFrom: "#10B981",
    courseCount: 189,
    studentsCount: "94K",
    topCourse: "MBA in 8 Weeks: Strategy",
    gradient: "emerald",
  },
  {
    id: "design",
    name: "Design",
    icon: MdOutlineDesignServices,
    color: "from-pink-500 to-rose-600",
    iconBg: "bg-pink-500",
    accentFrom: "#EC4899",
    courseCount: 276,
    studentsCount: "156K",
    topCourse: "UI/UX Mastery: Figma to Prototype",
    gradient: "pink",
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: FiTrendingUp,
    color: "from-orange-500 to-amber-600",
    iconBg: "bg-orange-500",
    accentFrom: "#F97316",
    courseCount: 215,
    studentsCount: "87K",
    topCourse: "Digital Marketing & SEO Masterclass",
    gradient: "orange",
  },
  {
    id: "ai-ml",
    name: "AI & ML",
    icon: FaBrain,
    color: "from-purple-500 to-violet-600",
    iconBg: "bg-purple-500",
    accentFrom: "#8B5CF6",
    courseCount: 164,
    studentsCount: "121K",
    topCourse: "Applied Machine Learning with Python",
    gradient: "purple",
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    icon: FaShieldHalved,
    color: "from-red-500 to-rose-600",
    iconBg: "bg-red-500",
    accentFrom: "#EF4444",
    courseCount: 138,
    studentsCount: "72K",
    topCourse: "Cybersecurity: Blue Team Starter",
    gradient: "red",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 24 },
  },
};

function CategoryCard({ category }) {
  const navigate = useNavigate();
  const { name, icon: Icon, color, iconBg, accentFrom, courseCount, studentsCount, topCourse, id, gradient } = category;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -8 }}
      onClick={() =>
        navigate(`/categories#${id}`, {
          state: { category: name, gradient, courses: courseCount, categoryId: id },
        })
      }
      className="group relative rounded-2xl border border-gray-100 cursor-pointer overflow-hidden bg-white"
      style={{
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Top accent bar */}
      <motion.div
        className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${color}`}
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
        style={{ transformOrigin: "left", borderRadius: "3px 3px 0 0" }}
      />

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top center, ${accentFrom}18, transparent 70%)` }}
      />

      <div className="p-6 flex flex-col items-center text-center relative z-10">
        {/* Icon */}
        <motion.div
          whileHover={{ rotate: 6, scale: 1.06 }}
          transition={{ type: "spring", stiffness: 400, damping: 12 }}
          className={`w-16 h-16 ${iconBg} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
        >
          <Icon className="text-white text-2xl" />
        </motion.div>

        {/* Name */}
        <h3 className="font-bold text-[15px] text-gray-800 mb-1.5">{name}</h3>

        {/* Stats */}
        <div className="flex items-center gap-2 text-[11.5px] text-gray-400">
          <span className="flex items-center gap-1">
            <FaBookOpen className="w-3 h-3" />
            {courseCount} courses
          </span>
          <span className="w-1 h-1 bg-gray-200 rounded-full" />
          <span className="flex items-center gap-1">
            <FaUsers className="w-3 h-3" />
            {studentsCount}
          </span>
        </div>

        {/* Popular course */}
        <p className="mt-2 text-[10.5px] text-gray-400 line-clamp-1 w-full px-1">
          Popular: {topCourse}
        </p>

        {/* Explore link — appears on hover */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="mt-3 text-[11px] font-semibold flex items-center gap-1 text-gray-500 group-hover:text-gray-700"
        >
          Explore {name} →
        </motion.div>
      </div>

      {/* Bottom bar */}
      <motion.div
        className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${color}`}
        initial={{ scaleX: 0, opacity: 0 }}
        whileHover={{ scaleX: 1, opacity: 0.5 }}
        transition={{ duration: 0.4 }}
        style={{ transformOrigin: "center" }}
      />
    </motion.div>
  );
}

export default function CategoriesSection() {
  return (
    <section
      className="relative py-20 overflow-hidden bg-white"
    >
      {/* Background radial glows — subtle green/teal tones */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #10B981, transparent)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #059669, transparent)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-3"
          style={{ background: "radial-gradient(circle, #2DD4BF, transparent)" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8"
        >
          {/* Left */}
          <div>
            {/* Badge — green theme */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-6"
            >
             
            </motion.div>

            {/* Heading — black/dark text with green gradient accent */}
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.12] text-gray-900"
            >
              Explore Top
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Learning Categories.
              </span>
            </motion.h2>

            {/* Description — dark gray */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.26 }}
              className="text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl mt-4"
            >
              Deep dive into specialized fields with industry-standard curriculum
              designed by experts from top companies worldwide.
            </motion.p>

            {/* Stats — dark theme */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="flex flex-wrap items-center gap-5 mt-6"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <FaGraduationCap className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-[11px]">Premium Courses</p>
                  <p className="font-bold text-lg text-gray-800">1,332+</p>
                </div>
              </div>

              <div className="h-6 w-[1px] bg-gray-200 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <FaUserGraduate className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-[11px]">Active Learners</p>
                  <p className="font-bold text-lg text-gray-800">645K+</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: CTA — green primary button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.38 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/categories"
                className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg font-medium text-sm text-white shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
              >
                Browse All Categories
                <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── Cards Grid ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"
        >
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </motion.div>

        {/* ── Promo Banner — green theme matching overall ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.5 }}
          className="mt-14 rounded-2xl overflow-hidden relative border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50"
        >
          <div
            className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, #10B981, transparent)", transform: "translate(30%, -30%)" }}
          />
          <div
            className="absolute left-0 bottom-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, #059669, transparent)", transform: "translate(-30%, 30%)" }}
          />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-5 p-7 md:p-8">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">🔥</span>
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Limited Time</span>
              </div>
              <h4 className="text-xl md:text-2xl font-bold text-gray-800">Save up to 40% on Annual Plan</h4>
              <p className="text-gray-600 text-sm mt-1">
                Get unlimited access to all 1,300+ courses + certificate programs
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link
                to="/plans"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              >
                View Plans
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/plans"
                  className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg font-medium text-sm text-white shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
                >
                  Start Free Trial
                  <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ── Trust Indicators ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="flex flex-wrap justify-center gap-6 mt-10 pt-8 border-t border-gray-100"
        >
          {[
            { icon: FaStar,        label: "4.8/5 from 50k+ learners" },
            { icon: HiCheckBadge,  label: "Industry-recognized certificates" },
            { icon: FaMicrochip,   label: "Project-based learning" },
            { icon: FaHeadset,     label: "24/7 Mentor Support" },
          ].map(({ icon: Icon, label }, i) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-gray-500 text-[11px]">{label}</span>
              {i < 3 && <span className="w-0.5 h-0.5 rounded-full bg-emerald-300 ml-6 hidden sm:block" />}
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

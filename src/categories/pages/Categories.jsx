import React, { useState, useMemo, useEffect, useCallback } from "react";
import { FaChevronDown, FaSearch, FaTimes, FaFilter } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import CourseCard from "../components/CourseCard";
import FilterSidebar from "../components/FilterSidebar";
import FeaturedBanner from "../components/FeaturedBanner";
import CoursesTabSection from "../components/CoursesTabSection";
import catImages from "../assets/images/categories";

const ALL_COURSES = [
  {
    id: 1,
    thumbnail: catImages["advanced-strategy"],
    category: "Business",
    title: "Advanced Corporate Strategy & Planning",
    rating: 4.8,
    ratingCount: 1240,
    instructorName: "Sarah Jenkins",
    price: 79.99,
    originalPrice: 189.99,
    lastUpdated: "10/2025",
    description:
      "Master the frameworks used by Fortune 500 companies to dominate global markets. Includes case studies from Apple, Tesla, and Amazon.",
    badge: "Bestseller",
    totalHours: 22,
    level: "Advanced",
    priceType: "Paid",
    topic: "Business Strategy",
    popularity: 1240,
    dateAdded: "2025-10-01",
  },
  {
    id: 2,
    thumbnail: catImages["data-analytics"],
    category: "Data Science",
    title: "Strategic Data Analytics for Executives",
    rating: 4.9,
    ratingCount: 2100,
    instructorName: "Dr. Michael Ross",
    price: 129.99,
    originalPrice: 299.99,
    lastUpdated: "11/2025",
    description:
      "Transform your organization with data-driven decision making. Learn SQL, Python, and Tableau for executive-level insights.",
    badge: "Highest Rated",
    totalHours: 30,
    level: "Executive",
    priceType: "Paid",
    topic: "Data Science",
    popularity: 2100,
    dateAdded: "2025-11-15",
  },
  {
    id: 3,
    thumbnail: catImages["leadership-digital"],
    category: "Business",
    title: "Leadership in the Digital Age",
    rating: 4.7,
    ratingCount: 3400,
    instructorName: "Elena Rodriguez",
    price: 59.99,
    originalPrice: 149.99,
    lastUpdated: "12/2025",
    description:
      "Lead remote and hybrid teams effectively. Master digital transformation tools and high-performance culture building.",
    badge: "Bestseller",
    totalHours: 18,
    level: "Intermediate",
    priceType: "Paid",
    topic: "Business Strategy",
    popularity: 3400,
    dateAdded: "2025-12-05",
  },
  {
    id: 4,
    thumbnail: catImages["mergers-acquisitions"],
    category: "Finance",
    title: "Mergers and Acquisitions Foundations",
    rating: 4.6,
    ratingCount: 520,
    instructorName: "James Wilson",
    price: 149.99,
    originalPrice: 349.99,
    lastUpdated: "01/2026",
    description:
      "A complete guide to the M&A process. From valuation and due diligence to post-merger integration.",
    badge: undefined,
    totalHours: 25,
    level: "Advanced",
    priceType: "Paid",
    topic: "Finance",
    popularity: 520,
    dateAdded: "2026-01-10",
  },
  {
    id: 5,
    thumbnail: catImages["global-economic"],
    category: "Finance",
    title: "Global Economic Outlook 2026",
    rating: 4.8,
    ratingCount: 150,
    instructorName: "Patricia Meyer",
    price: 0,
    originalPrice: null,
    lastUpdated: "02/2026",
    description:
      "Analyze current global economic trends and prepare for the financial shifts of 2026. Perfect for investors.",
    badge: "New",
    totalHours: 8,
    level: "Beginner",
    priceType: "Free",
    topic: "Finance",
    popularity: 150,
    dateAdded: "2026-02-20",
  },
  {
    id: 6,
    thumbnail: catImages["growth-marketing"],
    category: "Business",
    title: "Growth Marketing for Startups",
    rating: 4.9,
    ratingCount: 4200,
    instructorName: "Alex Thorne",
    price: 49.99,
    originalPrice: 109.99,
    lastUpdated: "03/2026",
    description:
      "Scale your startup with data-backed marketing experiments. Includes A/B testing, SEO, and paid acquisition.",
    badge: "Highest Rated",
    totalHours: 14,
    level: "Intermediate",
    priceType: "Paid",
    topic: "Marketing",
    popularity: 4200,
    dateAdded: "2026-03-01",
  },
  {
    id: 7,
    thumbnail: catImages["design-systems"],
    category: "Design",
    title: "Design Systems with Figma – Pro Edition",
    rating: 4.9,
    ratingCount: 6800,
    instructorName: "Femke van Schoonhoven",
    price: 69.99,
    originalPrice: 179.99,
    lastUpdated: "04/2026",
    description:
      "Build enterprise-ready design systems. Master tokens, variants, and developer handoff with ease.",
    badge: "Highest Rated",
    totalHours: 20,
    level: "Intermediate",
    priceType: "Paid",
    topic: "Design",
    popularity: 6800,
    dateAdded: "2026-04-05",
  },
  {
    id: 8,
    thumbnail: catImages["venture-capital"],
    category: "Finance",
    title: "Venture Capital & Private Equity Masterclass",
    rating: 4.9,
    ratingCount: 850,
    instructorName: "David Chen",
    price: 99.99,
    originalPrice: 249.99,
    lastUpdated: "01/2026",
    description:
      "Learn the secrets of Silicon Valley financing. Structure deals, raise funds, and exit like a pro.",
    badge: "Bestseller",
    totalHours: 28,
    level: "Advanced",
    priceType: "Paid",
    topic: "Finance",
    popularity: 850,
    dateAdded: "2026-01-20",
  },
  {
    id: 9,
    thumbnail: catImages["popular-webdev"],
    category: "Development",
    title: "Full-Stack Web Development: The 2026 Edition",
    rating: 4.7,
    ratingCount: 15200,
    instructorName: "Colt Steele",
    price: 14.99,
    originalPrice: 84.99,
    lastUpdated: "05/2026",
    description:
      "The only course you need to learn web development - HTML, CSS, JS, Node, and React.",
    badge: "Bestseller",
    totalHours: 65,
    level: "Beginner",
    priceType: "Paid",
    topic: "Development",
    popularity: 15200,
    dateAdded: "2026-05-01",
  },
  {
    id: 10,
    thumbnail: catImages["popular-python"],
    category: "Development",
    title: "Complete Python Masterclass for 2026",
    rating: 4.8,
    ratingCount: 22400,
    instructorName: "Jose Portilla",
    price: 13.99,
    originalPrice: 89.99,
    lastUpdated: "04/2026",
    description:
      "Go from zero to hero in Python. Build 20+ real-world projects and master data science libraries.",
    badge: "Bestseller",
    totalHours: 42,
    level: "Beginner",
    priceType: "Paid",
    topic: "Development",
    popularity: 22400,
    dateAdded: "2026-04-15",
  },
];

const SkeletonCard = () => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
    <div className="aspect-video bg-gray-200" />
    <div className="p-3.5 space-y-2.5">
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-5 bg-gray-200 rounded w-1/4 ml-auto" />
    </div>
  </div>
);

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const SORT_OPTIONS = ["Most Popular", "Highest Rated", "Newest", "Price: Low to High"];

const Categories = () => {
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState("Most Popular");
  const [sortOpen, setSortOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const toggleFilter = useCallback((filter) => {
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]));
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters([]);
    setActiveCategory(null);
    setSearchQuery("");
  }, []);

  const filteredCourses = useMemo(() => {
    const levelFilters = activeFilters.filter((f) => ["Beginner", "Intermediate", "Advanced", "Executive"].includes(f));
    const priceFilters = activeFilters.filter((f) => ["Free", "Paid", "Subscription"].includes(f));
    const topicFilters = activeFilters.filter((f) =>
      ["Business Strategy", "Data Science", "Finance", "Design", "Marketing", "Development"].includes(f)
    );
    const ratingFilters = activeFilters.filter((f) => f.startsWith("rating-"));

    let result = ALL_COURSES.filter((c) => {
      const passLevel = levelFilters.length === 0 || levelFilters.includes(c.level);
      const passPrice = priceFilters.length === 0 || priceFilters.includes(c.priceType);
      const passTopic = topicFilters.length === 0 || topicFilters.includes(c.topic);
      const passRating = ratingFilters.length === 0 || ratingFilters.some((f) => c.rating >= parseFloat(f.split("-")[1]));

      const passCat =
        !activeCategory ||
        c.category === activeCategory ||
        c.topic === activeCategory ||
        (activeCategory === "Development" && c.category === "Development");

      const passSearch =
        !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructorName.toLowerCase().includes(searchQuery.toLowerCase());

      return passLevel && passPrice && passTopic && passRating && passCat && passSearch;
    });

    if (sortBy === "Most Popular") result.sort((a, b) => b.popularity - a.popularity);
    else if (sortBy === "Highest Rated") result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "Newest") result.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    else if (sortBy === "Price: Low to High") result.sort((a, b) => a.price - b.price);

    return result;
  }, [activeFilters, sortBy, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <nav className="text-[12px] text-gray-500 flex items-center gap-2">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <span className="text-black font-semibold">Categories</span>
        </nav>
      </div>

      {/* Section 1: Hero Banner */}
      <div className="w-full">
        <FeaturedBanner />
      </div>

      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Gap between Banner and Grid */}
        <div className="h-12" />

        {/* Section 2: Main Course Grid with Filters */}
        <div className="flex flex-col lg:flex-row gap-12 relative">
          <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar activeFilters={activeFilters} toggleFilter={toggleFilter} onClear={clearFilters} />
            </div>
          </div>

          <div className="lg:hidden flex items-center justify-between mb-4">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded font-bold text-sm"
            >
              <FaFilter className="text-xs" /> Filter
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm font-bold border-none bg-transparent focus:ring-0 cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <main className="flex-1 min-w-0">
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div className="relative w-full max-w-md">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search in these courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-900">{filteredCourses.length} results</span>
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 font-bold text-sm"
                  >
                    Sort by: {sortBy} <FaChevronDown className="text-xs" />
                  </button>
                  <AnimatePresence>
                    {sortOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 shadow-xl z-50 py-1"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setSortBy(opt);
                              setSortOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === opt ? "font-bold" : ""}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="min-h-[40px] mb-4 overflow-x-auto flex items-center gap-2">
              {activeFilters.length > 0 || activeCategory ? (
                <>
                  {activeCategory && (
                    <button
                      onClick={() => setActiveCategory(null)}
                      className="flex-shrink-0 flex items-center gap-1 px-3 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-bold"
                    >
                      Category: {activeCategory} <FaTimes className="text-[10px]" />
                    </button>
                  )}
                  {activeFilters.map((f) => (
                    <button
                      key={f}
                      onClick={() => toggleFilter(f)}
                      className="flex-shrink-0 flex items-center gap-1 px-3 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-bold"
                    >
                      {f.startsWith("rating-") ? `${f.split("-")[1]}+ Stars` : f} <FaTimes className="text-[10px]" />
                    </button>
                  ))}
                  <button onClick={clearFilters} className="text-xs font-bold text-[#004d3d] hover:underline whitespace-nowrap ml-2">
                    Clear all
                  </button>
                </>
              ) : null}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-300 rounded-lg">
                <FaSearch className="text-4xl text-gray-300 mb-4" />
                <h3 className="text-xl font-bold mb-1">No courses match your filters</h3>
                <p className="text-gray-500 mb-6">Try adjusting your selection or search query.</p>
                <button onClick={clearFilters} className="px-6 py-2 bg-[#004d3d] text-white font-bold rounded">
                  Clear all filters
                </button>
              </div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <motion.div key={course.id} variants={cardVariants}>
                    <CourseCard {...course} />
                  </motion.div>
                ))}
              </motion.div>
            )}

          </main>
        </div>

        {/* Section 3: Courses to get you started */}
        <div className="mt-20 mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900">Courses to get you started</h2>
          </div>
          <CoursesTabSection />
        </div>
      </div>

      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/50 z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-white z-[101] shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Filter</h2>
                  <button onClick={() => setMobileFiltersOpen(false)} className="p-2">
                    <FaTimes className="text-xl" />
                  </button>
                </div>
                <FilterSidebar activeFilters={activeFilters} toggleFilter={toggleFilter} onClear={clearFilters} />
                <div className="mt-8">
                  <button onClick={() => setMobileFiltersOpen(false)} className="w-full py-3 bg-black text-white font-bold rounded">
                    Show Results
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Categories;


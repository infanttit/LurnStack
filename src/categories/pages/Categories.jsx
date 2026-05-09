import React, { useState, useMemo, useEffect, useCallback } from "react";
import { FaChevronDown, FaSearch, FaTimes, FaFilter } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import CourseCard from "../components/CourseCard";
import FilterSidebar from "../components/FilterSidebar";
import FeaturedBanner from "../components/FeaturedBanner";
import CoursesTabSection from "../components/CoursesTabSection";
import catImages from "../../assets/Images/categories/categories";

const ALL_COURSES = [
  {
    id: 1,
    thumbnail: catImages["advanced-strategy"],
    category: "Web Development",
    title: "HTML & CSS Mastery",
    rating: 4.8,
    ratingCount: 12400,
    instructorName: "Sarah Jenkins",
    price: 499,
    originalPrice: 1999,
    lastUpdated: "10/2025",
    description: "Learn modern HTML5 and CSS3 from scratch. Build beautiful, responsive websites using Grid, Flexbox, and modern design principles.",
    badge: "Bestseller",
    totalHours: 22.5,
    level: "Beginner",
    priceType: "Paid",
    topic: "Web Development",
    popularity: 12400,
    dateAdded: "2025-10-01",
    takeaways: [
      "Build responsive websites with HTML5 & CSS3",
      "Master CSS Flexbox and CSS Grid architectures",
      "Implement advanced CSS animations and transitions",
      "Design mobile-first interfaces that look great everywhere"
    ]
  },
  {
    id: 2,
    thumbnail: catImages["data-analytics"],
    category: "Web Development",
    title: "JavaScript: Zero to Hero",
    rating: 4.9,
    ratingCount: 34200,
    instructorName: "Colt Steele",
    price: 599,
    originalPrice: 2499,
    lastUpdated: "11/2025",
    description: "The most comprehensive JavaScript course on the market. Master the language from basic syntax to advanced asynchronous programming.",
    badge: "Highest Rated",
    totalHours: 40,
    level: "All Levels",
    priceType: "Paid",
    topic: "Web Development",
    popularity: 34200,
    dateAdded: "2025-11-15",
    takeaways: [
      "Understand closures, prototypes, and the 'this' keyword",
      "Master Asynchronous JavaScript (Promises & Async/Await)",
      "Manipulate the DOM to build interactive applications",
      "Write clean, modular, and maintainable modern ES6+ code"
    ]
  },
  {
    id: 3,
    thumbnail: catImages["leadership-digital"],
    category: "Web Development",
    title: "React.js: Modern Frontend Development",
    rating: 4.8,
    ratingCount: 28500,
    instructorName: "Maximilian Schwarzmüller",
    price: 699,
    originalPrice: 2999,
    lastUpdated: "02/2026",
    description: "Build powerful, fast, user-friendly and reactive web apps. Go from beginner to advanced React developer.",
    badge: "Bestseller",
    totalHours: 35.5,
    level: "Intermediate",
    priceType: "Paid",
    topic: "Web Development",
    popularity: 28500,
    dateAdded: "2026-02-05",
    takeaways: [
      "Master modern React Hooks and the Context API",
      "Build scalable Single Page Applications (SPAs)",
      "Manage complex global state seamlessly with Redux Toolkit",
      "Implement routing and authentication best practices"
    ]
  },
  {
    id: 4,
    thumbnail: catImages["mergers-acquisitions"],
    category: "Web Development",
    title: "Angular JS: Comprehensive Guide",
    rating: 4.6,
    ratingCount: 15400,
    instructorName: "John Doe",
    price: 549,
    originalPrice: 2199,
    lastUpdated: "01/2026",
    description: "Learn Angular from scratch and build highly scalable, component-driven web applications for enterprise clients.",
    badge: undefined,
    totalHours: 28,
    level: "Intermediate",
    priceType: "Paid",
    topic: "Web Development",
    popularity: 15400,
    dateAdded: "2026-01-10",
    takeaways: [
      "Develop enterprise-level component-driven web apps",
      "Master Angular Services, Dependency Injection, and Routing",
      "Handle complex forms and real-time validation",
      "Integrate RESTful APIs securely using RxJS Observables"
    ]
  },
  {
    id: 5,
    thumbnail: catImages["global-economic"],
    category: "Programming",
    title: "Python for Beginners & Beyond",
    rating: 4.9,
    ratingCount: 52100,
    instructorName: "Dr. Angela Yu",
    price: 499,
    originalPrice: 1999,
    lastUpdated: "03/2026",
    description: "Learn Python programming the easy way. This course takes you from complete beginner to building your own games and applications.",
    badge: "Highest Rated",
    totalHours: 50,
    level: "Beginner",
    priceType: "Paid",
    topic: "Programming",
    popularity: 52100,
    dateAdded: "2026-03-20",
    takeaways: [
      "Write clean, idiomatic Python code from scratch",
      "Understand Object-Oriented Programming principles",
      "Automate tedious daily tasks with Python scripts",
      "Build functional portfolio projects and CLI tools"
    ]
  },
  {
    id: 6,
    thumbnail: catImages["growth-marketing"],
    category: "Programming",
    title: "Java Programming Masterclass",
    rating: 4.7,
    ratingCount: 41200,
    instructorName: "Tim Buchalka",
    price: 599,
    originalPrice: 2499,
    lastUpdated: "04/2026",
    description: "Learn Java in this course and become a computer programmer. Obtain valuable core Java skills and Java certification.",
    badge: "Bestseller",
    totalHours: 60,
    level: "All Levels",
    priceType: "Paid",
    topic: "Programming",
    popularity: 41200,
    dateAdded: "2026-04-01",
    takeaways: [
      "Master core Java concepts and standard libraries",
      "Implement deep Object-Oriented Design patterns",
      "Handle multi-threading and concurrent programming",
      "Prepare effectively for the Oracle Java Certification"
    ]
  },
  {
    id: 7,
    thumbnail: catImages["design-systems"],
    category: "Data Science",
    title: "SQL & PLSQL Database Design",
    rating: 4.8,
    ratingCount: 18900,
    instructorName: "Jose Portilla",
    price: 449,
    originalPrice: 1599,
    lastUpdated: "02/2026",
    description: "Learn how to use SQL and PLSQL to quickly and effectively query, manage, and design robust relational databases.",
    badge: "Highest Rated",
    totalHours: 20,
    level: "Intermediate",
    priceType: "Paid",
    topic: "Data Science",
    popularity: 18900,
    dateAdded: "2026-02-05",
    takeaways: [
      "Master complex SQL joins and aggregate functions",
      "Optimize relational database queries for high performance",
      "Write efficient PL/SQL procedures, functions, and triggers",
      "Design normalized database schemas from scratch"
    ]
  },
  {
    id: 8,
    thumbnail: catImages["venture-capital"],
    category: "Data Science",
    title: "Data Science & Machine Learning Bootcamp",
    rating: 4.9,
    ratingCount: 22500,
    instructorName: "Andrei Neagoie",
    price: 799,
    originalPrice: 3299,
    lastUpdated: "05/2026",
    description: "Learn Data Science, Data Analysis, Machine Learning (Artificial Intelligence) and Python with Pandas, Scikit-Learn & NumPy.",
    badge: "Bestseller",
    totalHours: 45,
    level: "Advanced",
    priceType: "Paid",
    topic: "Data Science",
    popularity: 22500,
    dateAdded: "2026-05-20",
    takeaways: [
      "Build predictive Machine Learning models from scratch",
      "Analyze large datasets using Pandas and NumPy",
      "Implement deep learning neural networks with TensorFlow",
      "Deploy scalable ML pipelines into production environments"
    ]
  },
  {
    id: 9,
    thumbnail: catImages["popular-webdev"],
    category: "Data Science",
    title: "MongoDB: The NoSQL Guide",
    rating: 4.7,
    ratingCount: 12200,
    instructorName: "Stephen Grider",
    price: 399,
    originalPrice: 1499,
    lastUpdated: "01/2026",
    description: "Master MongoDB and Mongoose design with a test-driven approach. Build fast, highly scalable NoSQL databases.",
    badge: "New",
    totalHours: 15,
    level: "Intermediate",
    priceType: "Paid",
    topic: "Data Science",
    popularity: 12200,
    dateAdded: "2026-01-01",
    takeaways: [
      "Design robust and scalable NoSQL database schemas",
      "Master the MongoDB Aggregation Framework",
      "Integrate MongoDB securely with Node.js via Mongoose",
      "Implement advanced database indexing and performance tuning"
    ]
  },
  {
    id: 10,
    thumbnail: catImages["advanced-strategy"],
    category: "Web Development",
    title: "MERN Stack: Full-Stack Web Development",
    rating: 4.8,
    ratingCount: 19800,
    instructorName: "Brad Traversy",
    price: 699,
    originalPrice: 2899,
    lastUpdated: "04/2026",
    description: "Build massive full-stack applications using MongoDB, Express, React, and Node.js. Includes advanced authentication.",
    badge: "Bestseller",
    totalHours: 32,
    level: "Advanced",
    priceType: "Paid",
    topic: "Web Development",
    popularity: 19800,
    dateAdded: "2026-04-15",
    takeaways: [
      "Develop complete full-stack web applications from scratch",
      "Implement robust JWT-based authentication flows",
      "Connect React frontends to scalable Express/Node APIs",
      "Deploy full MERN stack apps to cloud infrastructure"
    ]
  },
  {
    id: 11,
    thumbnail: catImages["leadership-digital"],
    category: "Web Development",
    title: "MEAN Stack: Expert Course",
    rating: 4.6,
    ratingCount: 9500,
    instructorName: "Maximilian Schwarzmüller",
    price: 599,
    originalPrice: 2499,
    lastUpdated: "03/2026",
    description: "Build robust backend APIs with Node/Express and connect them to dynamic Angular frontends. Full-stack mastery.",
    badge: undefined,
    totalHours: 25,
    level: "Advanced",
    priceType: "Paid",
    topic: "Web Development",
    popularity: 9500,
    dateAdded: "2026-03-10",
    takeaways: [
      "Build highly responsive Angular Single Page Applications",
      "Design RESTful backend APIs with Node.js and Express",
      "Secure applications with encrypted passwords and tokens",
      "Manage document data efficiently with MongoDB"
    ]
  },
  {
    id: 12,
    thumbnail: catImages["popular-python"],
    category: "Web Development",
    title: "Fullstack Development Bootcamp",
    rating: 4.9,
    ratingCount: 45300,
    instructorName: "Angela Yu",
    price: 799,
    originalPrice: 3499,
    lastUpdated: "05/2026",
    description: "The complete guide to fullstack development. Learn HTML, CSS, JavaScript, Node, React, PostgreSQL, Web3 and DApps.",
    badge: "Highest Rated",
    totalHours: 65,
    level: "Beginner",
    priceType: "Paid",
    topic: "Web Development",
    popularity: 45300,
    dateAdded: "2026-05-01",
    takeaways: [
      "Master both frontend and backend development",
      "Build a portfolio of 15+ real-world web applications",
      "Implement secure user authentication and authorization",
      "Deploy applications using professional DevOps practices"
    ]
  }
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
    <div className="min-h-screen bg-white">
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
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} {...course} />
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


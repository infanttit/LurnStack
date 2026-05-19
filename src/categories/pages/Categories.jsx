import React, { useState, useMemo, useEffect, useCallback } from "react";
import { FaChevronDown, FaSearch, FaTimes, FaFilter } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import CourseCard from "../components/CourseCard";
import FilterSidebar from "../components/FilterSidebar";
import FeaturedBanner from "../components/FeaturedBanner";
import CoursesTabSection from "../components/CoursesTabSection";
import catImages from "../../assets/Images/categories/categories";
import { getStudentSessions } from "../../courses/api/studentSessionsApi";
import { getAllCourses } from "../../courses/data/courseCatalog";
import { useAuth } from "../../auth";

// eslint-disable-next-line no-unused-vars
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
    // eslint-disable-next-line no-script-url
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
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.22, ease: "easeOut" } },
};
const SORT_OPTIONS = ["Most Popular", "Highest Rated", "Newest", "Price: Low to High"];

const guestCategories = [
  {
    title: "Web Development",
    image: catImages["popular-webdev"],
    count: "42 live lessons",
    focus: "React, APIs, deployment",
    description: "Build production-ready web apps with frontend, backend, and hosting workflows.",
  },
  {
    title: "Data & Analytics",
    image: catImages["data-analytics"],
    count: "28 sessions",
    focus: "SQL, Python, dashboards",
    description: "Turn raw data into business-ready insights with practical analyst workflows.",
  },
  {
    title: "Cloud & DevOps",
    image: catImages["advanced-strategy"],
    count: "31 sessions",
    focus: "AWS, Docker, VPS",
    description: "Learn reliable deployment, server operations, and cloud infrastructure basics.",
  },
  {
    title: "AI & Automation",
    image: catImages["global-economic"],
    count: "36 sessions",
    focus: "LLMs, agents, workflows",
    description: "Use modern AI tools to build faster products and automate everyday tasks.",
  },
  {
    title: "Design Systems",
    image: catImages["design-systems"],
    count: "18 workshops",
    focus: "UI, UX, Figma",
    description: "Create polished interfaces with reusable systems and product thinking.",
  },
  {
    title: "Business Growth",
    image: catImages["leadership-digital"],
    count: "24 sessions",
    focus: "Strategy, marketing, teams",
    description: "Sharpen leadership, go-to-market, and operating decisions for real teams.",
  },
];

const guestTracks = [
  "Full stack project path",
  "Career-ready frontend path",
  "Database and backend path",
  "Cloud deployment path",
];

function GuestCategoriesPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-gray-100 bg-[#f7fbf9]">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-emerald-100 bg-white px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-[#006b58]">
              Explore categories
            </div>
            <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold leading-tight text-gray-950">
              Find the right learning path before you sign in.
            </h1>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-gray-600 max-w-2xl">
              Browse professional learning categories, compare focus areas, and register when you are ready to add a session or join a live class.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to="/signup"
                className="h-11 px-6 rounded-lg bg-[#004d3d] text-white text-sm font-extrabold inline-flex items-center justify-center hover:bg-[#00392d] transition-colors"
              >
                Register to continue
              </Link>
              <Link
                to="/login"
                className="h-11 px-6 rounded-lg border border-gray-200 bg-white text-gray-950 text-sm font-extrabold inline-flex items-center justify-center hover:border-[#004d3d] transition-colors"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-950">Popular categories</h2>
            <p className="mt-1 text-sm text-gray-500">
              Curated tracks for practical, live instructor-led learning.
            </p>
          </div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#006b58]">
            Preview mode
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {guestCategories.map((category) => (
            <article
              key={category.title}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-emerald-200 transition-all"
            >
              <div className="aspect-[16/8] bg-gray-100 overflow-hidden">
                <img src={category.image} alt={category.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-extrabold text-gray-950">{category.title}</h3>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#006b58]">
                    {category.count}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-gray-600">{category.focus}</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{category.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="rounded-lg border border-gray-200 bg-gray-950 text-white overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 p-5 sm:p-7">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-300">
                How it works
              </div>
              <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold">
                Browse freely. Continue after login.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/70 max-w-2xl">
                You can inspect categories before creating an account. Adding a card, joining a class, and saving progress are unlocked after login or registration.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {guestTracks.map((track, index) => (
                <div key={track} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-950 text-xs font-black">
                    {index + 1}
                  </span>
                  <span className="text-sm font-bold">{track}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function getGuestCourses() {
  return getAllCourses()
    .slice(0, 12)
    .map((course) => ({
      ...course,
      category: course.category || course.tab || "Popular Courses",
      topic: course.topic || course.tab || "Development",
      instructorName: course.instructorName || course.instructor || "LurnStack Faculty",
      rating: course.rating || 4.7,
      ratingCount: Number(course.ratingCount) || 0,
      price: Number(String(course.price || "").replace(/[^0-9.]/g, "")) || 499,
      priceType: course.priceType || "Paid",
      popularity: course.popularity || 1000,
      dateAdded: course.dateAdded || new Date().toISOString(),
      createdByTrainer: false,
    }));
}

const Categories = () => {
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState("Most Popular");
  const [sortOpen, setSortOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [loadError, setLoadError] = useState("");
  const { isAuthenticated } = useAuth();
  const featuredCourse = useMemo(
    () => [...allCourses].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0] || null,
    [allCourses]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const loader = isAuthenticated ? getStudentSessions() : Promise.resolve(getGuestCourses());
    loader
      .then((sessions) => {
        if (!cancelled) setAllCourses(sessions);
      })
      .catch((err) => {
        if (!cancelled) {
          setAllCourses(getGuestCourses());
          setLoadError(isAuthenticated ? err?.message || "Unable to load sessions." : "");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

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

    let result = allCourses.filter((c) => {
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
  }, [activeFilters, sortBy, activeCategory, searchQuery, allCourses]);

  if (!isAuthenticated) {
    return <GuestCategoriesPage />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2">
        <nav className="hidden sm:flex text-[12px] text-gray-500 items-center gap-2">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <span className="text-black font-semibold">Categories</span>
        </nav>
      </div>

      {/* Section 1: Hero Banner */}
      <div className="w-full max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        <FeaturedBanner course={featuredCourse} />
      </div>

      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Gap between Banner and Grid */}
        <div className="h-3 sm:h-8 lg:h-12" />

        {/* Section 2: Main Course Grid with Filters */}
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-10 relative">
          <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar activeFilters={activeFilters} toggleFilter={toggleFilter} onClear={clearFilters} />
            </div>
          </div>

          <div className="lg:hidden flex flex-col gap-3 mb-4">
            <div className="relative w-full">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded font-bold text-sm flex-shrink-0"
            >
              <FaFilter className="text-xs" /> Filter
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-gray-500 uppercase">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="min-w-0 max-w-[150px] text-sm font-bold border-none bg-transparent focus:ring-0 cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            </div>
          </div>

          <main className="flex-1 min-w-0">
            {loadError ? (
              <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {loadError}
              </div>
            ) : null}
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
                <h3 className="text-xl font-bold mb-1">No learning sessions found</h3>
                <p className="text-gray-500 mb-6">
                  Published expert-led sessions will appear here.
                </p>
                <button onClick={clearFilters} className="px-6 py-2 bg-[#004d3d] text-white font-bold rounded">
                  Clear all filters
                </button>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {filteredCourses.map((course) => (
                  <motion.div
                    key={course.id}
                    variants={cardVariants}
                    className="h-full"
                  >
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
            <h2 className="text-2xl font-extrabold text-gray-900">Latest learning sessions</h2>
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


import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { useSEO } from "../../shared/hooks/useSEO";
import { getPublicSessions } from "../../courses/api/studentSessionsApi";
import LocalSchema from "../components/LocalSchema";
import LocalFAQSection from "../components/LocalFAQSection";
import { HiCheckBadge, HiMiniStar } from "react-icons/hi2";
import { FiUsers, FiTrendingUp, FiArrowRight, FiCode, FiDatabase, FiCloud, FiSmartphone, FiCpu } from "react-icons/fi";
import { motion } from "framer-motion";
import lurnStackLogo from "../../assets/Logo/Logo4.png";

const STATIC_FALLBACK_COURSES = [
  {
    id: "fsd-mastery",
    title: "Full Stack Web Development Mastery",
    instructor: "Siddharth (Senior Architect)",
    description: "Build production-ready web apps using React, Node.js, and PostgreSQL. Master git workflows, REST APIs, and database migrations.",
    price: "₹4,999",
    rating: 4.9,
    ratingCount: 184,
    thumbnailBg: "from-teal-700 to-emerald-900",
    badge: "Best Seller",
    badgeColor: "bg-emerald-100 text-emerald-800",
  },
  {
    id: "python-backend",
    title: "Python Programming & Django Framework",
    instructor: "Ramanathan (Lead Software Developer)",
    description: "Learn clean-code Python, object-oriented concepts, and build scalable backends with Django and REST Framework.",
    price: "₹3,999",
    rating: 4.8,
    ratingCount: 142,
    thumbnailBg: "from-blue-700 to-indigo-950",
    badge: "New Release",
    badgeColor: "bg-blue-100 text-blue-800",
  },
  {
    id: "uiux-design",
    title: "UI/UX Design & Interactive Prototyping",
    instructor: "Meera (Lead Product Designer)",
    description: "Understand visual hierarchy, typography, user research, wireframing, and build interactive prototypes in Figma.",
    price: "₹2,999",
    rating: 4.9,
    ratingCount: 96,
    thumbnailBg: "from-purple-700 to-fuchsia-950",
    badge: "Popular",
    badgeColor: "bg-purple-100 text-purple-800",
  }
];

const CHENNAI_REGIONS = [
  {
    id: "omr-ecr",
    label: "OMR & ECR Corridors",
    locations: [
      "OMR (Old Mahabalipuram Road)",
      "ECR (East Coast Road)",
      "Sholinganallur",
      "Navalur",
      "Siruseri",
      "Karapakkam",
      "Perungudi",
      "Taramani",
      "Semmenchery",
      "Injambakkam",
      "Neelankarai",
      "Palavakkam",
      "Kottivakkam",
      "Thoraipakkam"
    ]
  },
  {
    id: "central",
    label: "Central Chennai",
    locations: [
      "Anna Nagar",
      "T. Nagar",
      "Adyar",
      "Nungambakkam",
      "Mylapore",
      "Alwarpet",
      "Royapettah",
      "Mandaveli",
      "Besant Nagar",
      "Thiruvanmiyur",
      "Ashok Nagar",
      "Kodambakkam",
      "Vadapalani",
      "Kilpauk",
      "Chetpet",
      "Egmore",
      "Triplicane",
      "Saidapet",
      "West Mambalam",
      "Choolaimedu"
    ]
  },
  {
    id: "south",
    label: "South Chennai",
    locations: [
      "Velachery",
      "Guindy",
      "Tambaram",
      "Chromepet",
      "Pallavaram",
      "Medavakkam",
      "Urapakkam",
      "Guduvanchery"
    ]
  },
  {
    id: "west",
    label: "West Chennai",
    locations: [
      "Porur",
      "Ambattur",
      "Avadi",
      "Poonamallee",
      "Mogappair",
      "Iyyappanthangal",
      "Kattupakkam",
      "Valasaravakkam",
      "Virugambakkam",
      "KK Nagar",
      "Saligramam",
      "Ramapuram",
      "Manapakkam",
      "Nandambakkam"
    ]
  },
  {
    id: "north",
    label: "North Chennai",
    locations: [
      "Madhavaram",
      "Perambur",
      "Kolathur",
      "George Town",
      "Washermanpet",
      "Tondiarpet",
      "Ennore",
      "Red Hills",
      "Manali"
    ]
  }
];

const getKeywordTitlePrefix = (prefixStr) => {
  if (!prefixStr) return "Software Courses in";
  const p = prefixStr.toLowerCase().replace(/[- ]+/g, " ").trim();
  if (p.startsWith("software courses")) return "Software Courses in";
  if (p.startsWith("full stack developer course")) return "Full Stack Developer Course in";
  if (p.startsWith("python class")) return "Python Class in";
  if (p.startsWith("ui ux design course")) return "UI UX Design Course in";
  if (p.startsWith("react js training")) return "React JS Training in";
  if (p.startsWith("live online coding classes")) return "Live Online Coding Classes in";
  if (p.startsWith("full stack web development course")) return "Full Stack Web Development Course in";
  if (p.startsWith("backend developer course")) return "Backend Developer Course in";
  if (p.startsWith("node js training")) return "Node JS Training in";
  if (p.startsWith("artificial intelligence live class")) return "Artificial Intelligence Live Class in";
  if (p.startsWith("online learning platform")) return "Online Learning Platform in";
  if (p.startsWith("learning management system")) return "Learning Management System in";
  if (p.startsWith("online courses")) return "Online Courses in";
  if (p.startsWith("e learning platform")) return "E-Learning Platform in";
  if (p.startsWith("professional online courses")) return "Professional Online Courses in";
  if (p.startsWith("self paced learning")) return "Self-Paced Learning in";
  if (p.startsWith("skill development courses")) return "Skill Development Courses in";
  if (p.startsWith("online certification courses")) return "Online Certification Courses in";
  if (p.startsWith("career development courses")) return "Career Development Courses in";
  if (p.startsWith("sql online course")) return "SQL Online Course in";
  if (p.startsWith("python online course")) return "Python Online Course in";
  if (p.startsWith("azure online training")) return "Azure Online Training in";
  if (p.startsWith("aws online training")) return "AWS Online Training in";
  if (p.startsWith("devops online course")) return "DevOps Online Course in";
  if (p.startsWith("power bi online course")) return "Power BI Online Course in";
  if (p.startsWith("data analytics course")) return "Data Analytics Course in";
  if (p.startsWith("cyber security course")) return "Cyber Security Course in";
  if (p.startsWith("cloud computing training")) return "Cloud Computing Training in";
  if (p.startsWith("react js course")) return "React JS Course in";
  if (p.startsWith("java full stack course")) return "Java Full Stack Course in";
  if (p.startsWith("oracle pl sql training")) return "Oracle PL/SQL Training in";
  if (p.startsWith("ai machine learning course") || p.startsWith("ai & machine learning course") || p.startsWith("ai and machine learning course")) return "AI & Machine Learning Course in";
  if (p.startsWith("best online it training")) return "Best Online IT Training in";
  if (p.startsWith("sql training")) return "SQL Training in";
  if (p.startsWith("python training")) return "Python Training in";
  if (p.startsWith("azure training")) return "Azure Training in";
  if (p.startsWith("devops training")) return "DevOps Training in";
  if (p.startsWith("chennai online learning platform")) return "Chennai Online Learning Platform in";
  return "Software Courses in";
};

export default function ChennaiLandingPage() {
  const { locationSlug } = useParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Resolve Location dynamics from URL route parameter
  const getActiveLocationDetails = () => {
    if (!locationSlug) {
      return { activeLocation: "Chennai", urlSlug: "chennai", matchedPrefix: "software-courses-in-" };
    }
    
    const decoded = decodeURIComponent(locationSlug).trim();
    
    // Check if the slug has any of the expected prefixes (case-insensitive, hyphen/space separated)
    const prefixRegex = /^(software[- ]courses[- ]in|full[- ]stack[- ]developer[- ]course[- ]in|python[- ]class[- ]in|ui[- ]ux[- ]design[- ]course[- ]in|react[- ]js[- ]training[- ]in|live[- ]online[- ]coding[- ]classes(?:[- ]in)?|full[- ]stack[- ]web[- ]development[- ]course[- ]in|backend[- ]developer[- ]course[- ]in|node[- ]js[- ]training[- ]in|artificial[- ]intelligence[- ]live[- ]class[- ]in|online[- ]learning[- ]platform[- ]in|learning[- ]management[- ]system[- ]in|online[- ]courses[- ]in|e[- ]learning[- ]platform[- ]in|professional[- ]online[- ]courses[- ]in|self[- ]paced[- ]learning[- ]in|skill[- ]development[- ]courses[- ]in|online[- ]certification[- ]courses[- ]in|career[- ]development[- ]courses[- ]in|sql[- ]online[- ]course[- ]in|python[- ]online[- ]course[- ]in|azure[- ]online[- ]training[- ]in|aws[- ]online[- ]training[- ]in|devops[- ]online[- ]course[- ]in|power[- ]bi[- ]online[- ]course[- ]in|data[- ]analytics[- ]course[- ]in|cyber[- ]security[- ]course[- ]in|cloud[- ]computing[- ]training[- ]in|react[- ]js[- ]course[- ]in|java[- ]full[- ]stack[- ]course[- ]in|oracle[- ]pl[- ]sql[- ]training[- ]in|ai[- ](?:&[- ]|and[- ]|)?machine[- ]learning[- ]course[- ]in|best[- ]online[- ]it[- ]training[- ]in|sql[- ]training[- ]in|python[- ]training[- ]in|azure[- ]training[- ]in|devops[- ]training[- ]in|chennai[- ]online[- ]learning[- ]platform)[- ]/i;
    
    if (!prefixRegex.test(decoded)) {
      return null;
    }
    
    const match = decoded.match(prefixRegex);
    const prefix = match[0];
    const locationPart = decoded.substring(prefix.length).trim();
    
    if (!locationPart) {
      return { activeLocation: "Chennai", urlSlug: "chennai", matchedPrefix: "software-courses-in-" };
    }
    
    const normParam = locationPart.toLowerCase().replace(/[^a-z0-9]/g, "");

    // Normalize prefix to hyphenated format (e.g., "full stack developer course in " -> "full-stack-developer-course-in-")
    const normalizedPrefix = prefix.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+$/, "-")
      .replace(/^-+/, "");

    // Search inside regions
    let matched = null;
    for (const region of CHENNAI_REGIONS) {
      const found = region.locations.find(
        (loc) => loc.toLowerCase().replace(/[^a-z0-9]/g, "") === normParam
      );
      if (found) {
        matched = found;
        break;
      }
    }

    if (matched) {
      return {
        activeLocation: matched,
        urlSlug: matched.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "").replace(/^-+/, ""),
        matchedPrefix: normalizedPrefix
      };
    }

    // Direct string formatting as fallback
    const formatted = locationPart
      .split(/[-_ ]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return {
      activeLocation: formatted,
      urlSlug: locationPart.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "").replace(/^-+/, ""),
      matchedPrefix: normalizedPrefix
    };
  };

  const locationDetails = getActiveLocationDetails();
  const titlePrefix = locationDetails ? getKeywordTitlePrefix(locationDetails.matchedPrefix) : "Software Courses in";
  const keywordName = titlePrefix.replace(/\s+in$/i, "");

  // 2. Load the dynamic SEO metatags based on the resolved location
  useSEO({
    title: locationDetails ? `${titlePrefix} ${locationDetails.activeLocation}` : "Software Courses",
    description: locationDetails ? `Explore premium, live trainer-led ${titlePrefix.replace(/\s+in$/i, "").toLowerCase()} in ${locationDetails.activeLocation}. Gain career-ready skills with certificates.` : "",
    keywords: locationDetails ? `${titlePrefix} ${locationDetails.activeLocation}` : "",
    canonical: locationDetails ? `/${locationDetails.matchedPrefix}${locationDetails.urlSlug}` : "",
  });


  useEffect(() => {
    getPublicSessions()
      .then((data) => {
        if (data && data.length > 0) {
          const formatted = data.slice(0, 6).map((c) => ({
            id: c.id,
            title: c.title || c.sessionTitle || "Software Class",
            instructor: c.instructor || "LurnStack Instructor",
            description: c.description || "Live, interactive developer masterclass.",
            price: c.price || (c.amountPaise ? `₹${(c.amountPaise / 100).toLocaleString("en-IN")}` : "Free"),
            rating: c.rating || 4.8,
            ratingCount: c.ratingCount || 120,
            thumbnail: c.thumbnail,
            thumbnailBg: "from-emerald-800 to-primary-container",
          }));
          setCourses(formatted);
        } else {
          setCourses(STATIC_FALLBACK_COURSES);
        }
      })
      .catch(() => {
        setCourses(STATIC_FALLBACK_COURSES);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Redirect to home page if not a valid location-based SEO URL prefix
  if (!locationDetails) {
    return <Navigate to="/" replace />;
  }

  const { activeLocation, urlSlug } = locationDetails;


  return (
    <main className="bg-background min-h-screen">
      {/* Dynamic JSON-LD injection */}
      <LocalSchema 
        activeLocation={activeLocation} 
        urlSlug={urlSlug} 
        matchedPrefix={locationDetails?.matchedPrefix || "software-courses-in-"}
        keywordName={keywordName}
      />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white py-12 md:py-20 lg:min-h-[90svh] flex items-center border-b border-gray-100">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-emerald-50/40 via-teal-50/10 to-transparent" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 pb-10 pt-2 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          {/* LEFT COLUMN */}
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Interactive Training in {activeLocation}
                </span>
              </div>
            </motion.div>

            <div className="mb-6">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-gray-950 leading-tight">
                {titlePrefix.replace(/\s+in$/i, "")}{" "}
                <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mt-1">
                  in {activeLocation}.
                </span>
              </h1>
            </div>

            <div className="mb-8">
              <p className="max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
                Gain hands-on software development expertise through interactive, live online masterclasses led by senior developer-mentors. Skip long, exhausting commutes to offline centers and learn live with actual engineers in {activeLocation}.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <a
                  href="#courses"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-teal-500/25 transition-all duration-300 hover:shadow-teal-500/40 min-[420px]:w-auto"
                >
                  Explore Courses
                  <FiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </a>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/signup"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 px-6 py-3 text-sm font-semibold text-emerald-800 transition-all duration-300 hover:border-emerald-500 hover:bg-emerald-50 min-[420px]:w-auto"
                >
                  Join Free Trial
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100"
            >
              <div className="flex items-center gap-1.5">
                <FiTrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[11px] font-bold text-gray-600">Top Rated Instructors</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-emerald-400" />
              <div className="flex items-center gap-1.5">
                <HiCheckBadge className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[11px] font-bold text-gray-600">Verified Certificates</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-emerald-400" />
              <div className="flex items-center gap-1.5">
                <FiUsers className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[11px] font-bold text-gray-600">Live Code-Alongs</span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN — Globe connection map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="ag-globe-col relative flex min-h-[320px] lg:min-h-[500px] items-center justify-center"
          >
            <div className="ag-globe-wrap scale-90 sm:scale-100">
              <div className="ag-globe-ring ag-globe-ring-1" />
              <div className="ag-globe-ring ag-globe-ring-2" />
              <div style={{ position: "absolute", inset: "40px", borderRadius: "50%", border: "1px dashed rgba(16,185,129,0.16)" }} />
              <div className="ag-globe-core">
                <svg viewBox="0 0 200 200" aria-hidden="true" style={{ width: "100%", height: "100%" }}>
                  <ellipse cx="100" cy="100" rx="98" ry="98" fill="none" stroke="#fbd9da" strokeWidth="0.75" />
                  <ellipse cx="100" cy="100" rx="60" ry="98" fill="none" stroke="#fbd9da" strokeWidth="0.55" />
                  <ellipse cx="100" cy="100" rx="24" ry="98" fill="none" stroke="#fbd9da" strokeWidth="0.45" />
                  <line x1="2" y1="100" x2="198" y2="100" stroke="#fbd9da" strokeWidth="0.55" />
                  <line x1="100" y1="2" x2="100" y2="198" stroke="#fbd9da" strokeWidth="0.45" />
                  <ellipse cx="100" cy="100" rx="98" ry="40" fill="none" stroke="#fbd9da" strokeWidth="0.55" />
                  <ellipse cx="100" cy="100" rx="98" ry="70" fill="none" stroke="#fbd9da" strokeWidth="0.45" />
                </svg>
                <div className="ag-globe-center">
                  <img src={lurnStackLogo} alt="LurnStack Logo" width="66" height="66" className="object-contain" />
                </div>
              </div>
              <svg className="ag-connection-map" viewBox="0 0 540 540" aria-hidden="true">
                <path className="ag-connection-line ag-connection-line-main" d="M270 270 L140 160 L270 62 L405 150 L382 392 L160 378 Z" />
                <path className="ag-connection-line" d="M270 270 L140 160" />
                <path className="ag-connection-line" d="M270 270 L405 150" />
                <path className="ag-connection-line" d="M270 270 L160 378" />
                <path className="ag-connection-line" d="M270 270 L382 392" />
                <path className="ag-connection-line" d="M270 270 L270 62" />
                <circle className="ag-moving-dot ag-moving-dot-green" r="4">
                  <animateMotion dur="8s" repeatCount="indefinite" path="M270 270 L140 160 L270 62 L405 150 L382 392 L160 378 Z" />
                </circle>
                <circle className="ag-moving-dot ag-moving-dot-blue" r="3.5">
                  <animateMotion dur="8s" begin="1.6s" repeatCount="indefinite" path="M270 270 L140 160 L270 62 L405 150 L382 392 L160 378 Z" />
                </circle>
                <circle className="ag-moving-dot ag-moving-dot-purple" r="3.5">
                  <animateMotion dur="8s" begin="3.2s" repeatCount="indefinite" path="M270 270 L140 160 L270 62 L405 150 L382 392 L160 378 Z" />
                </circle>
              </svg>
              <div className="ag-course-node ag-course-node-programming"><span><FiCode /></span><strong>Programming</strong></div>
              <div className="ag-course-node ag-course-node-database"><span><FiDatabase /></span><strong>Database</strong></div>
              <div className="ag-course-node ag-course-node-ai"><span><FiCpu /></span><strong>AI</strong></div>
              <div className="ag-course-node ag-course-node-cloud"><span><FiCloud /></span><strong>Cloud</strong></div>
              <div className="ag-course-node ag-course-node-mobile"><span><FiSmartphone /></span><strong>Mobile</strong></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="bg-white border-b border-gray-100 py-10 shadow-sm relative z-10 -mt-8 max-w-5xl mx-auto rounded-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-gray-100">
          <div>
            <div className="text-2xl md:text-3xl font-black text-primary">1,200+</div>
            <div className="text-xs text-gray-500 font-bold uppercase mt-1">{activeLocation} Learners</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-primary">100%</div>
            <div className="text-xs text-gray-500 font-bold uppercase mt-1">Live Classes</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-primary">4.9/5</div>
            <div className="text-xs text-gray-500 font-bold uppercase mt-1">Mentor Rating</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-primary">95%</div>
            <div className="text-xs text-gray-500 font-bold uppercase mt-1">Placement Link</div>
          </div>
        </div>
      </section>

      {/* 3. COURSES SECTION */}
      <section id="courses" className="py-16 max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-3">
            Top {titlePrefix.replace(/\s+in$/i, "")} in {activeLocation}
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto">
            Choose from our highly popular, live trainer-led programs in {activeLocation} designed for job readiness.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group hover:border-emerald-300"
              >
                {/* Course Banner */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${course.thumbnailBg} flex items-center justify-center p-6 text-center text-white/90 font-extrabold text-sm`} />
                  )}
                  {course.badge && (
                    <span className={`absolute left-3 top-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${course.badgeColor}`}>
                      {course.badge}
                    </span>
                  )}
                </div>

                {/* Course Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-base text-gray-900 leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-semibold">{course.instructor}</p>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                      {course.description}
                    </p>

                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="font-bold text-xs text-[#b4690e]">{course.rating}</span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <HiMiniStar
                            key={s}
                            className={`text-xs ${s <= Math.round(course.rating) ? "text-[#f69c08]" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400">({course.ratingCount})</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 mt-6 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400 block uppercase font-bold tracking-wider">Tuition Fee</span>
                      <span className="font-black text-lg text-primary">{course.price}</span>
                    </div>
                    <Link
                      to={course.id ? `/courses?q=${encodeURIComponent(course.title)}` : "/courses"}
                      className="px-4 py-2 border border-primary text-primary font-bold text-xs rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
                    >
                      See details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3.5 KEYWORD FEATURES SECTION */}
      <section className="py-16 bg-white border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-3">
              Comprehensive {titlePrefix.replace(/\s+in$/i, "")} Training Programs in {activeLocation}
            </h2>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
              Skip traditional computer training centers in {activeLocation} and experience <strong>online software courses</strong> led directly by working software engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Full Stack & Web Dev */}
            <div className="p-8 border border-gray-100 rounded-2xl bg-surface-container-lowest hover:border-emerald-300 transition-all shadow-sm">
              <h3 className="font-bold text-base text-gray-900 mb-4">
                Full Stack Web Development Course in {activeLocation}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Looking to land a role as a programmer? Our high-impact <strong>Full Stack Web Development Course in {activeLocation}</strong> provides step-by-step guidance. You will receive advanced <strong>react js training in {activeLocation}</strong>, learn modern CSS frameworks, and master Figma design with our <strong>ui ux design course in {activeLocation}</strong>.
              </p>
              <span className="text-[10px] font-bold text-emerald-700 block">
                → Mapped: web development course online with live trainer & full stack developer course in {activeLocation}
              </span>
            </div>

            {/* Card 2: Backend & Database */}
            <div className="p-8 border border-gray-100 rounded-2xl bg-surface-container-lowest hover:border-emerald-300 transition-all shadow-sm">
              <h3 className="font-bold text-base text-gray-900 mb-4">
                Advanced Backend & Node JS Training in {activeLocation}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Master server architectures with our structured <strong>backend developer course in {activeLocation}</strong>. We offer comprehensive <strong>node js training in {activeLocation}</strong> coupled with <strong>live database query writing classes</strong> to help you build resilient backends, APIs, and microservices.
              </p>
              <span className="text-[10px] font-bold text-emerald-700 block">
                → Mapped: live online backend development classes
              </span>
            </div>

            {/* Card 3: Python & AI */}
            <div className="p-8 border border-gray-100 rounded-2xl bg-surface-container-lowest hover:border-emerald-300 transition-all shadow-sm">
              <h3 className="font-bold text-base text-gray-900 mb-4">
                Python & Artificial Intelligence Live Class in {activeLocation}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Start your journey into future-focused technologies with an interactive <strong>python class in {activeLocation}</strong>. Learn Python core fundamentals, object-oriented coding, and transition smoothly into advanced training with our <strong>live ai engineering classes for developers</strong>.
              </p>
              <span className="text-[10px] font-bold text-emerald-700 block">
                → Mapped: artificial intelligence live class in {activeLocation}
              </span>
            </div>

            {/* Card 4: Interactive Coding Environment */}
            <div className="p-8 border border-gray-100 rounded-2xl bg-surface-container-lowest hover:border-emerald-300 transition-all shadow-sm">
              <h3 className="font-bold text-base text-gray-900 mb-4">
                Live Online Coding Classes in {activeLocation}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                We believe that pre-recorded courses don't work. Our <strong>live trainer led coding classes</strong> feature interactive code-alongs and instant error debugging. Unlike a static <strong>computer training center in {activeLocation}</strong>, our <strong>live online software training</strong> runs in real-time, helping you <strong>learn coding from software developers online</strong>.
              </p>
              <span className="text-[10px] font-bold text-emerald-700 block">
                → Mapped: real time online software courses & interactive software engineering classes online & live online coding classes {activeLocation}
              </span>
            </div>
          </div>
        </div>
      </section>


      {/* 5. LOCAL FAQ SECTION */}
      <LocalFAQSection activeLocation={activeLocation} keywordName={keywordName} />

      {/* 6. CTA SECTION */}
      <section className="bg-primary text-white py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="max-w-3xl mx-auto px-margin-mobile relative z-10 space-y-6">
          <h2 className="text-2xl md:text-4xl font-extrabold text-secondary-fixed">
            Ready to Build Your Developer Portfolio?
          </h2>
          <p className="text-white/75 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Register today to reserve a slot in our upcoming cohorts. Start learning software engineering from real developers.
          </p>
          <div className="pt-2">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-secondary-fixed text-primary font-extrabold text-sm rounded-full hover:scale-105 transition-all duration-300 shadow-xl"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

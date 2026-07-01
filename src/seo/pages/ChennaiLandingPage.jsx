import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { useSEO } from "../../shared/hooks/useSEO";
import { getPublicSessions } from "../../courses/api/studentSessionsApi";
import LocalSchema from "../components/LocalSchema";
import { HiCheckBadge, HiMiniStar } from "react-icons/hi2";
import {
  FiUsers,
  FiTrendingUp,
  FiArrowRight,
  FiCode,
  FiDatabase,
  FiCloud,
  FiSmartphone,
  FiCpu,
  FiMapPin,
  FiAward,
  FiMap,
  FiChevronDown,
} from "react-icons/fi";
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

const LOCAL_TESTIMONIALS = [
  {
    name: "Ashok Sundar",
    college: "SSN College of Engineering, Kalavakkam",
    company: "Zoho Corporation",
    role: "Associate Software Engineer",
    text: "Traveling from our hostel on OMR to coaching centers in Guindy was a nightmare due to daily peak-hour traffic. LurnStack's live trainer-led React JS training let me code live with senior architects right from my desk. The microservice project I built got me placed at Zoho!",
    salary: "₹8.5 LPA",
    initials: "AS"
  },
  {
    name: "Harini Priya",
    college: "SRM University, Kattankulathur",
    company: "Freshworks",
    role: "Front-End Developer",
    text: "I was from a non-IT background and felt intimidated by coding. The live python and SQL classes on LurnStack were structured so logically. The mentor debugged my React components live during the session. I successfully cleared the Freshworks off-campus drive in Guindy!",
    salary: "₹6.5 LPA",
    initials: "HP"
  },
  {
    name: "Karthik Raja",
    college: "Anna University (CEG), Guindy",
    company: "Cognizant",
    role: "Programmer Analyst",
    text: "LurnStack is completely different from passive video courses. Having an active developer explain backend routes and database schemas in real-time made a huge difference. The mock interviews modeled after OMR IT companies prepared me perfectly.",
    salary: "₹7.2 LPA",
    initials: "KR"
  }
];

const CHENNAI_LANDMARKS = [
  {
    name: "Tidel Park (Taramani)",
    desc: "The monumental 13-story IT hub at the start of OMR, housing key software MNCs, product companies, and development labs.",
    landmark: "OMR-ECR Junction"
  },
  {
    name: "Siruseri IT Park (SIPCOT)",
    desc: "A massive 1,000-acre tech park at the tail end of OMR, featuring state-of-the-art campuses of TCS, Cognizant, and Hexaware.",
    landmark: "OMR Expressway"
  },
  {
    name: "DLF Cybercity (Porur)",
    desc: "The major technology center of West Chennai, hosting software product giants like IBM, Barclays, and Zoho partners.",
    landmark: "Mount-Poonamallee Road"
  },
  {
    name: "Guindy Industrial Estate",
    desc: "A key technology and engineering cluster, home to Olympia Tech Park, modern SaaS startups, and digital transformation agencies.",
    landmark: "Kathipara Flyover Hub"
  }
];

const LOCAL_SUCCESS_STORIES = [
  {
    title: "From Non-CS to SaaS Developer in Guindy",
    student: "Ramya Narayanan",
    story: "Ramya graduated from an engineering college in Tambaram with a degree in Civil Engineering. Desperate to switch to IT, she joined local centers but found the schedules too rigid. After enrolling in LurnStack's Full Stack Web Development course, she learned React and Node.js from home, built 4 production-grade projects, and landed a software engineer role at a leading SaaS company in Guindy's tech park.",
    badge: "SRM Grad"
  },
  {
    title: "Cracking Zoho from Kalavakkam",
    student: "Vigneshwaran K.",
    story: "Vignesh was studying near Kalavakkam (OMR corridor). Commuting to Adyar for software training would take 3 hours daily. He chose LurnStack's live Python and Database classes. His mentor helped him design an optimized database schema for a logistics application. That project was the main focus of his technical rounds at Zoho, leading to an immediate placement offer.",
    badge: "SSN Alumni"
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
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // 1. Resolve Location dynamics from URL route parameter
  const getActiveLocationDetails = () => {
    if (!locationSlug) {
      return { activeLocation: "Chennai", urlSlug: "chennai", matchedPrefix: "software-courses-in-" };
    }
    
    const decoded = decodeURIComponent(locationSlug).trim();
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
    const normalizedPrefix = prefix.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+$/, "-")
      .replace(/^-+/, "");

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

  useSEO({
    title: locationDetails ? `${titlePrefix} ${locationDetails.activeLocation} | Live Developer Classes` : "Software Courses",
    description: locationDetails ? `Enroll in high-impact, live trainer-led ${titlePrefix.replace(/\s+in$/i, "").toLowerCase()} in ${locationDetails.activeLocation}. Learn coding, React, Python, and SQL from working software developers.` : "",
    keywords: locationDetails ? `${titlePrefix} ${locationDetails.activeLocation}, software training, React class, Python training, web development course` : "",
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

  if (!locationDetails) {
    return <Navigate to="/" replace />;
  }

  const { activeLocation, urlSlug } = locationDetails;

  const faqsList = [
    {
      q: `Why should I choose LurnStack's live ${keywordName.toLowerCase()} over offline computer coaching centers in ${activeLocation}?`,
      a: `Offline coaching institutes in ${activeLocation} require you to battle heavy traffic on OMR, GST Road, or the Kathipara flyover, leading to massive exhaustion before classes even start. LurnStack provides 100% interactive, live online classes led directly by senior software engineers. You get live code-alongs, instant debugger support on your screen, and industry-grade curriculum without leaving your home.`
    },
    {
      q: `Do you provide job placement support for students in the ${activeLocation} tech hub?`,
      a: `Yes, we offer structured job placement support. We help you build a professional developer portfolio on GitHub, review your resume, and organize mock technical interviews modeled after major IT recruiters on OMR, Guindy, and DLF Cybercity. We connect top performers directly with tech companies and SaaS startups located inside Tidel Park and Siruseri IT SEZ.`
    },
    {
      q: `Are these classes suitable for college students from engineering and arts colleges near ${activeLocation}?`,
      a: `Absolutely! We regularly train students from prominent institutions near ${activeLocation} (including CEG, SSN, SRM, Sathyabama, and VIT). Since our live sessions are scheduled flexibly and recorded, students can comfortably manage their college semesters while learning practical, industry-aligned skills like React JS, Node.js, and SQL.`
    },
    {
      q: `What happens if I miss a live online training session?`,
      a: `If you miss a session, don't worry. Every live class is recorded and uploaded to your personal student dashboard within a few hours. You can review the video, access the trainer's git repository, and check the code. You can also ask questions or resolve doubts during the next live class or by starting a query with LurnStack AI.`
    },
    {
      q: `How do I verify the certificate I earn after completing the course?`,
      a: `Every certificate issued by LurnStack features a unique verification ID and secure QR code. Employers, HR recruiters, or academic institutions can scan this QR code or navigate to lurnstack.com/verify to view your official completion log, attendance percentage, and projects database record in real-time.`
    }
  ];

  return (
    <main className="bg-slate-50 min-h-screen text-slate-900 pb-16">
      <LocalSchema 
        activeLocation={activeLocation} 
        urlSlug={urlSlug} 
        matchedPrefix={locationDetails?.matchedPrefix || "software-courses-in-"}
        keywordName={keywordName}
      />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white py-16 md:py-24 border-b border-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(84,212,16,0.1),transparent_45%)]" />
        
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Live Software Training &bull; {activeLocation}
                </span>
              </div>
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl text-slate-950 leading-tight">
              {keywordName}{" "}
              <span className="block bg-gradient-to-r from-emerald-600 to-[#004d3d] bg-clip-text text-transparent mt-1">
                in {activeLocation}.
              </span>
            </h1>

            <p className="mt-6 text-sm sm:text-base leading-relaxed text-slate-600 font-medium">
              Accelerate your tech career with LurnStack's premium, live trainer-led software classes in {activeLocation}. Bypass exhausting, time-consuming commutes to offline coaching institutes on OMR or Guindy. Master frontend development, SQL databases, Python backend frameworks, and AI concepts directly from working senior software developers.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="#courses"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#004d3d] px-6 py-3.5 text-sm font-black text-[#54d410] shadow-lg shadow-emerald-950/20 hover:bg-[#003d31] transition-all"
              >
                Browse Courses
                <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 transition-all"
              >
                Join Free Trial
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <FiTrendingUp className="h-4.5 w-4.5 text-emerald-700" />
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">1-on-1 Debugger Support</span>
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <div className="flex items-center gap-1.5">
                <HiCheckBadge className="h-4.5 w-4.5 text-emerald-700" />
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Verified QR Credentials</span>
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <div className="flex items-center gap-1.5">
                <FiUsers className="h-4.5 w-4.5 text-emerald-700" />
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Job Reference Network</span>
              </div>
            </div>
          </div>

          {/* Right Column visual connection globe node map */}
          <div className="relative flex min-h-[300px] lg:min-h-[480px] items-center justify-center overflow-hidden">
            <div className="ag-globe-wrap scale-90 sm:scale-100">
              <div className="ag-globe-ring ag-globe-ring-1" />
              <div className="ag-globe-ring ag-globe-ring-2" />
              <div className="ag-globe-core bg-white shadow-lg border border-slate-100 rounded-full">
                <svg viewBox="0 0 200 200" aria-hidden="true" className="w-full h-full">
                  <ellipse cx="100" cy="100" rx="98" ry="98" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                  <ellipse cx="100" cy="100" rx="60" ry="98" fill="none" stroke="#e2e8f0" strokeWidth="0.6" />
                  <line x1="2" y1="100" x2="198" y2="100" stroke="#e2e8f0" strokeWidth="0.6" />
                  <line x1="100" y1="2" x2="100" y2="198" stroke="#e2e8f0" strokeWidth="0.5" />
                </svg>
                <div className="ag-globe-center">
                  <img src={lurnStackLogo} alt="LurnStack Logo" width="60" height="60" className="object-contain" />
                </div>
              </div>
              <svg className="ag-connection-map" viewBox="0 0 540 540" aria-hidden="true">
                <path className="ag-connection-line ag-connection-line-main" d="M270 270 L140 160 L270 62 L405 150 L382 392 L160 378 Z" />
                <circle className="ag-moving-dot ag-moving-dot-green" r="4.5">
                  <animateMotion dur="8s" repeatCount="indefinite" path="M270 270 L140 160 L270 62 L405 150 L382 392 L160 378 Z" />
                </circle>
              </svg>
              <div className="ag-course-node ag-course-node-programming shadow-sm"><span><FiCode /></span><strong>React & JS</strong></div>
              <div className="ag-course-node ag-course-node-database shadow-sm"><span><FiDatabase /></span><strong>Databases</strong></div>
              <div className="ag-course-node ag-course-node-ai shadow-sm"><span><FiCpu /></span><strong>AI Dev</strong></div>
              <div className="ag-course-node ag-course-node-cloud shadow-sm"><span><FiCloud /></span><strong>Cloud Sys</strong></div>
              <div className="ag-course-node ag-course-node-mobile shadow-sm"><span><FiSmartphone /></span><strong>Mobile Web</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SPECIFIC REGIONAL DEEP-DIVE (Bypassing commutes, OMR etc.) */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-margin-mobile sm:px-margin-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#004d3d]">
                Bypass the Commute, Learn Live from Home
              </span>
              <h2 className="mt-3 text-2xl sm:text-3.5xl font-black text-slate-950 tracking-tight leading-snug">
                Why Software Enthusiasts in {activeLocation} Choose Live Online Training
              </h2>
              <p className="mt-5 text-sm text-slate-600 leading-relaxed font-medium">
                {activeLocation} is rapidly expanding as India's premier SaaS and software capital, stretching from the OMR tech corridor down to Central and West Chennai hubs. However, attending traditional offline computer centers in places like T. Nagar, Adyar, or Guindy comes with a high cost: hours wasted waiting in heavy traffic bottlenecks near Kathipara, Velachery, or Sholinganallur.
              </p>
              <p className="mt-4 text-sm text-slate-600 leading-relaxed font-medium">
                LurnStack shifts the learning environment. Our structured <strong>live online software courses in {activeLocation}</strong> deliver the absolute rigor of offline institutes without the physical commute. You code live alongside software engineers who work in Chennai's leading product companies, getting active feedback and dashboard help immediately.
              </p>
              
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2">
                  <FiMapPin className="text-emerald-700 text-sm" />
                  <span className="text-xs font-bold text-slate-700">OMR IT Corridor</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2">
                  <FiMapPin className="text-emerald-700 text-sm" />
                  <span className="text-xs font-bold text-slate-700">Guindy Tech Hub</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2">
                  <FiMapPin className="text-emerald-700 text-sm" />
                  <span className="text-xs font-bold text-slate-700">DLF Cybercity</span>
                </div>
              </div>
            </div>

            {/* Landmarks visual block */}
            <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-100 relative">
              <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-emerald-100/30 to-transparent rounded-tr-3xl" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                <FiMap className="text-emerald-700" /> Key Tech Centers We Service in {activeLocation}
              </h3>
              
              <div className="space-y-4">
                {CHENNAI_LANDMARKS.map((lm) => (
                  <div key={lm.name} className="flex gap-4 p-3 bg-white rounded-xl border border-slate-100/80 shadow-sm hover:border-emerald-200 transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-800 grid place-items-center shrink-0">
                      <FiMapPin className="text-sm" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{lm.name}</h4>
                      <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500 font-semibold">{lm.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. COURSES SECTION */}
      <section id="courses" className="py-16 max-w-7xl mx-auto px-margin-mobile sm:px-margin-desktop">
        <div className="text-center mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-[#004d3d]">
            Curated Syllabi
          </span>
          <h2 className="mt-2 text-2xl sm:text-3.5xl font-black text-slate-950 tracking-tight">
            Top {keywordName} Programs Available in {activeLocation}
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-semibold">
            Choose a developer-led track built specifically to match recruiting requirements of tech companies.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004d3d]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group hover:border-emerald-300"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${course.thumbnailBg} flex items-center justify-center p-6 text-center text-white/90 font-extrabold text-sm`} />
                  )}
                  {course.badge && (
                    <span className="absolute left-3 top-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {course.badge}
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-[15px] sm:text-[17px] text-slate-950 leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold">{course.instructor}</p>
                    <p className="text-xs leading-relaxed text-slate-600 line-clamp-3">
                      {course.description}
                    </p>

                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="font-extrabold text-xs text-amber-700">{course.rating}</span>
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <HiMiniStar
                            key={s}
                            className={`text-xs ${s <= Math.round(course.rating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">({course.ratingCount})</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Tuition Fee</span>
                      <span className="font-black text-base text-[#004d3d]">{course.price}</span>
                    </div>
                    <Link
                      to={course.id ? `/courses?q=${encodeURIComponent(course.title)}` : "/courses"}
                      className="px-4 py-2 border border-slate-200 hover:border-emerald-600 text-slate-700 hover:text-emerald-800 font-bold text-xs rounded-xl hover:bg-emerald-50 transition-all"
                    >
                      See Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. SUCCESS STORIES ( Anna University, SSN, SRM graduates to Zoho, Freshworks etc. ) */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-margin-mobile sm:px-margin-desktop">
          <div className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#004d3d]">
              Local Achievements
            </span>
            <h2 className="mt-2 text-2xl sm:text-3.5xl font-black text-slate-950 tracking-tight">
              Developer Placements & Success Stories in {activeLocation}
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-semibold">
              Read how student developers near you bridged the gap between academic theory and practical software engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {LOCAL_SUCCESS_STORIES.map((story) => (
              <div key={story.title} className="p-6 sm:p-8 bg-slate-50 border border-slate-100 rounded-3xl relative overflow-hidden group hover:border-emerald-200 transition-all">
                <span className="absolute right-4 top-4 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5">
                  {story.badge}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 pr-16 leading-snug">
                  {story.title}
                </h3>
                <p className="mt-1 text-xs font-bold text-emerald-800">{story.student}</p>
                
                <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
                  {story.story}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. DYNAMIC CHENNAI TESTIMONIALS */}
      <section className="py-16 max-w-7xl mx-auto px-margin-mobile sm:px-margin-desktop">
        <div className="text-center mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-[#004d3d]">
            Learner Reviews
          </span>
          <h2 className="mt-2 text-2xl sm:text-3.5xl font-black text-slate-950 tracking-tight">
            What Student Developers in {activeLocation} Say
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-semibold">
            See feedback from our community of learners who switched to live online classes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {LOCAL_TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-1.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <HiMiniStar key={s} className="text-sm fill-amber-400" />
                  ))}
                </div>
                <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-600 font-semibold italic">
                  "{t.text}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-50 text-[#004d3d] border border-emerald-100 grid place-items-center font-black text-xs">
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-900">{t.name}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold truncate">{t.college}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="inline-block rounded-md bg-emerald-100/70 border border-emerald-200/50 px-1.5 py-0.5 text-[8px] font-black text-emerald-800 uppercase tracking-wider">
                      {t.company}
                    </span>
                    <span className="text-[9px] font-black text-slate-700">{t.salary}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. DETAILED ACCORDION FAQS */}
      <section className="py-16 bg-slate-100/50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-margin-mobile sm:px-margin-desktop">
          <div className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#004d3d]">
              Got Questions?
            </span>
            <h2 className="mt-2 text-2xl sm:text-3.5xl font-black text-slate-950 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-semibold">
              Get answers about our syllabus model, location logistics, and live mentorship classes in {activeLocation}.
            </p>
          </div>

          <div className="space-y-4">
            {faqsList.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-slate-300 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left text-sm sm:text-base font-extrabold text-slate-800 hover:text-slate-950 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <FiChevronDown
                      className={[
                        "text-slate-400 shrink-0 text-lg transition-transform duration-300",
                        isOpen ? "rotate-180 text-emerald-800" : "",
                      ].join(" ")}
                    />
                  </button>
                  <div
                    className={[
                      "transition-all duration-300 ease-in-out overflow-hidden border-t border-slate-50",
                      isOpen ? "max-h-[350px] bg-slate-50/50" : "max-h-0",
                    ].join(" ")}
                  >
                    <p className="p-5 text-xs sm:text-sm font-medium leading-relaxed text-slate-600">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. CTA SECTION */}
      <section className="bg-[#004d3d] text-white py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="max-w-3xl mx-auto px-margin-mobile relative z-10 space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black text-[#54d410] tracking-tight">
            Unlock Your Engineering Potential
          </h2>
          <p className="text-emerald-100/80 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-semibold">
            Join other ambitious student developers from colleges around {activeLocation}. Sign up for LurnStack free trial classes and master coding from working software engineers today.
          </p>
          <div className="pt-2">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#54d410] text-[#004d3d] font-black text-sm rounded-xl hover:scale-103 transition-all shadow-xl"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

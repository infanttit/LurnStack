import {
  getTrainerCourseById,
  getTrainerCourses,
  getTrainerLiveClassesByCourse,
} from "../../trainers/model/trainerContentStorage";

export const TABS = [
  "Artificial Intelligence (AI)",
  "Python",
  "Microsoft Excel",
  "AI Agents & Agentic AI",
  "Digital Marketing",
  "Amazon AWS",
];

export const COURSES_BY_TAB = {
  "Artificial Intelligence (AI)": [
    {
      id: 1,
      thumbnail: null,
      thumbnailBg: "from-blue-900 via-blue-700 to-cyan-500",
      title: "The AI Engineer Course 2026: Complete AI Engineer Bootcamp",
      instructor: "365 Careers",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.6,
      ratingCount: "20,061 ratings",
      price: "₹459.00",
      oldPrice: "₹3,089.00",
      hours: "29.5 total hours",
      level: "All Levels",
      updated: "April 2026",
      description:
        "Complete AI Engineer Training: Python, NLP, Transformers, LLMs, LangChain, Hugging Face, APIs",
      bullets: [
        "The course provides the entire toolbox you need to become an AI Engineer",
        "Understand key Artificial Intelligence concepts and build a solid foundation",
        "Start coding in Python and learn how to use it for NLP and AI",
      ],
    },
    {
      id: 2,
      thumbnail: null,
      thumbnailBg: "from-slate-800 via-blue-900 to-indigo-700",
      title: "The Ultimate AI/LLM/ML Penetration Testing Training Course",
      instructor: "Martin Voelk",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.5,
      ratingCount: "966 ratings",
      price: "₹469.00",
      oldPrice: "₹2,849.00",
      hours: "22 total hours",
      level: "Intermediate",
      updated: "March 2026",
      description:
        "Master AI-powered penetration testing techniques and secure modern ML systems against adversarial attacks.",
      bullets: [
        "Learn to attack and defend LLM-based applications",
        "Hands-on labs with real-world AI security scenarios",
        "Earn a professional penetration testing certification",
      ],
    },
    {
      id: 3,
      thumbnail: null,
      thumbnailBg: "from-teal-900 via-cyan-800 to-blue-600",
      title: "SAP AI Masterclass: SAP Generative AI, Joule, AI Core & BTP",
      instructor: "Zequance AI",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.4,
      ratingCount: "640 ratings",
      price: "₹2,299.00",
      oldPrice: null,
      hours: "18 total hours",
      level: "All Levels",
      updated: "February 2026",
      description:
        "Master SAP's Generative AI suite including Joule, AI Core, and Business Technology Platform.",
      bullets: [
        "Build enterprise AI solutions on SAP BTP",
        "Understand Joule's capabilities and integration points",
        "Implement Generative AI in real SAP business scenarios",
      ],
    },
    {
      id: 4,
      thumbnail: null,
      thumbnailBg: "from-gray-200 via-blue-100 to-indigo-200",
      title: "AI for Work & Productivity: All-In-One AI Masterclass 2026",
      instructor: "A. Adli",
      badge: "Highest Rated",
      badgeColor: "bg-orange-100 text-orange-800",
      rating: 4.6,
      ratingCount: "45 ratings",
      price: "₹449.00",
      oldPrice: "₹799.00",
      hours: "14 total hours",
      level: "Beginner",
      updated: "April 2026",
      description:
        "Boost your productivity with the latest AI tools: ChatGPT, Claude, Gemini, Midjourney & more.",
      bullets: [
        "Master 20+ AI tools used by top professionals",
        "Automate repetitive tasks and save hours every week",
        "Build AI-powered workflows for any industry",
      ],
    },
  ],
  Python: [
    {
      id: 101,
      thumbnail: null,
      thumbnailBg: "from-purple-900 via-fuchsia-800 to-pink-600",
      title: "Python Mastery 2026: From Zero to Hero (Projects Included)",
      instructor: "Jose Portilla",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.7,
      ratingCount: "224,000 ratings",
      price: "₹499.00",
      oldPrice: "₹3,499.00",
      hours: "42 total hours",
      level: "Beginner",
      updated: "April 2026",
      description:
        "Learn Python by building real projects. Cover fundamentals, automation, data analysis, and web basics.",
      bullets: [
        "Write Python confidently with core fundamentals",
        "Build automation scripts and small tools",
        "Create portfolio-ready mini projects",
      ],
    },
    {
      id: 102,
      thumbnail: null,
      thumbnailBg: "from-slate-900 via-emerald-800 to-teal-500",
      title: "Data Science with Python: Pandas, NumPy, Matplotlib & ML",
      instructor: "Dr. Sarah Mitchell",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.6,
      ratingCount: "12,340 ratings",
      price: "₹599.00",
      oldPrice: "₹2,199.00",
      hours: "31 total hours",
      level: "Intermediate",
      updated: "January 2026",
      description:
        "Learn data analysis and machine learning workflows with practical exercises and real datasets.",
      bullets: [
        "Clean and analyze real-world data",
        "Visualize insights with charts and dashboards",
        "Train and evaluate ML models end-to-end",
      ],
    },
    {
      id: 103,
      thumbnail: null,
      thumbnailBg: "from-amber-500 via-orange-500 to-red-500",
      title: "Python Automation: Scripts that Save You Hours",
      instructor: "Angela Yu",
      badge: "Highest Rated",
      badgeColor: "bg-orange-100 text-orange-800",
      rating: 4.8,
      ratingCount: "8,240 ratings",
      price: "₹399.00",
      oldPrice: "₹1,499.00",
      hours: "16 total hours",
      level: "All Levels",
      updated: "March 2026",
      description:
        "Automate emails, spreadsheets, web tasks, file processing and more with Python scripting.",
      bullets: [
        "Automate workflows with Python scripts",
        "Work with files, web scraping, and APIs",
        "Build reusable utilities for daily work",
      ],
    },
    {
      id: 104,
      thumbnail: null,
      thumbnailBg: "from-blue-950 via-indigo-900 to-violet-800",
      title: "Django + React Fullstack: Build and Deploy Modern Apps",
      instructor: "Maximilian Schwarzmüller",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.6,
      ratingCount: "5,120 ratings",
      price: "₹699.00",
      oldPrice: "₹2,999.00",
      hours: "28 total hours",
      level: "Intermediate",
      updated: "February 2026",
      description:
        "Build production-style fullstack applications using Django REST Framework and React with deployment.",
      bullets: [
        "Design REST APIs with DRF",
        "Build modern UI with React",
        "Deploy fullstack apps confidently",
      ],
    },
  ],
  "Microsoft Excel": [
    {
      id: 201,
      thumbnail: null,
      thumbnailBg: "from-emerald-900 via-green-700 to-lime-500",
      title: "Microsoft Excel 2026: The Complete Excel Masterclass",
      instructor: "Chris Dutton",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.7,
      ratingCount: "98,100 ratings",
      price: "₹449.00",
      oldPrice: "₹2,499.00",
      hours: "25 total hours",
      level: "Beginner",
      updated: "May 2026",
      description:
        "Master Excel formulas, pivots, charts, dashboards, and automation with practical exercises.",
      bullets: [
        "Build dashboards and reports",
        "Master formulas and pivot tables",
        "Work faster with shortcuts and automation",
      ],
    },
  ],
  "AI Agents & Agentic AI": [
    {
      id: 301,
      thumbnail: null,
      thumbnailBg: "from-slate-900 via-sky-900 to-cyan-600",
      title: "Agentic AI Systems: Build Multi-Agent Workflows",
      instructor: "Andrew Ng",
      badge: "New",
      badgeColor: "bg-emerald-100 text-emerald-900",
      rating: 4.7,
      ratingCount: "1,240 ratings",
      price: "₹899.00",
      oldPrice: "₹3,999.00",
      hours: "19 total hours",
      level: "Intermediate",
      updated: "April 2026",
      description:
        "Design, evaluate, and ship agentic workflows using modern LLM tooling and best practices.",
      bullets: [
        "Build reliable multi-agent orchestration",
        "Add tools, memory, and evaluation loops",
        "Ship production-ready patterns",
      ],
    },
  ],
  "Digital Marketing": [
    {
      id: 401,
      thumbnail: null,
      thumbnailBg: "from-orange-600 via-rose-500 to-pink-500",
      title: "Digital Marketing 2026: SEO, Ads, Content & Analytics",
      instructor: "Alex Thorne",
      badge: "Highest Rated",
      badgeColor: "bg-orange-100 text-orange-800",
      rating: 4.8,
      ratingCount: "32,800 ratings",
      price: "₹499.00",
      oldPrice: "₹2,199.00",
      hours: "20 total hours",
      level: "Beginner",
      updated: "March 2026",
      description:
        "A practical end-to-end marketing program covering growth, SEO, paid ads, and analytics.",
      bullets: [
        "Plan SEO & content strategy",
        "Run paid campaigns with confidence",
        "Measure growth using analytics",
      ],
    },
  ],
  "Amazon AWS": [
    {
      id: 501,
      thumbnail: null,
      thumbnailBg: "from-slate-900 via-yellow-700 to-amber-500",
      title: "AWS Cloud Practitioner + Foundations (2026)",
      instructor: "Stephane Maarek",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.7,
      ratingCount: "64,200 ratings",
      price: "₹549.00",
      oldPrice: "₹2,799.00",
      hours: "15 total hours",
      level: "Beginner",
      updated: "May 2026",
      description:
        "Start your cloud journey with AWS fundamentals, services, and exam-focused practice.",
      bullets: [
        "Understand core AWS services",
        "Learn pricing, security, and architecture basics",
        "Prepare for Cloud Practitioner exam",
      ],
    },
  ],
};

export function getAllCourses() {
  const catalogCourses = Object.entries(COURSES_BY_TAB).flatMap(([tab, courses]) =>
    (courses || []).map((c) => ({ ...c, tab }))
  );
  return [...getTrainerCourses(), ...catalogCourses];
}

export function getCourseTabs() {
  const trainerTabs = getTrainerCourses().map((course) => course.tab).filter(Boolean);
  return trainerTabs.length ? [...new Set(trainerTabs)] : ["Live Classes"];
}

export function getCoursesByTab(tab) {
  const trainerCourses = getTrainerCourses().filter((course) => course.tab === tab);
  return trainerCourses;
}

export function getCourseById(courseId) {
  const id = String(courseId);
  return getTrainerCourseById(id) || getAllCourses().find((c) => String(c.id) === id) || null;
}

export function getCourseLiveClasses(courseId) {
  return getTrainerLiveClassesByCourse(courseId);
}

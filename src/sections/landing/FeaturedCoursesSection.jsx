import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { HiMiniStar, HiChevronRight } from "react-icons/hi2";
import { HiCheck } from "react-icons/hi";
import { useCart, emitCartFlyFromElement, parseINRPriceToPaise } from "../../cart";

/**
 * FeaturedCoursesSection
 * Matches the Udemy-style layout exactly:
 * - Category tab bar with active underline
 * - Course cards: thumbnail, title, instructor, badge, rating, price
 * - Hover popup (appears to the right of the card) with details + Add to cart
 * - "Show all …" link at the bottom
 * Colors use your existing green theme
 *
 * HOW TO USE IMAGES:
 * Import your thumbnail images and set the `thumbnail` field on each course:
 *   import aiImg from "../assets/courses/ai.jpg";
 *   { ..., thumbnail: aiImg }
 */

// ── DATA ─────────────────────────────────────────────────────────────────────

const TABS = [
  "Artificial Intelligence (AI)",
  "Python",
  "Microsoft Excel",
  "AI Agents & Agentic AI",
  "Digital Marketing",
  "Amazon AWS",
];

const COURSES_BY_TAB = {
  "Artificial Intelligence (AI)": [
    {
      id: 1,
      thumbnail: null, // ← import & set your image here
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
      thumbnailBg: "from-yellow-900 via-amber-700 to-orange-500",
      title: "Python for Data Analysis 2026: Pandas, NumPy, Matplotlib",
      instructor: "DataForge Academy",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.7,
      ratingCount: "31,482 ratings",
      price: "₹499.00",
      oldPrice: "₹2,999.00",
      hours: "26 total hours",
      level: "All Levels",
      updated: "April 2026",
      description:
        "Master Python for data analysis: clean data, build reports, and visualize insights with real datasets.",
      bullets: [
        "Analyze data with Pandas and NumPy from day one",
        "Create publication-ready charts and dashboards",
        "Work on projects: sales analytics, cohort analysis, and KPIs",
      ],
    },
    {
      id: 102,
      thumbnail: null,
      thumbnailBg: "from-slate-900 via-indigo-900 to-purple-700",
      title: "Django REST APIs: Build, Secure & Deploy in 2026",
      instructor: "R. Mehta",
      badge: "Highest Rated",
      badgeColor: "bg-orange-100 text-orange-800",
      rating: 4.6,
      ratingCount: "8,914 ratings",
      price: "₹479.00",
      oldPrice: "₹2,499.00",
      hours: "21 total hours",
      level: "Intermediate",
      updated: "March 2026",
      description:
        "Build production-ready REST APIs with authentication, pagination, testing, and deployment best practices.",
      bullets: [
        "JWT auth + role-based permissions",
        "Write tests for APIs and serialize complex data",
        "Deploy with CI/CD and environment-based settings",
      ],
    },
    {
      id: 103,
      thumbnail: null,
      thumbnailBg: "from-emerald-900 via-teal-800 to-cyan-500",
      title: "Python Automation: Scripts for Work (Files, Web, Emails) — 2026",
      instructor: "Automation Lab",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.5,
      ratingCount: "14,207 ratings",
      price: "₹459.00",
      oldPrice: "₹1,999.00",
      hours: "15.5 total hours",
      level: "Beginner",
      updated: "February 2026",
      description:
        "Automate repetitive tasks with Python: file workflows, browser automation, Excel/CSV pipelines, and email reports.",
      bullets: [
        "Build time-saving automation scripts quickly",
        "Scrape websites responsibly and schedule jobs",
        "Generate weekly reports from real inputs",
      ],
    },
    {
      id: 104,
      thumbnail: null,
      thumbnailBg: "from-gray-900 via-slate-800 to-gray-600",
      title: "Interview Prep: Data Structures & Algorithms in Python (2026)",
      instructor: "Interview Sprint",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.6,
      ratingCount: "11,039 ratings",
      price: "₹499.00",
      oldPrice: "₹2,799.00",
      hours: "34 total hours",
      level: "Intermediate",
      updated: "January 2026",
      description:
        "Ace coding interviews with curated patterns, practice problems, and step-by-step solutions in Python.",
      bullets: [
        "Master common patterns: two pointers, sliding window, BFS/DFS",
        "Practice with timed sets and review strategies",
        "Write clean, optimized solutions with confidence",
      ],
    },
  ],
  "Microsoft Excel": [
    {
      id: 201,
      thumbnail: null,
      thumbnailBg: "from-green-900 via-emerald-700 to-teal-500",
      title: "Microsoft Excel 2026: From Beginner to Advanced (Pivot, XLOOKUP)",
      instructor: "Office Skills Pro",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.7,
      ratingCount: "52,118 ratings",
      price: "₹449.00",
      oldPrice: "₹2,499.00",
      hours: "19 total hours",
      level: "All Levels",
      updated: "April 2026",
      description:
        "Learn Excel the practical way: formulas, dashboards, pivots, and real business reporting.",
      bullets: [
        "Build dashboards with PivotTables and charts",
        "Use XLOOKUP, dynamic arrays, and data validation",
        "Clean data using Power Query basics",
      ],
    },
    {
      id: 202,
      thumbnail: null,
      thumbnailBg: "from-slate-800 via-emerald-800 to-lime-500",
      title: "Excel Financial Modeling: Templates, KPIs & Forecasting (2026)",
      instructor: "FinanceCraft",
      badge: "Highest Rated",
      badgeColor: "bg-orange-100 text-orange-800",
      rating: 4.6,
      ratingCount: "9,662 ratings",
      price: "₹499.00",
      oldPrice: "₹2,999.00",
      hours: "24 total hours",
      level: "Intermediate",
      updated: "March 2026",
      description:
        "Build end-to-end models with scenario analysis, assumptions, KPIs, and investor-ready outputs.",
      bullets: [
        "3-statement modeling essentials",
        "Scenario analysis with sensitivity tables",
        "Professional formatting + model hygiene",
      ],
    },
    {
      id: 203,
      thumbnail: null,
      thumbnailBg: "from-zinc-900 via-green-900 to-emerald-500",
      title: "Excel for Data Analytics: Power Query + Pivot + Charts (2026)",
      instructor: "Analytics Hub",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.5,
      ratingCount: "6,408 ratings",
      price: "₹459.00",
      oldPrice: "₹1,999.00",
      hours: "16.5 total hours",
      level: "Beginner",
      updated: "February 2026",
      description:
        "Turn messy spreadsheets into clean datasets and insightful dashboards using modern Excel features.",
      bullets: [
        "Import and clean data with Power Query",
        "Create reusable pivot dashboards",
        "Present results with clean visual design",
      ],
    },
    {
      id: 204,
      thumbnail: null,
      thumbnailBg: "from-emerald-950 via-teal-900 to-cyan-700",
      title: "Excel VBA Macros: Automate Reports & Workflows (2026)",
      instructor: "Macro Masters",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.4,
      ratingCount: "4,991 ratings",
      price: "₹479.00",
      oldPrice: "₹2,299.00",
      hours: "18 total hours",
      level: "Intermediate",
      updated: "January 2026",
      description:
        "Automate repetitive reporting with VBA: build macros, user forms, and clean reusable routines.",
      bullets: [
        "Record and write macros properly",
        "Create buttons, forms, and reusable modules",
        "Automate monthly reporting end-to-end",
      ],
    },
  ],
  "AI Agents & Agentic AI": [
    {
      id: 301,
      thumbnail: null,
      thumbnailBg: "from-slate-900 via-purple-900 to-fuchsia-600",
      title: "AI Agents in 2026: Build Multi-Agent Systems with Tools & Memory",
      instructor: "AgentWorks",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.6,
      ratingCount: "7,432 ratings",
      price: "₹499.00",
      oldPrice: "₹2,999.00",
      hours: "17 total hours",
      level: "All Levels",
      updated: "April 2026",
      description:
        "Design reliable agent workflows: tool use, memory, planning, evaluation, and safe execution patterns.",
      bullets: [
        "Build tool-using agents with function calling patterns",
        "Add memory, retrieval, and structured outputs",
        "Evaluate agent quality and reduce hallucinations",
      ],
    },
    {
      id: 302,
      thumbnail: null,
      thumbnailBg: "from-indigo-950 via-blue-900 to-cyan-600",
      title: "Agentic AI for Business: Automations, Support Bots & Ops (2026)",
      instructor: "OpsAI Studio",
      badge: "Highest Rated",
      badgeColor: "bg-orange-100 text-orange-800",
      rating: 4.5,
      ratingCount: "2,016 ratings",
      price: "₹459.00",
      oldPrice: "₹1,999.00",
      hours: "12 total hours",
      level: "Beginner",
      updated: "March 2026",
      description:
        "Ship practical agentic workflows for support, operations, and reporting with guardrails and QA.",
      bullets: [
        "Build customer support agents with escalation",
        "Create internal ops copilots for SOPs and reports",
        "Add guardrails, policies, and audit trails",
      ],
    },
    {
      id: 303,
      thumbnail: null,
      thumbnailBg: "from-zinc-900 via-slate-800 to-indigo-700",
      title: "RAG + Agents: Retrieval, Citations, and Tool Use (2026)",
      instructor: "LLM Systems Lab",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.5,
      ratingCount: "3,724 ratings",
      price: "₹479.00",
      oldPrice: "₹2,299.00",
      hours: "14.5 total hours",
      level: "Intermediate",
      updated: "February 2026",
      description:
        "Combine RAG and agent patterns: retrieval pipelines, prompt routing, citations, and robust tool calling.",
      bullets: [
        "Index data and retrieve the right context",
        "Add citations and structured answers",
        "Use tools safely with validation steps",
      ],
    },
    {
      id: 304,
      thumbnail: null,
      thumbnailBg: "from-gray-900 via-emerald-900 to-teal-700",
      title: "Agent Evaluation & Monitoring: Metrics, Traces, Regression Tests (2026)",
      instructor: "Quality AI",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.4,
      ratingCount: "1,184 ratings",
      price: "₹449.00",
      oldPrice: "₹1,499.00",
      hours: "9 total hours",
      level: "Intermediate",
      updated: "January 2026",
      description:
        "Measure and improve agent quality with evaluation datasets, traces, and automated regression testing.",
      bullets: [
        "Define success metrics and failure taxonomies",
        "Create eval sets and run regressions",
        "Monitor production behavior with traces",
      ],
    },
  ],
  "Digital Marketing": [
    {
      id: 401,
      thumbnail: null,
      thumbnailBg: "from-orange-900 via-amber-700 to-yellow-500",
      title: "Digital Marketing 2026: SEO, Ads, Content & Analytics (Full Stack)",
      instructor: "Growth School",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.6,
      ratingCount: "28,705 ratings",
      price: "₹459.00",
      oldPrice: "₹2,799.00",
      hours: "23 total hours",
      level: "All Levels",
      updated: "April 2026",
      description:
        "Learn modern marketing: SEO foundations, paid ads, content systems, and reporting dashboards.",
      bullets: [
        "Build a complete marketing plan for a real product",
        "Set up tracking, KPIs, and reporting dashboards",
        "Run SEO + PPC campaigns with best practices",
      ],
    },
    {
      id: 402,
      thumbnail: null,
      thumbnailBg: "from-slate-900 via-emerald-900 to-lime-500",
      title: "SEO in 2026: Technical SEO + Content Strategy + EEAT",
      instructor: "Search Lab",
      badge: "Highest Rated",
      badgeColor: "bg-orange-100 text-orange-800",
      rating: 4.5,
      ratingCount: "6,012 ratings",
      price: "₹449.00",
      oldPrice: "₹1,999.00",
      hours: "14 total hours",
      level: "Intermediate",
      updated: "March 2026",
      description:
        "Rank consistently with a technical + content system: audits, on-page, internal linking, and topical authority.",
      bullets: [
        "Run an SEO audit and fix core issues",
        "Plan content clusters for topical authority",
        "Improve conversions with search intent mapping",
      ],
    },
    {
      id: 403,
      thumbnail: null,
      thumbnailBg: "from-indigo-900 via-purple-900 to-pink-600",
      title: "Performance Marketing: Meta + Google Ads + Creative Testing (2026)",
      instructor: "AdOps Academy",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.4,
      ratingCount: "4,421 ratings",
      price: "₹479.00",
      oldPrice: "₹2,299.00",
      hours: "18 total hours",
      level: "Intermediate",
      updated: "February 2026",
      description:
        "Launch and optimize paid campaigns with a testing framework: creatives, audiences, budgets, and attribution.",
      bullets: [
        "Set up campaigns with clean naming + structure",
        "Creative testing loops and iteration cadence",
        "Attribution basics and performance reporting",
      ],
    },
    {
      id: 404,
      thumbnail: null,
      thumbnailBg: "from-slate-800 via-gray-700 to-slate-600",
      title: "Marketing Analytics: GA4, Funnels, Cohorts & Dashboards (2026)",
      instructor: "Metrics Studio",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.5,
      ratingCount: "2,608 ratings",
      price: "₹459.00",
      oldPrice: "₹1,799.00",
      hours: "12.5 total hours",
      level: "Beginner",
      updated: "January 2026",
      description:
        "Measure what matters: set up GA4 events, build funnels, and report growth metrics clearly.",
      bullets: [
        "Track events and conversions properly",
        "Build funnels and cohort reports",
        "Create a weekly growth KPI dashboard",
      ],
    },
  ],
  "Amazon AWS": [
    {
      id: 501,
      thumbnail: null,
      thumbnailBg: "from-slate-900 via-blue-900 to-cyan-500",
      title: "AWS Cloud Practitioner (CLF-C02) — Full Course + Practice (2026)",
      instructor: "CloudCore",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.7,
      ratingCount: "44,803 ratings",
      price: "₹499.00",
      oldPrice: "₹3,199.00",
      hours: "20 total hours",
      level: "Beginner",
      updated: "April 2026",
      description:
        "Pass AWS Cloud Practitioner with clear explanations, exam strategy, and hands-on fundamentals.",
      bullets: [
        "Understand core AWS services and pricing models",
        "Security, IAM basics, and shared responsibility model",
        "Practice questions + exam-ready summaries",
      ],
    },
    {
      id: 502,
      thumbnail: null,
      thumbnailBg: "from-gray-900 via-slate-800 to-indigo-700",
      title: "AWS Solutions Architect Associate (SAA-C03) — Hands-on Labs (2026)",
      instructor: "Architect Path",
      badge: "Highest Rated",
      badgeColor: "bg-orange-100 text-orange-800",
      rating: 4.6,
      ratingCount: "18,216 ratings",
      price: "₹499.00",
      oldPrice: "₹3,499.00",
      hours: "31 total hours",
      level: "Intermediate",
      updated: "March 2026",
      description:
        "Design scalable AWS architectures: VPC, EC2, S3, RDS, ELB, Auto Scaling, and well-architected best practices.",
      bullets: [
        "Design and troubleshoot VPC networking",
        "Build resilient workloads with scaling and HA",
        "Hands-on labs + architecture review sessions",
      ],
    },
    {
      id: 503,
      thumbnail: null,
      thumbnailBg: "from-emerald-950 via-teal-900 to-cyan-700",
      title: "Deploy Web Apps on AWS: CI/CD, Docker, ECS & Load Balancers (2026)",
      instructor: "DevOps Launchpad",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.5,
      ratingCount: "5,420 ratings",
      price: "₹479.00",
      oldPrice: "₹2,499.00",
      hours: "16 total hours",
      level: "Intermediate",
      updated: "February 2026",
      description:
        "Ship production deployments with AWS services: containers, pipelines, secrets, and monitoring.",
      bullets: [
        "Containerize apps and deploy to ECS",
        "Set up CI/CD pipelines for reliable releases",
        "Monitoring, logs, and rollback strategies",
      ],
    },
    {
      id: 504,
      thumbnail: null,
      thumbnailBg: "from-zinc-900 via-slate-900 to-gray-700",
      title: "AWS Security Fundamentals: IAM, KMS, VPC, and Best Practices (2026)",
      instructor: "Secure Cloud",
      badge: "Bestseller",
      badgeColor: "bg-[#eceb98] text-[#3d3c0a]",
      rating: 4.4,
      ratingCount: "3,108 ratings",
      price: "₹459.00",
      oldPrice: "₹1,999.00",
      hours: "11 total hours",
      level: "All Levels",
      updated: "January 2026",
      description:
        "Learn AWS security essentials: identity, encryption, network controls, and secure-by-default patterns.",
      bullets: [
        "IAM policies and least-privilege patterns",
        "Encryption with KMS and secrets management",
        "Secure VPC networking and access control",
      ],
    },
  ],
};

// ── STAR RATING ───────────────────────────────────────────────────────────────
function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <HiMiniStar
          key={s}
          className={`text-sm ${
            s <= Math.round(rating) ? "text-[#f69c08]" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

// ── HOVER POPUP ───────────────────────────────────────────────────────────────
function CoursePopup({ course, side, onAddToCart, onViewDetails }) {
  return (
    <div
      className={`
        absolute top-0 z-50 w-[340px] bg-white border border-gray-200
        shadow-2xl rounded-sm p-5 flex flex-col gap-3
        ${side === "right" ? "left-[calc(100%+12px)]" : "right-[calc(100%+12px)]"}
      `}
      style={{ minWidth: 320 }}
    >
      {/* Arrow pointer */}
      <div
        className={`absolute top-6 w-3 h-3 bg-white border-gray-200 rotate-45
          ${side === "right"
            ? "-left-[7px] border-b-0 border-r-0 border border-l border-t"
            : "-right-[7px] border-t-0 border-l-0 border border-r border-b"
          }`}
      />

      <h4 className="font-bold text-[15px] text-gray-900 leading-snug">
        {course.title}
      </h4>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm ${course.badgeColor}`}>
          {course.badge}
        </span>
        <span className="text-[12px] text-gray-500">
          Updated{" "}
          <span className="font-semibold text-[#059669]">{course.updated}</span>
        </span>
      </div>

      <p className="text-[12px] text-gray-500">
        {course.hours} · {course.level} · Subtitles
      </p>

      <p className="text-[13px] text-gray-700 leading-snug">
        {course.description}
      </p>

      <ul className="flex flex-col gap-2">
        {course.bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2">
            <HiCheck className="text-gray-800 mt-0.5 flex-shrink-0 text-[14px]" />
            <span className="text-[13px] text-gray-700 leading-snug">{b}</span>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-2 gap-2 mt-1">
        <button
          type="button"
          onClick={onAddToCart}
          className="w-full bg-[#059669] hover:bg-[#047857] text-white font-bold text-[14px] py-3 rounded-sm transition-colors"
        >
          Add to cart
        </button>
        <button
          type="button"
          onClick={onViewDetails}
          className="w-full border border-gray-200 hover:bg-gray-50 text-gray-900 font-bold text-[14px] py-3 rounded-sm transition-colors"
        >
          View details
        </button>
      </div>
    </div>
  );
}

function CourseModal({ course, onClose, onAddToCart, onViewDetails }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[999]">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative h-full w-full flex items-end sm:items-center justify-center p-3 sm:p-6">
        <div className="relative w-full sm:max-w-[560px] bg-white border border-gray-200 shadow-2xl rounded-xl p-5 max-h-[85vh] overflow-auto">
          <div className="flex items-start justify-between gap-4">
            <h4 className="font-bold text-[15px] text-gray-900 leading-snug pr-6">
              {course.title}
            </h4>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center text-gray-700"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-3">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm ${course.badgeColor}`}>
              {course.badge}
            </span>
            <span className="text-[12px] text-gray-500">
              Updated{" "}
              <span className="font-semibold text-[#059669]">{course.updated}</span>
            </span>
          </div>

          <p className="text-[12px] text-gray-500 mt-2">
            {course.hours} · {course.level} · Subtitles
          </p>

          <p className="text-[13px] text-gray-700 leading-snug mt-3">
            {course.description}
          </p>

          <ul className="flex flex-col gap-2 mt-4">
            {course.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <HiCheck className="text-gray-800 mt-0.5 flex-shrink-0 text-[14px]" />
                <span className="text-[13px] text-gray-700 leading-snug">{b}</span>
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-2 gap-2 mt-5">
            <button
              type="button"
              onClick={onAddToCart}
              className="w-full bg-[#059669] hover:bg-[#047857] text-white font-bold text-[14px] py-3 rounded-sm transition-colors"
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={onViewDetails}
              className="w-full border border-gray-200 hover:bg-gray-50 text-gray-900 font-bold text-[14px] py-3 rounded-sm transition-colors"
            >
              View details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── COURSE CARD ───────────────────────────────────────────────────────────────
function CourseCard({ course, index, total, onOpenMobile }) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef(null);
  const [popupSide, setPopupSide] = useState("right");
  const supportsHover = useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches ?? true;
  }, []);

  useEffect(() => {
    if (hovered && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.right;
      setPopupSide(spaceRight < 360 ? "left" : "right");
    }
  }, [hovered]);

  return (
    <div
      ref={cardRef}
      className="relative border border-gray-200 bg-white rounded-sm cursor-pointer"
      onMouseEnter={supportsHover ? () => setHovered(true) : undefined}
      onMouseLeave={supportsHover ? () => setHovered(false) : undefined}
      onClick={!supportsHover ? () => onOpenMobile?.(course) : undefined}
      style={{ boxShadow: hovered ? "0 0 0 2px #059669" : undefined }}
    >
      {/* Thumbnail */}
      <div className="w-full aspect-[16/9] overflow-hidden bg-gray-100">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${course.thumbnailBg}`} />
        )}
      </div>

      {/* Card body */}
      <div className="p-3 flex flex-col gap-1.5">
        <h3 className="font-bold text-[14px] text-gray-900 leading-snug line-clamp-2">
          {course.title}
        </h3>
        <p className="text-[12px] text-gray-500">{course.instructor}</p>

        {/* Rating row */}
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[13px] text-[#b4690e]">{course.rating}</span>
          <StarRating rating={course.rating} />
          <span className="text-[11px] text-gray-500">({course.ratingCount})</span>
        </div>

        {/* Badge */}
        {course.badge && (
          <span className={`self-start text-[11px] font-bold px-2 py-0.5 rounded-sm ${course.badgeColor}`}>
            {course.badge}
          </span>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-bold text-[15px] text-gray-900">{course.price}</span>
          {course.oldPrice && (
            <span className="text-[12px] text-gray-400 line-through">{course.oldPrice}</span>
          )}
        </div>
      </div>

      {/* Hover popup */}
      {supportsHover && hovered && (
        <CoursePopup
          course={course}
          side={popupSide}
          onAddToCart={course.onAddToCart}
          onViewDetails={course.onViewDetails}
        />
      )}
    </div>
  );
}

// ── MAIN SECTION ──────────────────────────────────────────────────────────────
export default function FeaturedCoursesSection() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const courses = useMemo(() => COURSES_BY_TAB[activeTab] ?? [], [activeTab]);
  const [mobileCourse, setMobileCourse] = useState(null);
  const { addItem } = useCart();
  const navigate = useNavigate();

  const addCourseToCart = useCallback((course, fromEl) => {
    addItem({
      id: String(course.id),
      title: course.title,
      instructor: course.instructor,
      thumbnail: course.thumbnail,
      thumbnailBg: course.thumbnailBg,
      unitPricePaise: parseINRPriceToPaise(course.price),
      displayPrice: course.price,
      oldPrice: course.oldPrice || null,
      qty: 1,
    });
    emitCartFlyFromElement(fromEl);
  }, [addItem]);

  const coursesWithActions = useMemo(
    () =>
      courses.map((c) => ({
        ...c,
        onAddToCart: (e) => addCourseToCart(c, e?.currentTarget),
        onViewDetails: () => navigate(`/courses/${c.id}`, { state: { course: c } }),
      })),
    [courses, addCourseToCart, navigate]
  );

  return (
    <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Heading */}
      <h2 className="text-[28px] sm:text-[32px] font-extrabold text-gray-900 mb-1">
        Skills to transform your career and life
      </h2>
      <p className="text-[15px] text-gray-500 mb-6">
        From critical skills to technical topics, Udemy supports your professional development.
      </p>

      {/* Tab bar */}
      <div className="border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-0 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-3 text-[14px] font-medium whitespace-nowrap border-b-2 transition-colors
                ${activeTab === tab
                  ? "border-gray-900 text-gray-900 font-bold"
                  : "border-transparent text-gray-600 hover:text-gray-900"
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Course grid — 4 columns (matches screenshot) */}
      {courses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {coursesWithActions.map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                index={i}
                total={courses.length}
                onOpenMobile={(c) => setMobileCourse(c)}
              />
            ))}
          </div>

          {/* Show all link */}
          <div className="mt-6">
            <button
              type="button"
              className="flex items-center gap-1 text-[#059669] font-bold text-[14px] hover:text-[#047857] hover:underline transition-colors"
            >
              Show all {activeTab} courses
              <HiChevronRight className="text-[16px]" />
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-16 text-gray-400 text-[15px]">
          No courses yet for <span className="font-semibold text-gray-600">{activeTab}</span>.
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {mobileCourse && (
        <CourseModal
          course={mobileCourse}
          onClose={() => setMobileCourse(null)}
          onAddToCart={(e) => {
            addCourseToCart(mobileCourse, e?.currentTarget);
            setMobileCourse(null);
          }}
          onViewDetails={() => {
            navigate(`/courses/${mobileCourse.id}`, { state: { course: mobileCourse } });
            setMobileCourse(null);
          }}
        />
      )}
    </section>
  );
}

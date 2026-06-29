import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { HiMiniStar } from "react-icons/hi2";
import { useAuth } from "../../auth";
import AuthRequiredModal from "../../auth/components/AuthRequiredModal";
import { PATHS } from "../../app/router/paths";
import { useSEO } from "../../shared/hooks/useSEO";
import {
  createStudentSessionBooking,
  getCourseAccessId,
  getPublicSessions,
  getStudentSessions,
  hasPaidAccessForSession,
  joinStudentSession,
  rememberPaidCourseAccess,
  rememberPaidSessionAccess,
  verifyRazorpayPayment,
} from "../api/studentSessionsApi";
import useNow from "../../live-classes/hooks/useNow";
import { formatDuration } from "../../live-classes/lib/time";
import { getSessionOccurrenceTiming, isSessionUnavailable, isClassActiveOnDate, formatRecurringDays } from "../../shared/utils/sessionTiming";
import { openMeetingLink, openPendingMeetingWindow } from "../../shared/utils/meetingWindow";
import { openRazorpayCheckout } from "../../shared/utils/razorpayCheckout";
import { useAttendanceTracking } from "../hooks/useAttendanceTracking";
import { formatAttendanceStatus } from "../api/studentAttendanceApi";
import { formatDecimalHours } from "../../shared/utils/durationFormatter";
import { startAttendanceHeartbeat } from "../utils/attendanceHeartbeat";
import { rememberRecentlyJoinedSession } from "../../my-learning/utils/learningModel";

const COURSE_CATEGORIES = [
  "Trainer Courses",
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "Web Development",
  "Mobile App Development",
  "Programming",
  "Database",
  "DevOps",
  "Cloud Computing",
  "UI/UX Design",
];

const CATEGORY_KEYWORDS = {
  "Trainer Courses": [],
};

const CATEGORY_SUMMARIES = {
  "Trainer Courses": [
    "Join expert-led live sessions built around practical learning, guided practice, and real-time support. These trainer courses help you stay consistent, ask questions during class, and move from concept to confident execution.",
    "Work directly with trainers through focused sessions that combine explanation, examples, and hands-on direction. Each class is designed to help you understand the topic clearly and apply it in realistic project situations.",
    "Build confidence with live instruction, real examples, and structured session-based learning. Trainer courses are useful when you want accountability, mentor guidance, and a clear path for improving your skills.",
    "Explore mentor-led classes designed for practical progress, career-ready skills, and steady learning momentum. You can join scheduled sessions, revisit key concepts, and keep improving with trainer support.",
  ],
  "Frontend Development": [
    "Frontend courses teach responsive interfaces, React patterns, browser fundamentals, and polished user experiences. You will learn how screens are structured, styled, and made interactive for real users across devices.",
    "Learn to turn designs into fast, accessible, and reusable web interfaces. These lessons focus on layouts, components, state, forms, navigation, and the small details that make a product feel professional.",
    "Build modern UI skills with components, layouts, state management, API data, and production-ready workflows. The goal is to help you create frontend experiences that are clean, reliable, and easy to maintain.",
    "Practice frontend thinking through real screens, clean styling, and interactive user flows. You will strengthen the skills needed to build dashboards, landing pages, course pages, and app-style interfaces.",
  ],
  "Backend Development": [
    "Backend courses cover APIs, databases, authentication, server architecture, and production-ready application logic. You will learn how the server handles requests, protects data, and powers frontend features.",
    "Learn to design reliable services, connect data, and protect user workflows. These courses focus on API routes, validation, error handling, permissions, and practical backend decisions used in real apps.",
    "Build strong server-side foundations with routes, models, database operations, security, and clean service structure. The aim is to help you write backend code that is stable, understandable, and scalable.",
    "Practice backend systems through real API patterns, authentication flows, booking logic, payment states, and data relationships. You will understand how application features work behind the screen.",
  ],
  "Full Stack Development": [
    "Full stack courses combine frontend, backend, databases, deployment, and real-world project workflows. You will learn how complete applications are planned, built, connected, tested, and shipped.",
    "Learn how complete applications move from user interface to server logic and storage. These courses help you understand the full journey of a feature, from button click to API call to database update.",
    "Build end-to-end skills through practical projects that connect screens, APIs, authentication, payments, and data. The focus is on becoming comfortable across both client-side and server-side development.",
    "Understand the full product flow from design to deployment with hands-on development. You will practice organizing code, connecting features, debugging issues, and preparing apps for real users.",
  ],
  "Web Development": [
    "Web development courses help you build modern websites and applications using practical, job-ready skills. You will learn page structure, styling, interactivity, responsiveness, and the tools used in current web projects.",
    "Learn the foundations of web pages, layouts, interactivity, and deployment. These courses are useful for building confidence with HTML, CSS, JavaScript, and the way browsers render user experiences.",
    "Practice building useful web experiences with clean structure, responsive design, and interactive features. The lessons are shaped around real tasks like pages, sections, forms, navigation, and content layouts.",
    "Grow from fundamentals to real projects with HTML, CSS, JavaScript, and modern development tools. You will learn how to create websites that look clean, work smoothly, and adapt across screen sizes.",
  ],
  "Mobile App Development": [
    "Mobile app courses focus on app screens, navigation, APIs, performance, and cross-platform development. You will learn how mobile experiences are planned, built, connected to data, and refined for real users.",
    "Learn to build smooth app experiences for real devices with clear navigation, responsive screens, and reliable state handling. These lessons help you think through practical app flows from start to finish.",
    "Practice mobile workflows with screens, state, API data, authentication, lists, forms, and polished interactions. The goal is to help you build apps that feel useful, stable, and easy to use.",
    "Explore app development from interface design to API integration and release-ready structure. You will understand how mobile apps connect with backend services and handle everyday user actions.",
  ],
  Programming: [
    "Programming courses build strong foundations in problem solving, language concepts, and clean code practices. You will learn how to think through problems, write clear logic, and improve through practice.",
    "Strengthen your logic with practical exercises, patterns, and structured thinking. These lessons help you move beyond memorizing syntax and start understanding how programs actually work.",
    "Learn how to break problems down and write code that is easier to understand, test, and improve. You will practice functions, loops, conditions, data structures, and debugging habits.",
    "Build confidence with syntax, control flow, functions, data handling, and step-by-step problem solving. Programming skills support every technical path, from web apps to backend systems.",
  ],
  Database: [
    "Database courses teach data modeling, queries, relationships, optimization, and reliable storage design. You will learn how applications organize information and retrieve it efficiently when users need it.",
    "Learn how applications store, organize, retrieve, and protect important data. These courses explain tables, records, relationships, indexes, and the design choices behind dependable systems.",
    "Practice working with schemas, filters, joins, relationships, and real query patterns. The goal is to make database work feel less mysterious and more connected to application features.",
    "Build database confidence through schema design, query writing, data validation, and performance basics. You will understand how good data structure supports clean backend logic.",
  ],
  DevOps: [
    "DevOps courses cover deployment, automation, cloud workflows, monitoring, and scalable delivery practices. You will learn how teams move code from development to production with more confidence.",
    "Learn how software is shipped reliably with pipelines, environments, versioning, and observability. These courses help you understand the operational side of keeping applications healthy.",
    "Practice deployment thinking through automation, hosting, logs, build steps, and release workflows. The focus is on reducing manual mistakes and making updates easier to manage.",
    "Build operational skills for keeping applications running, monitored, and easy to update. DevOps learning helps connect development work with real production environments.",
  ],
  "Cloud Computing": [
    "Cloud computing courses explain cloud services, hosting, infrastructure, security, and deployment workflows. You will learn how modern applications run beyond a local machine and scale for users.",
    "Learn how applications run on cloud platforms with compute, storage, networking, and managed services. These lessons help you understand the building blocks behind production systems.",
    "Practice cloud fundamentals through hosting, deployment, storage, access control, and infrastructure concepts. The goal is to make cloud workflows feel practical and approachable.",
    "Build confidence with cloud workflows used in real production environments. You will understand how teams deploy, monitor, secure, and scale applications using cloud services.",
  ],
  "UI/UX Design": [
    "UI/UX courses teach research, wireframes, visual systems, prototypes, and product design thinking. You will learn how to shape products that are clear, usable, and visually consistent.",
    "Learn how to design useful products with clear flows, thoughtful screens, and user insight. These courses focus on understanding user needs before turning ideas into interfaces.",
    "Practice design decisions through layouts, hierarchy, interaction patterns, typography, color, and prototypes. The goal is to make every screen easier to understand and use.",
    "Build product design skills that connect user needs with polished interface execution. You will learn how design choices affect navigation, trust, clarity, and user confidence.",
  ],
};

function getKnownCategory(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return COURSE_CATEGORIES.find((category) => category.toLowerCase() === normalized) || "";
}

function courseCategoryPath(category) {
  return `/courses?category=${encodeURIComponent(category)}`;
}

function getCategoryDescriptions(category) {
  return CATEGORY_SUMMARIES[category] || [
    "Explore focused courses, live sessions, and practical learning paths built for steady progress.",
    "Choose a learning path and build skills through practical, guided course sessions.",
    "Find useful lessons, live classes, and structured topics for your next step.",
  ];
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-IN").format(Math.max(0, Number(value) || 0));
}

function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "U";
}

function matchesCategory(course, category) {
  if (!category) return true;
  if (category === "Trainer Courses") return true;
  const normalizedTarget = String(category || "").trim().toLowerCase();
  const explicitCategories = [
    course?.category,
    course?.tab,
    course?.raw?.category,
    course?.raw?.courseCategory,
    course?.raw?.course_category,
    course?.raw?.categoryName,
    course?.raw?.category_name,
    course?.raw?.course?.category,
    course?.raw?.course?.categoryName,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());

  if (explicitCategories.includes(normalizedTarget)) return true;

  const labelCandidates = [
    course?.title,
    course?.classTitle,
    course?.description,
    course?.instructor,
    course?.raw?.title,
    course?.raw?.classTitle,
    course?.raw?.description,
    course?.raw?.trainerName,
    course?.raw?.trainer?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const keywords = CATEGORY_KEYWORDS[category] || [];
  return keywords.length ? keywords.some((keyword) => labelCandidates.includes(String(keyword).toLowerCase())) : false;
}

function getCategoryRank(course) {
  const category =
    COURSE_CATEGORIES.find((item) => item !== "Trainer Courses" && matchesCategory(course, item)) ||
    "Trainer Courses";
  const rank = COURSE_CATEGORIES.indexOf(category);
  return rank >= 0 ? rank : COURSE_CATEGORIES.length;
}

function getCourseSortTime(course) {
  const candidates = [
    course?.liveClass?.scheduledAt,
    course?.scheduledAt,
    course?.dateAdded,
    course?.raw?.scheduledAt,
    course?.raw?.scheduled_at,
    course?.raw?.scheduledDate,
    course?.raw?.date,
    course?.raw?.createdAt,
    course?.raw?.created_at,
  ];
  for (const value of candidates) {
    const time = new Date(value || "").getTime();
    if (Number.isFinite(time) && time > 0) return time;
  }
  return Number.MAX_SAFE_INTEGER;
}

function sortCoursesForDisplay(a, b) {
  const categoryDiff = getCategoryRank(a) - getCategoryRank(b);
  if (categoryDiff !== 0) return categoryDiff;

  const timeDiff = getCourseSortTime(a) - getCourseSortTime(b);
  if (timeDiff !== 0) return timeDiff;

  return String(a?.title || "").localeCompare(String(b?.title || ""));
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <HiMiniStar
          key={s}
          className={`text-sm ${s <= Math.round(rating) ? "text-[#f69c08]" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

function formatLiveWhen(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function liveTimerLabel(liveClass, now) {
  const occurrence = getSessionOccurrenceTiming(liveClass, now, { defaultRecurring: false });
  const { startMs, endMs } = occurrence;
  if (!startMs) return "Schedule pending";
  const activeToday = isClassActiveOnDate(liveClass, new Date(now));
  if (!activeToday) {
    return `Next class scheduled on ${new Date(occurrence.scheduledAt).toLocaleDateString("en-IN", { weekday: "long" })}`;
  }
  if (now > endMs) return "Today's session completed";
  if (now >= startMs && now <= endMs) return "Live now";
  if (now < startMs) return `Join opens when class starts - ${formatDuration(startMs - now)} left`;
  return `Starts in ${formatDuration(startMs - now)}`;
}

function isSessionCompleted(liveClass, now = Date.now()) {
  const { startMs, endMs } = getSessionOccurrenceTiming(liveClass, now, { defaultRecurring: false });
  return startMs > 0 && now > endMs;
}

function CourseGridCard({ course, liveClass, onViewDetails, onJoinClass, onPayForClass, actionId, now }) {
  const isTrainerCourse = !!course.createdByTrainer;
  const isCancelled = String(liveClass?.status || course.status || "").toLowerCase() === "cancelled";
  const unavailable = isSessionUnavailable(liveClass);
  const cancellationReason = liveClass?.cancellationReason || course.cancellationReason || "";
  const joining = actionId === `join:${course.id}`;
  const occurrence = getSessionOccurrenceTiming(liveClass, now, { defaultRecurring: false });
  const { startMs, endMs } = occurrence;
  const isCompleted = isSessionCompleted(liveClass, now);
  const sessionIsFree =
    course.isFree === true ||
    String(course.pricingState || "").trim().toUpperCase() === "FREE" ||
    Number(course.amountPaise || 0) <= 0;
  const hasPaidAccess = course.isPaid === true || hasPaidAccessForSession(course);
  const needsPayment = isTrainerCourse && !sessionIsFree && course.paymentRequired && !hasPaidAccess;
  const paymentReady = sessionIsFree || !course.paymentRequired || hasPaidAccess;
  const paying = actionId === `pay:${course.id}`;
  const activeToday = isClassActiveOnDate(liveClass, new Date(now));
  const canJoin = isTrainerCourse && paymentReady && !unavailable && startMs > 0 && now >= startMs && now <= endMs && activeToday;
  const accessNotice = isCancelled
    ? ""
    : !activeToday
      ? ""
      : isCompleted
        ? ""
        : isTrainerCourse && startMs > 0 && now < startMs
          ? "You can join when the class starts."
          : isTrainerCourse && canJoin
            ? "Join is open now."
            : "";
  const attendanceStatus = course.attendance?.attendanceStatus || course.attendance?.status || course.attendanceStatus || "";
  const attendanceBadgeClass =
    attendanceStatus === "late"
      ? "bg-amber-100 text-amber-800"
      : attendanceStatus === "absent"
        ? "bg-red-100 text-red-700"
        : attendanceStatus === "pending"
          ? "bg-sky-100 text-sky-800"
          : "bg-emerald-100 text-emerald-800";

  return (
    <div className="bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex flex-col">
      <div className="relative w-full aspect-[16/7] overflow-hidden bg-gray-100">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${course.thumbnailBg}`} />
        )}
        <div className="absolute right-2 top-2 overflow-hidden rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-[11px] font-black text-[#00342b] shadow-[0_14px_34px_rgba(3,52,43,0.20)] ring-1 ring-emerald-900/5 animate-priceFloat">
          <span className="absolute inset-y-0 -left-6 w-5 rotate-12 bg-white/80 blur-[2px] animate-priceShine" />
          <span className="relative inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
            {course.price || "Free"}
          </span>
        </div>
      </div>

      <div className="p-2 flex-1 flex flex-col">
        <h3 className="font-extrabold text-[13px] text-gray-900 leading-snug line-clamp-2">
          {course.title}
        </h3>
        <p className="mt-0.5 truncate text-[11px] text-gray-500">{course.instructor}</p>

        {isTrainerCourse && liveClass ? (
          <div className="mt-1 rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-800">
                Live class
              </div>
              {(course.totalHours || course.totalDays) ? (
                <div className="flex items-center flex-wrap gap-x-1.5 text-[9px] text-[#006b58] font-extrabold">
                  {course.totalHours !== null && course.totalHours !== undefined && (
                    <span>
                      {formatDecimalHours(course.completedHours || 0)} / {formatDecimalHours(course.totalHours)}
                    </span>
                  )}
                  {course.totalHours && course.totalDays ? <span className="text-emerald-300 font-bold">•</span> : null}
                  {course.totalDays !== null && course.totalDays !== undefined && (
                    <span>
                      {course.completedDays || 0}/{course.totalDays} Total Days
                    </span>
                  )}
                </div>
              ) : null}
            </div>
            <div className="mt-0.5 truncate text-[11px] font-bold text-gray-800">
              {liveClass.title}
            </div>
            <div className="mt-0.5 truncate text-[10px] text-gray-500 flex items-center gap-1.5 flex-wrap">
              <span>{formatLiveWhen(occurrence.scheduledAt)} IST</span>
              <span>•</span>
              <span>{liveClass.durationMinutes} min</span>
              {occurrence.isRecurring && (
                <>
                  <span>•</span>
                  <span className="rounded-full bg-white px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-emerald-800 ring-1 ring-emerald-100">
                    {formatRecurringDays(liveClass.recurringDays || liveClass.recurring_days)}
                  </span>
                  {(liveClass?.recurrenceEndDate || liveClass?.recurrence_end_date || liveClass?.raw?.recurrenceEndDate || liveClass?.raw?.recurrence_end_date) && (
                    <span className="text-[9.5px] text-slate-500 font-semibold">
                      Until: {new Date(liveClass?.recurrenceEndDate || liveClass?.recurrence_end_date || liveClass?.raw?.recurrenceEndDate || liveClass?.raw?.recurrence_end_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="mt-0.5 truncate text-[10px] font-bold text-emerald-800">
              {isCancelled ? "Cancelled" : liveTimerLabel(liveClass, now)}
            </div>
            {accessNotice ? (
              <div className="mt-0.5 truncate text-[10px] font-semibold text-slate-600">
                {accessNotice}
              </div>
            ) : null}
            {attendanceStatus ? (
              <div className={["mt-1 inline-flex w-fit rounded-full px-2 py-0.5 text-[9px] font-extrabold", attendanceBadgeClass].join(" ")}>
                Attendance: {formatAttendanceStatus(attendanceStatus)}
              </div>
            ) : null}
            {isCancelled && cancellationReason ? (
              <div className="mt-1 rounded-md border border-red-100 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700">
                Reason: {cancellationReason}
              </div>
            ) : null}
          </div>
        ) : null}

        {!isTrainerCourse ? (
          <div className="mt-1 flex items-center gap-1.5">
            <span className="font-bold text-[12px] text-[#b4690e]">{course.rating}</span>
            <StarRating rating={course.rating} />
            <span className="truncate text-[10px] text-gray-500">({course.ratingCount})</span>
          </div>
        ) : null}

        <div className="mt-0.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[14px] text-gray-900">{course.price}</span>
            {course.oldPrice && (
              <span className="text-[12px] text-gray-400 line-through">{course.oldPrice}</span>
            )}
          </div>
          {course.badge && !isCompleted && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${isCompleted ? "bg-slate-100 text-slate-700" : course.badgeColor}`}>
              {course.badge}
            </span>
          )}
        </div>

        <div className={["mt-auto pt-1 grid gap-1.5", isTrainerCourse ? "grid-cols-1 min-[420px]:grid-cols-[1fr_auto]" : "grid-cols-1"].join(" ")}>
          {isTrainerCourse && needsPayment ? (
            <button
              type="button"
              disabled={paying || unavailable}
              onClick={onPayForClass}
              className="h-7 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {paying ? "Opening..." : "Pay Now"}
            </button>
          ) : isTrainerCourse ? (
            <button
              type="button"
              disabled={joining || !canJoin}
              onClick={onJoinClass}
              className="h-7 bg-[#00342b] hover:bg-[#004d40] text-white font-extrabold text-[10px] rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {joining ? "Opening..." : course.isJoined && canJoin ? "Rejoin" : canJoin ? "Join" : !activeToday ? "Locked" : sessionIsFree ? "Locked" : hasPaidAccess ? "Paid" : "Locked"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onViewDetails}
            className="h-7 border border-gray-300 hover:bg-gray-50 text-gray-900 font-extrabold text-[10px] rounded-md transition-colors min-[420px]:px-3"
          >
              See more
            </button>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");
  const [urlSearchParams] = useSearchParams();
  const routeSearchQuery = urlSearchParams.get("q") || "";
  const routeCategory = getKnownCategory(urlSearchParams.get("category"));
  const [activeCategory, setActiveCategory] = useState(routeCategory || COURSE_CATEGORIES[0]);
  const [searchQuery, setSearchQuery] = useState(routeSearchQuery);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const now = useNow(1000);
  const [authPrompt, setAuthPrompt] = useState(null);
  const [categoryDescriptionIndexes, setCategoryDescriptionIndexes] = useState({});
  const { track } = useAttendanceTracking();

  const profileName = user?.fullName || "LurnStack Learner";
  const profileLine = user?.role === "trainer" ? "Trainer" : "Student";
  const showOverviewPanel = activeCategory === "Trainer Courses";

  useSEO({
    title: activeCategory ? `${activeCategory} Courses` : "Courses",
    description: `Browse expert-led ${activeCategory || ""} courses on LurnStack. Live trainer sessions, hands-on practice, and real-world projects.`.trim(),
    keywords: "LurnStack courses, online courses, live classes, web development, database, cloud, UI/UX",
    canonical: "/courses",
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const loader = isAuthenticated ? getStudentSessions() : getPublicSessions();
    loader
      .then((items) => {
        if (cancelled) return;
        setSessions(items);
        const nextActive =
          routeCategory ||
          COURSE_CATEGORIES.find((category) => items.some((course) => matchesCategory(course, category))) ||
          COURSE_CATEGORIES[0];
        setActiveCategory(nextActive);
      })
      .catch((err) => {
        if (!cancelled) {
          setSessions([]);
          setError(isAuthenticated ? err?.message || "Unable to load sessions." : "");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, routeCategory]);

  useEffect(() => {
    setSearchQuery(routeSearchQuery);
  }, [routeSearchQuery]);

  useEffect(() => {
    if (routeCategory) setActiveCategory(routeCategory);
  }, [routeCategory]);

  useEffect(() => {
    setCategoryDescriptionIndexes((prev) => {
      const descriptions = getCategoryDescriptions(activeCategory);
      const nextIndex = ((prev[activeCategory] ?? -1) + 1) % descriptions.length;
      return { ...prev, [activeCategory]: nextIndex };
    });
  }, [activeCategory]);

  useEffect(() => {
    if (!sessions.length) return;
    if (routeCategory) return;
    const hasMatch = sessions.some((course) => matchesCategory(course, activeCategory));
    if (hasMatch) return;
    const nextActive =
      COURSE_CATEGORIES.find((category) => sessions.some((course) => matchesCategory(course, category))) ||
      COURSE_CATEGORIES[0];
    if (nextActive !== activeCategory) setActiveCategory(nextActive);
  }, [activeCategory, routeCategory, sessions]);

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const categorySource = sessions.filter((course) => matchesCategory(course, activeCategory));
    const source = q ? sessions : categorySource.length ? categorySource : sessions;
    return source
      .filter((course) => {
      const matchesSearch =
        !q ||
        course.title.toLowerCase().includes(q) ||
        course.instructor.toLowerCase().includes(q) ||
        String(course.description || "").toLowerCase().includes(q) ||
        String(course.category || course.tab || "").toLowerCase().includes(q);
      return matchesSearch && matchesCategory(course, activeCategory);
      })
      .sort(sortCoursesForDisplay);
  }, [activeCategory, searchQuery, sessions]);

  const otherCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sessions
      .filter((course) => {
        if (matchesCategory(course, activeCategory)) return false;
        const matchesSearch =
          !q ||
          course.title.toLowerCase().includes(q) ||
          course.instructor.toLowerCase().includes(q) ||
          String(course.description || "").toLowerCase().includes(q) ||
          String(course.category || course.tab || "").toLowerCase().includes(q);
        return matchesSearch;
      })
      .sort(sortCoursesForDisplay);
  }, [activeCategory, searchQuery, sessions]);

  const availableCategories = useMemo(() => {
    const seen = new Set();
    return COURSE_CATEGORIES.filter((category) =>
      sessions.some((course) => matchesCategory(course, category))
    ).filter((category) => {
      if (seen.has(category)) return false;
      seen.add(category);
      return true;
    });
  }, [sessions]);

  const categoryIntro = useMemo(() => {
    const categoryCourses = sessions.filter((course) => matchesCategory(course, activeCategory));
    const related = COURSE_CATEGORIES.filter((category) => category !== activeCategory).slice(0, 4);
    const learnerCount = Math.max(1533, categoryCourses.length * 731 + activeCategory.length * 97);
    const sessionCount = Math.max(categoryCourses.length, filteredCourses.length);
    const handsOnCount = categoryCourses.filter((course) => course.createdByTrainer || course.liveClass).length;
    const descriptions = getCategoryDescriptions(activeCategory);
    const descriptionIndex = categoryDescriptionIndexes[activeCategory] ?? 0;

    return {
      title: activeCategory,
      description: descriptions[descriptionIndex % descriptions.length],
      learners: formatCompactNumber(learnerCount),
      sessions: formatCompactNumber(sessionCount),
      handsOn: formatCompactNumber(Math.max(handsOnCount, sessionCount ? 1 : 0)),
      related,
    };
  }, [activeCategory, categoryDescriptionIndexes, filteredCourses.length, sessions]);

  const joinTrainerClass = useCallback(
    async (course) => {
      if (!isAuthenticated) {
        setAuthPrompt({
          title: "Log in to join this class",
          message: "Register or log in first. After authentication, you can return here and join when the session opens.",
          from: `/courses/${encodeURIComponent(String(course.id))}`,
        });
        return;
      }
      const current = Date.now();
      if (isSessionUnavailable(course.liveClass)) {
        setError("This class session is not available.");
        return;
      }
      const occurrence = getSessionOccurrenceTiming(course.liveClass, current, { defaultRecurring: false });
      const { startMs, endMs } = occurrence;
      const activeToday = isClassActiveOnDate(course.liveClass, new Date(current));
      if (!activeToday) {
        setError(`Next class scheduled on ${new Date(occurrence.scheduledAt).toLocaleDateString("en-IN", { weekday: "long" })}.`);
        return;
      }
      if (current > endMs) {
        setError("Today's session has already completed.");
        return;
      }
      if (current < startMs) {
        setError("Join opens when the class starts.");
        return;
      }
      const meetingWindow = openPendingMeetingWindow();
      setActionId(`join:${course.id}`);
      setError("");
      const startTracking = (sessionDate, joinResult = {}) =>
        track({
          sessionId: course.id,
          sessionDate,
          scheduledAt: occurrence.scheduledAt,
          startsAt: occurrence.scheduledAt,
          endsAt: occurrence.endsAt,
          bookingId: joinResult.bookingId || "",
          joinedAt: joinResult.joinedAt || "",
          meetingWindow,
          onAttendance: (attendance) => {
            setSessions((prev) =>
              prev.map((item) =>
                String(item.id) === String(course.id)
                  ? {
                      ...item,
                      attendance,
                      attendanceStatus: attendance?.attendanceStatus || attendance?.status || item.attendanceStatus,
                    }
                  : item
              )
            );
          },
        });
      try {
        const sessionDate = occurrence.scheduledAt ? occurrence.scheduledAt.slice(0, 10) : "";
        const result = await joinStudentSession(course.id, {
          sessionDate,
          scheduledAt: occurrence.scheduledAt,
          startsAt: occurrence.scheduledAt,
          endsAt: occurrence.endsAt,
        });
        rememberRecentlyJoinedSession(course, {
          joinedAt: result?.joinedAt || new Date().toISOString(),
          attendanceStatus: result?.attendance?.attendanceStatus || result?.attendance?.status || "joined",
        });
        setSessions((prev) =>
          prev.map((item) =>
            String(item.id) === String(course.id)
              ? {
                  ...item,
                  isJoined: true,
                  attendance: result?.attendance || item.attendance,
                  attendanceStatus:
                    result?.attendance?.attendanceStatus ||
                    result?.attendance?.status ||
                    item.attendanceStatus,
                  liveClass: {
                    ...item.liveClass,
                    isJoined: true,
                  },
                }
              : item
          )
        );
        const meetingLink = result?.meetingLink || course.liveClass?.meetUrl || course.meetUrl || "";
        if (openMeetingLink(meetingWindow, meetingLink)) {
          startTracking(sessionDate, result);
          setMessage("Opening live class.");
        } else {
          setError("Session joined, but the meeting link was not returned. Please open View details and try again.");
        }
      } catch (err) {
        const fallbackLink = course.liveClass?.meetUrl || course.meetUrl || "";
        if (openMeetingLink(meetingWindow, fallbackLink)) {
          setError(err?.message || "Attendance could not be recorded. Please try again during the active class time.");
        } else {
          meetingWindow?.close?.();
          setError(err?.message || "Unable to join session.");
        }
      } finally {
        setActionId("");
      }
    },
    [isAuthenticated]
  );

  const payForTrainerClass = useCallback(
    async (course) => {
      if (!isAuthenticated) {
        setAuthPrompt({
          title: "Log in to pay for this class",
          message: "Register or log in first. After payment verification, you can join when the session opens.",
          from: `/courses/${encodeURIComponent(String(course.id))}`,
        });
        return;
      }
      const current = Date.now();
      if (isSessionUnavailable(course.liveClass)) {
        setError("This class session is not available.");
        return;
      }
      const occurrence = getSessionOccurrenceTiming(course.liveClass, current, { defaultRecurring: false });

      setActionId(`pay:${course.id}`);
      setError("");
      try {
        const sessionDate = occurrence.scheduledAt ? occurrence.scheduledAt.slice(0, 10) : "";
        const courseAccessId = getCourseAccessId(course) || course.id;
        const booking = await createStudentSessionBooking(course.id, {
          sessionDate,
          courseId: courseAccessId,
        });
        if (!booking.alreadyPaid) {
          const payment = await openRazorpayCheckout({
            keyId: booking.keyId,
            amountPaise: booking.amountPaise || course.amountPaise,
            currency: booking.currency || course.currency || "INR",
            razorpayOrderId: booking.razorpayOrderId,
            sessionTitle: course.title,
            student: booking.student,
          });
          await verifyRazorpayPayment({
            bookingId: booking.bookingId,
            razorpayOrderId: payment.razorpay_order_id || booking.razorpayOrderId,
            razorpayPaymentId: payment.razorpay_payment_id,
            razorpaySignature: payment.razorpay_signature,
            sessionId: course.id,
            courseId: booking.courseAccessId || courseAccessId,
          });
        }
        rememberPaidSessionAccess(course.id);
        rememberPaidCourseAccess(booking.courseAccessId || courseAccessId, {
          sessionId: course.id,
        });
        setSessions((prev) =>
          prev.map((item) =>
            String(item.id) === String(course.id) ||
            (!!courseAccessId && getCourseAccessId(item) === courseAccessId)
              ? {
                  ...item,
                  isPaid: true,
                  hasCourseAccess: true,
                  bookingStatus: "paid",
                  liveClass: {
                    ...item.liveClass,
                    isPaid: true,
                    hasCourseAccess: true,
                    bookingStatus: "paid",
                  },
                }
              : item
          )
        );
        setMessage("Course access verified. You can join all sessions in this course until it ends.");
      } catch (err) {
        setError(err?.message || "Payment could not be completed.");
      } finally {
        setActionId("");
      }
    },
    [isAuthenticated]
  );

  return (
    <main className="pb-10 sm:pb-14 bg-white">


      <section className="mx-auto max-w-7xl px-4 sm:px-8 pt-0 md:pt-8">
        <div className="md:hidden -mx-4 border-b border-slate-200 bg-slate-50 px-5 pb-6 pt-5">
          <h1 className="text-[20px] font-extrabold leading-tight text-slate-950">
            {categoryIntro.title}
          </h1>
          <p className="mt-3 text-[13px] leading-5 text-slate-700">
            {categoryIntro.description}
          </p>

          <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200 text-slate-900">
            <div className="pr-3">
              <div className="text-[10px] leading-4 text-slate-500">Learners</div>
              <div className="mt-1 text-[13px] font-extrabold">{categoryIntro.learners}</div>
            </div>
            <div className="px-3">
              <div className="text-[10px] leading-4 text-slate-500">Courses</div>
              <div className="mt-1 text-[13px] font-extrabold">{categoryIntro.sessions}</div>
            </div>
            <div className="pl-3">
              <div className="text-[10px] leading-4 text-slate-500">Live sessions</div>
              <div className="mt-1 text-[13px] font-extrabold">{categoryIntro.handsOn}</div>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-[12px] font-bold text-slate-700">Related</div>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categoryIntro.related.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category);
                    navigate(courseCategoryPath(category), { replace: false });
                  }}
                  className="shrink-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-[12px] font-extrabold text-slate-700 shadow-sm"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="grid gap-6 border-b border-slate-200 pb-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="min-w-0">
              <h1 className="text-[34px] font-extrabold leading-tight text-slate-950">
                {categoryIntro.title}
              </h1>
              <p className="mt-3 max-w-3xl text-[16px] leading-7 text-slate-700">
                {categoryIntro.description}
              </p>
            </div>
            <div className="grid min-w-[360px] grid-cols-3 divide-x divide-slate-200 text-slate-900">
              <div className="pr-5">
                <div className="text-[12px] leading-4 text-slate-500">Learners</div>
                <div className="mt-1 text-[18px] font-extrabold">{categoryIntro.learners}</div>
              </div>
              <div className="px-5">
                <div className="text-[12px] leading-4 text-slate-500">Courses</div>
                <div className="mt-1 text-[18px] font-extrabold">{categoryIntro.sessions}</div>
              </div>
              <div className="pl-5">
                <div className="text-[12px] leading-4 text-slate-500">Live sessions</div>
                <div className="mt-1 text-[18px] font-extrabold">{categoryIntro.handsOn}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[13px] font-bold text-slate-700">Related</span>
            {categoryIntro.related.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setActiveCategory(category);
                  navigate(courseCategoryPath(category), { replace: false });
                }}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-[13px] font-extrabold text-slate-700 transition-colors hover:border-slate-500 hover:bg-slate-50 hover:text-slate-950"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {isAuthenticated && showOverviewPanel ? (
          <div className="mt-8 hidden items-start gap-4 sm:flex sm:gap-5">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-[28px] font-black text-white shadow-sm">
              {getInitials(profileName)}
            </div>
            <div className="min-w-0 pt-0.5">
              <h2 className="text-[23px] sm:text-[28px] font-extrabold leading-tight text-slate-900">
                Welcome back, {profileName}
              </h2>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[15px] text-slate-700">
                <span className="font-medium">{profileLine}</span>
                <Link
                  to={PATHS.PROFILE}
                  className="font-extrabold text-[#6d28d9] underline decoration-2 underline-offset-2 hover:text-[#5b21b6]"
                >
                  Edit occupation and interests
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        <div className={showOverviewPanel ? "mt-8 sm:mt-10" : "mt-4 sm:mt-6"}>
          <h2 className="text-[30px] sm:text-[36px] font-extrabold tracking-tight text-slate-900">
            What to learn next
          </h2>
          <h3 className="mt-4 text-[22px] sm:text-[24px] font-extrabold text-slate-900">
            Recommended for you
          </h3>

          {message ? (
            <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              {message}
            </div>
          ) : null}
          {error ? (
            <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-80 rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {filteredCourses.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                  <h2 className="text-xl font-extrabold text-gray-900">
                    {searchQuery
                      ? "No matching sessions found"
                      : activeCategory === "Trainer Courses"
                        ? "No sessions available yet"
                        : `${activeCategory} sessions are coming soon`}
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    {searchQuery
                      ? "Clear the search or try a different keyword to see available sessions."
                      : activeCategory === "Trainer Courses"
                        ? "New expert-led sessions will appear here once they are published."
                        : "Switch to another category below to explore available sessions now."}
                  </p>
                  {!searchQuery && availableCategories.length > 1 ? (
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                      {availableCategories
                        .filter((category) => category !== activeCategory)
                        .map((category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => setActiveCategory(category)}
                            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-emerald-200 hover:text-emerald-700"
                          >
                            {category}
                          </button>
                        ))}
                    </div>
                  ) : null}
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        navigate("/courses", { replace: true });
                      }}
                      className="mt-5 rounded-xl bg-[#00342b] px-5 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-[#004d40]"
                    >
                      Show all sessions
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {filteredCourses.map((course) => (
                    <CourseGridCard
                      key={course.id}
                      course={course}
                      liveClass={course.liveClass}
                      onViewDetails={() => navigate(`/courses/${course.id}`, { state: { course } })}
                      onJoinClass={() => joinTrainerClass(course)}
                      onPayForClass={() => payForTrainerClass(course)}
                      actionId={actionId}
                      now={now}
                    />
                  ))}
                </div>
              )}

              {/* Render other courses at the bottom */}
              {!loading && otherCourses.length > 0 && (
                <div className="mt-16 pt-10 border-t border-slate-100">
                  <h2 className="text-[24px] font-extrabold text-slate-950 mb-6">
                    Other Available Courses
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {otherCourses.map((course) => (
                      <CourseGridCard
                        key={course.id}
                        course={course}
                        liveClass={course.liveClass}
                        onViewDetails={() => navigate(`/courses/${course.id}`, { state: { course } })}
                        onJoinClass={() => joinTrainerClass(course)}
                        onPayForClass={() => payForTrainerClass(course)}
                        actionId={actionId}
                        now={now}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <AuthRequiredModal
          open={!!authPrompt}
          title={authPrompt?.title}
          message={authPrompt?.message}
          from={authPrompt?.from}
          onClose={() => setAuthPrompt(null)}
        />
      </section>
    </main>
  );  
}

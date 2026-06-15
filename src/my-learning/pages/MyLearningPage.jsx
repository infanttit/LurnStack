import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiBell,
  FiCalendar,
  FiInfo,
  FiRefreshCcw,
  FiTarget,
} from "react-icons/fi";
import { PATHS } from "../../app/router/paths";
import { Info } from "lucide-react";
import { getStudentSessions } from "../../courses/api/studentSessionsApi";
import { useSEO } from "../../shared/hooks/useSEO";
import SmartImage from "../../shared/components/SmartImage";
import {
  applyRecentJoinedFallback,
  buildLearningSummary,
  formatIST,
  getAttendanceStatus,
  getLearningOccurrence,
  isPaidLearningSession,
  isUnavailableSession,
} from "../utils/learningModel";

function courseDetailPath(id) {
  return PATHS.COURSE_DETAILS.replace(":courseId", encodeURIComponent(String(id || "")));
}

function EmptyState({ title, body }) {
  return (
    <div className="py-9 text-sm text-slate-600">
      <div className="font-black text-slate-950">{title}</div>
      <div className="mt-1 font-medium">{body}</div>
    </div>
  );
}

function LearningSection({ title, right, children, className = "" }) {
  return (
    <section className={["pt-7", className].join(" ")}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-[18px] font-black tracking-tight text-slate-950 sm:text-[21px]">{title}</h2>
        {right ? <div className="text-xs font-bold text-slate-500">{right}</div> : null}
      </div>
      {children}
    </section>
  );
}

function StatusPill({ children, tone = "emerald" }) {
  const tones = {
    emerald: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-800",
    slate: "bg-slate-100 text-slate-700",
    sky: "bg-sky-100 text-sky-800",
  };
  return (
    <span className={["inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider", tones[tone] || tones.emerald].join(" ")}>
      {children}
    </span>
  );
}

function isFreeSession(session) {
  if (session?.paymentRequired === true || session?.payment_required === true) return false;
  return (
    session?.isFree === true ||
    session?.is_free === true ||
    String(session?.pricingState || session?.pricing_state || "").trim().toUpperCase() === "FREE" ||
    Number(session?.amountPaise || session?.amount_paise || session?.liveClass?.amountPaise || 0) <= 0
  );
}

function getLearningAction(session, label = "") {
  const now = Date.now();
  const occurrence = getLearningOccurrence(session, now);
  const { startMs, endMs } = occurrence;
  const completed = String(label || "").toLowerCase() === "completed" || (endMs > 0 && endMs < now);
  const unavailable = isUnavailableSession(session);
  const paidOrFree = isFreeSession(session) || isPaidLearningSession(session);
  const canJoin = startMs > 0 && now >= startMs && now <= endMs && !completed && !unavailable && paidOrFree;

  if (completed) return { text: "Completed", tone: "muted" };
  if (unavailable) return { text: "Locked", tone: "muted" };
  if (!paidOrFree) return { text: "Pay", tone: "pay" };
  if (canJoin) return { text: "Join", tone: "live" };
  return { text: "Locked", tone: "muted" };
}

function learningWhenText(session) {
  const now = Date.now();
  const occurrence = getLearningOccurrence(session, now);
  const todayOccurrence = getLearningOccurrence(session, now, { rollForwardAfterEnd: false });
  const dateText = formatIST(occurrence.scheduledAt || session?.liveClass?.scheduledAt || session?.scheduledAt);
  if (occurrence.isRecurring && todayOccurrence.endMs > 0 && now > todayOccurrence.endMs) {
    return `Today completed. Next class ${dateText}`;
  }
  return dateText;
}

function actionClass(tone) {
  if (tone === "live") return "bg-[#004d3d] text-white";
  if (tone === "pay") return "bg-amber-500 text-white";
  return "bg-slate-200 text-slate-700";
}

function ProgressRing({ value = 0 }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const background = `conic-gradient(#059669 ${clamped * 3.6}deg, #d7dbe8 0deg)`;
  return (
    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full" style={{ background }}>
      <div className="grid h-8 w-8 place-items-center rounded-full bg-white">
        <div className="h-4 w-4 rounded-full bg-emerald-500" />
      </div>
    </div>
  );
}

function CourseAccessCard({ course }) {
  const nextSession = course.nextSession;
  const progress = course.total ? Math.min(100, Math.round((course.completed / course.total) * 100)) : 0;
  const action = nextSession ? getLearningAction(nextSession) : { text: "Completed", tone: "muted" };
  return (
    <Link
      to={courseDetailPath(nextSession?.id || course.id)}
      className="group block bg-white transition-colors"
    >
      <div className="aspect-[16/9] overflow-hidden bg-slate-100">
        <SmartImage
          src={course.thumbnail}
          alt={course.title}
          className="h-full w-full object-cover"
          fallbackClassName="h-full w-full bg-gradient-to-br from-emerald-950 via-teal-800 to-sky-600"
        />
      </div>
      <div className="pt-2.5">
        <div className="flex items-center justify-between gap-3">
          <span className="line-clamp-1 text-xs font-medium text-slate-500">{course.instructor}</span>
          <StatusPill>Paid</StatusPill>
        </div>
        <div className="line-clamp-2 min-h-[38px] text-[16px] font-black leading-snug text-slate-950">
          {course.title}
        </div>
        <div className="mt-2 text-xs font-semibold text-slate-700">{course.total} total sessions</div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#00a86b]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-xs font-bold text-slate-800">{progress}% complete</div>
        <div className="mt-2 line-clamp-1 text-xs font-semibold text-slate-500">
          {nextSession ? learningWhenText(nextSession) : "No upcoming live class"}
        </div>
        <div className="mt-3 flex gap-2">
          <span className={["inline-flex h-8 items-center justify-center px-3 text-[11px] font-black", actionClass(action.tone)].join(" ")}>
            {action.text}
          </span>
          <span className="inline-flex h-8 items-center justify-center border border-slate-300 px-3 text-[11px] font-black text-slate-900">
            View details
          </span>
        </div>
      </div>
    </Link>
  );
}

function SessionCard({ session, label, tone = "emerald" }) {
  const status = getAttendanceStatus(session);
  const action = getLearningAction(session, label);
  return (
    <Link
      to={courseDetailPath(session.id)}
      className="group block bg-white transition-colors"
    >
      <div className="aspect-[16/9] overflow-hidden bg-slate-100">
        <SmartImage
          src={session.thumbnail}
          alt={session.title}
          className="h-full w-full object-cover"
          fallbackClassName="h-full w-full bg-gradient-to-br from-slate-900 via-emerald-800 to-teal-500"
        />
      </div>
      <div className="pt-2.5">
        <div className="flex items-center justify-between gap-3">
          <span className="line-clamp-1 text-xs font-medium text-slate-500">
            {session.instructorName || session.instructor || "LurnStack Trainer"}
          </span>
          <StatusPill tone={tone}>{label}</StatusPill>
        </div>
        <div className="mt-2.5 line-clamp-2 min-h-[38px] text-[16px] font-black leading-snug text-slate-950">
          {session.title}
        </div>
        {status ? <div className="mt-1 text-xs font-semibold text-slate-500">{status}</div> : null}
        <div className="mt-3 flex items-start gap-2 text-xs font-semibold text-slate-700">
          <FiCalendar className="mt-0.5 shrink-0 text-[14px]" />
          <span className="inline-flex items-center gap-1.5">
            {learningWhenText(session)}
          </span>
        </div>

        {session.trainerInstructions && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50/50 p-2.5 text-xs text-blue-800">
            <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
            <p className="leading-normal">{session.trainerInstructions}</p>
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <span
            className={[
              "inline-flex h-8 items-center justify-center px-3 text-[11px] font-black",
              actionClass(action.tone),
            ].join(" ")}
          >
            {action.text}
          </span>
          <span className="inline-flex h-8 items-center justify-center border border-slate-300 px-3 text-[11px] font-black text-slate-900">
            View details
          </span>
        </div>
      </div>
    </Link>
  );
}


function StreakPanel({ summary }) {
  const courseMinutes = Math.min(30, summary.completedSessions.length * 10);
  const visitCount = summary.recentlyJoined.length > 0 ? 1 : 0;
  const progress = Math.round(((courseMinutes / 30) * 50) + (visitCount ? 50 : 0));

  return (
    <section className="border-y border-slate-200 py-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_220px] lg:items-center">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-950">Start a weekly streak</h2>
          <p className="mt-1 text-sm font-medium text-slate-600">
            One session at a time. Continue your LurnStack courses and keep your live learning habit active.
          </p>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <FiTarget className="text-2xl" />
          <div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-black text-slate-950">{visitCount}</span>
              <span className="pb-0.5 text-sm font-medium text-slate-700">week</span>
            </div>
            <div className="text-xs font-medium text-slate-400">Current streak</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ProgressRing value={progress} />
          <div className="min-w-0 text-xs font-semibold text-slate-900">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>{courseMinutes}/30 course min</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              <span>{visitCount}/1 visit</span>
            </div>
            <div className="mt-2 text-slate-600">This week</div>
          </div>
          <FiInfo className="hidden text-lg text-slate-500 sm:block" />
        </div>
      </div>
    </section>
  );
}

function SchedulePanel() {
  return (
    <section className="border-b border-slate-200 py-4">
      <div className="grid gap-3 sm:grid-cols-[28px_1fr]">
        <FiBell className="mt-1 text-2xl text-slate-800" />
        <div>
          <h2 className="text-base font-black text-slate-950">Schedule learning time</h2>
          <p className="mt-1 max-w-5xl text-sm leading-6 text-slate-600">
            Learning a little each day adds up. Set time aside for upcoming LurnStack live classes and keep your course access moving forward.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              to={PATHS.SESSIONS}
              className="inline-flex h-9 items-center justify-center border border-[#5c2dff] px-4 text-sm font-black text-[#5c2dff] transition-colors hover:bg-violet-50"
            >
              Get started
            </Link>
            <button type="button" className="h-9 px-2 text-sm font-black text-[#5c2dff]">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroDescriptions({ activeTab }) {
  const descriptions = {
    all: [
      "Browse your comprehensive catalog of enrolled programs. This overview houses every training curriculum you have unlocked, providing a centralized hub for your educational journey.",
      "Keep track of your progress indicator on each course card to ensure you are meeting your weekly targets. Transition between lectures, quizzes, and projects seamlessly to solidify your learning experience.",
      "If you need support with a specific program, click to view details and access trainer instructions or contact support directly. We recommend scheduling dedicated weekly hours to maintain consistency."
    ],
    paid: [
      "View all of your purchased, one-time expert sessions. These live events are tailored to deep dive into specific technical concepts under direct trainer guidance.",
      "Access keys, meeting URLs, and syllabus details directly from the course cards. Please review any instructor prerequisites before the session start time to get the most value out of the live interaction.",
      "Once a session concludes, you can verify your attendance status or follow up with the community. Paid session entries remain here to help you review completed modules and resources at any time."
    ],
    upcoming: [
      "Your upcoming live sessions schedule lists the classes that will be starting soon. Join links will be activated automatically when the class starts.",
      "Make sure you have completed the required readings and setup instructions before entering the meeting. Being prepared allows you to participate actively in the code-along components.",
      "Set a calendar reminder or allow browser notifications so you don't miss live broadcasts. In case of unexpected scheduling changes, you can check update bulletins here."
    ],
    recent: [
      "Revisit classes you have recently attended to consolidate your notes and resources. This history log makes it easy to jump back into active learning.",
      "Check your attendance indicators to ensure your session hours are logged correctly. If you were marked absent or late, you can verify your join count details here.",
      "Download course resources, check assignment feedback, or review recorded sessions from this list. Habitual review of recent material is key to long-term skill retention."
    ],
    completed: [
      "Your completed sessions log lists all courses and modules you have successfully finished. This is a record of your academic milestones on LurnStack.",
      "You can download session completion files, recap notes, and project solutions from here. Reviewing these materials serves as a great refresher before technical interviews.",
      "If a completed course is eligible for certification, the status will be updated automatically. Feel free to explore new categories to expand your skill set further."
    ],
    certifications: [
      "Here you can view and download all the professional certificates you have earned by completing courses on LurnStack. Share your achievements to showcase your skills.",
      "Our certification program aligns with industry standards, making these credentials a valuable addition to your resume or portfolio. You can verify certificate authenticity using our unique ID validator.",
      "If you are currently working through a program, keep an eye on the completion milestones required to unlock your certificate. Continue learning to earn more credentials."
    ],
  };

  const paragraphs = descriptions[activeTab] || descriptions.all;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [activeTab]);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % paragraphs.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [paragraphs]);

  const currentText = paragraphs[index] || "";

  return (
    <div className="mt-6 max-w-3xl min-h-[56px] sm:min-h-[48px] overflow-hidden">
      <p
        key={index}
        className="text-[13px] font-semibold leading-relaxed text-[#052e22]/85 animate-[learningHeaderBody_0.5s_ease-out_both]"
      >
        {currentText}
      </p>
    </div>
  );
}

function TabContent({ activeTab, loading, summary }) {
  let content;

  if (activeTab === "paid") {
    content = (
      <LearningSection title={<span className="inline-block animate-learning-header-line"><Link to="/dashboard?view=paid" className="hover:underline">Paid sessions</Link></span>} right={loading ? "Loading..." : `${summary.paidSessions?.length || 0} paid`}>
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-56 animate-pulse bg-slate-50" />)}
          </div>
        ) : !summary.paidSessions?.length ? (
          <EmptyState title="No paid sessions yet" body="Your paid one-time course sessions will appear here after purchase." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {summary.paidSessions.map((session) => (
              <SessionCard key={session.id} session={session} label="Paid" tone="emerald" />
            ))}
          </div>
        )}
      </LearningSection>
    );
  } else if (activeTab === "upcoming") {
    content = (
      <LearningSection title={<span className="inline-block animate-learning-header-line"><Link to="/dashboard?view=upcoming" className="hover:underline">Upcoming live sessions</Link></span>} right={loading ? "Loading..." : `${summary.upcomingSessions.length} scheduled`}>
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-56 animate-pulse bg-slate-50" />)}
          </div>
        ) : summary.upcomingSessions.length === 0 ? (
          <EmptyState title="No upcoming sessions" body="Upcoming classes from your free and paid learning sessions will appear here." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {summary.upcomingSessions.map((session) => (
              <SessionCard key={session.id} session={session} label={isPaidLearningSession(session) ? "Paid" : "Free"} tone={isPaidLearningSession(session) ? "emerald" : "sky"} />
            ))}
          </div>
        )}
      </LearningSection>
    );
  } else if (activeTab === "recent") {
    content = (
      <LearningSection title={<span className="inline-block animate-learning-header-line"><Link to="/dashboard?view=recent" className="hover:underline">Recently joined</Link></span>} right={loading ? "Loading..." : `${summary.recentlyJoined.length} sessions`}>
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-56 animate-pulse bg-slate-50" />)}
          </div>
        ) : summary.recentlyJoined.length === 0 ? (
          <EmptyState title="No joined sessions yet" body="After you join a live class, recent activity and attendance will show here." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {summary.recentlyJoined.map((session) => <SessionCard key={session.id} session={session} label="Joined" tone="sky" />)}
          </div>
        )}
      </LearningSection>
    );
  } else if (activeTab === "completed") {
    content = (
      <LearningSection title={<span className="inline-block animate-learning-header-line"><Link to="/dashboard?view=completed" className="hover:underline">Completed sessions</Link></span>} right={loading ? "Loading..." : `${summary.completedSessions.length} completed`}>
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-56 animate-pulse bg-slate-50" />)}
          </div>
        ) : summary.completedSessions.length === 0 ? (
          <EmptyState title="No completed sessions yet" body="Completed sessions will appear here with attendance status when available." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {summary.completedSessions.map((session) => <SessionCard key={session.id} session={session} label="Completed" tone="slate" />)}
          </div>
        )}
      </LearningSection>
    );
  } else if (activeTab === "certifications") {
    content = (
      <LearningSection title={<span className="inline-block animate-learning-header-line"><Link to="/dashboard?view=certifications" className="hover:underline">Certifications</Link></span>} right="Coming soon">
        <div className="border-y border-slate-200 py-10">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-800">
              Coming soon
            </div>
            <h3 className="mt-4 text-2xl font-black text-slate-950">LurnStack certificates are on the way</h3>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
              Completed eligible courses will show certificate status, issue date, and download access here.
            </p>
          </div>
        </div>
      </LearningSection>
    );
  } else {
    content = (
      <LearningSection title={<span className="inline-block animate-learning-header-line"><Link to="/dashboard?view=all" className="hover:underline">All courses</Link></span>} right={loading ? "Loading..." : `${summary.paidCourses.length} active`}>
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-56 animate-pulse bg-slate-50" />
            ))}
          </div>
        ) : summary.paidCourses.length === 0 ? (
          <EmptyState title="No paid courses yet" body="Once you buy a trainer course, your active course access and related sessions will appear here." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {summary.paidCourses.map((course) => <CourseAccessCard key={course.id} course={course} />)}
          </div>
        )}
      </LearningSection>
    );
  }

  return content;
}

export default function MyLearningPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const location = useLocation();
  const navigate = useNavigate();
  const contentSectionRef = useRef(null);

  useSEO({
    title: "My Learning",
    description: "Track your enrolled courses, live sessions, attendance, and certifications on LurnStack.",
    keywords: "my learning, LurnStack dashboard, enrolled courses, live sessions, certifications",
    canonical: "/dashboard",
  });

  const loadLearning = async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const items = await getStudentSessions();
      setSessions(applyRecentJoinedFallback(items || []));
    } catch (err) {
      setSessions([]);
      setError(err?.message || "Unable to load your learning sessions.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLearning(false);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const view = params.get("view");
    if (view) {
      setActiveTab(view);
    } else {
      setActiveTab("all");
    }
  }, [location.search]);

  // Trigger smooth scroll when tab changes
  useEffect(() => {
    if (!loading && contentSectionRef.current) {
      const element = contentSectionRef.current;
      const yOffset = -100; // Offset to account for fixed navbar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [activeTab, loading]);

  const refreshLearningPage = async () => {
    navigate(location.pathname);
    await loadLearning(false);
  };

  const summary = useMemo(() => buildLearningSummary(sessions), [sessions]);

  return (
    <main className="bg-white pb-12">
      <section className="bg-[#54d410] text-[#052e22]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-5 px-4 pb-14 pt-14 sm:px-6 sm:pt-16">
          <div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl flex flex-wrap">
              {"My learning".split("").map((letter, idx) => (
                <span
                  key={idx}
                  className="animate-learning-title-letter"
                  style={{
                    animationDelay: `${idx * 40}ms`,
                    whiteSpace: letter === " " ? "pre" : "normal",
                  }}
                >
                  {letter}
                </span>
              ))}
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-medium text-[#052e22]/80 animate-learning-header-body">
              Continue your LurnStack courses, live sessions, and paid trainer access from one place.
            </p>
            {!loading && <HeroDescriptions activeTab={activeTab} />}
          </div>
          <button
            type="button"
            onClick={refreshLearningPage}
            disabled={loading || refreshing}
            className="inline-flex h-10 items-center gap-2 border border-[#052e22]/20 px-4 text-sm font-black text-[#052e22] transition-colors hover:bg-[#052e22]/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRefreshCcw className={loading || refreshing ? "animate-spin" : ""} />
            {loading || refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </section>

      <section ref={contentSectionRef} className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        {error ? (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
            {error}
          </div>
        ) : null}

        {activeTab === "all" ? (
          <div className="space-y-0">
            <StreakPanel summary={summary} />
            <SchedulePanel />
          </div>
        ) : null}

        <div key={activeTab} className={activeTab === "all" ? "mt-10" : "mt-2"}>
          <TabContent activeTab={activeTab} loading={loading} summary={summary} />
        </div>
      </section>
    </main>
  );
}

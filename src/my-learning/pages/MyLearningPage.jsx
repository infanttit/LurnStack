import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBell,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiInfo,
  FiRefreshCcw,
  FiTarget,
} from "react-icons/fi";
import { PATHS } from "../../app/router/paths";
import { getStudentSessions } from "../../courses/api/studentSessionsApi";
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

function LearningTabs({ summary, activeTab, onTabChange }) {
  const scrollerRef = useRef(null);
  const tabs = [
    { id: "all", label: "All courses", count: summary.paidCourses.length },
    { id: "paid", label: "Paid sessions", count: summary.paidSessions?.length || 0 },
    { id: "upcoming", label: "Upcoming live sessions", count: summary.upcomingSessions.length },
    { id: "recent", label: "Recently joined", count: summary.recentlyJoined.length },
    { id: "completed", label: "Completed sessions", count: summary.completedSessions.length },
    { id: "certifications", label: "Certifications", count: 0 },
  ];
  const scrollTabs = (direction) => {
    scrollerRef.current?.scrollBy({
      left: direction * 180,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative mx-auto max-w-6xl">
      <button
        type="button"
        onClick={() => scrollTabs(-1)}
        className="absolute left-1 top-1 z-10 grid h-8 w-8 place-items-center bg-[#004d3d] text-white sm:hidden"
        aria-label="Scroll tabs left"
      >
        <FiChevronLeft />
      </button>
      <div
        ref={scrollerRef}
        className="flex gap-7 overflow-x-auto px-11 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={[
              "shrink-0 border-b-2 px-1 pb-4 pt-1 text-sm font-semibold text-white/85 transition-colors hover:text-white sm:text-base",
              activeTab === tab.id ? "border-white text-white" : "border-transparent",
            ].join(" ")}
          >
            {tab.label}
            {tab.count ? <span className="ml-2 text-xs font-semibold text-white/65">{tab.count}</span> : null}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => scrollTabs(1)}
        className="absolute right-1 top-1 z-10 grid h-8 w-8 place-items-center bg-[#004d3d] text-white sm:hidden"
        aria-label="Scroll tabs right"
      >
        <FiChevronRight />
      </button>
    </div>
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

function TabContent({ activeTab, loading, summary }) {
  if (activeTab === "paid") {
    return (
      <LearningSection title="Paid sessions" right={loading ? "Loading..." : `${summary.paidSessions?.length || 0} paid`}>
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
  }

  if (activeTab === "upcoming") {
    return (
      <LearningSection title="Upcoming live sessions" right={loading ? "Loading..." : `${summary.upcomingSessions.length} scheduled`}>
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
  }

  if (activeTab === "recent") {
    return (
      <LearningSection title="Recently joined" right={loading ? "Loading..." : `${summary.recentlyJoined.length} sessions`}>
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
  }

  if (activeTab === "completed") {
    return (
      <LearningSection title="Completed sessions" right={loading ? "Loading..." : `${summary.completedSessions.length} completed`}>
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
  }

  if (activeTab === "certifications") {
    return (
      <LearningSection title="Certifications" right="Coming soon">
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
  }

  return (
    <LearningSection title="All courses" right={loading ? "Loading..." : `${summary.paidCourses.length} active`}>
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

export default function MyLearningPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

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

  const refreshLearningPage = async () => {
    setActiveTab("all");
    await loadLearning(false);
  };

  const summary = useMemo(() => buildLearningSummary(sessions), [sessions]);

  return (
    <main className="bg-white pb-12">
      <section className="bg-[#004d3d] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-5 px-4 pb-10 pt-14 sm:px-6 sm:pt-16">
          <div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">My learning</h1>
            <p className="mt-4 max-w-2xl text-sm font-medium text-emerald-50/75">
              Continue your LurnStack courses, live sessions, and paid trainer access from one place.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshLearningPage}
            disabled={loading || refreshing}
            className="inline-flex h-10 items-center gap-2 border border-emerald-100/40 px-4 text-sm font-black text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRefreshCcw className={loading || refreshing ? "animate-spin" : ""} />
            {loading || refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <LearningTabs summary={summary} activeTab={activeTab} onTabChange={setActiveTab} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
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

        <div className={activeTab === "all" ? "mt-10" : "mt-2"}>
          <TabContent activeTab={activeTab} loading={loading} summary={summary} />
        </div>
      </section>
    </main>
  );
}

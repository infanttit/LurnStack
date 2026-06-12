import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { FiArrowRight, FiBell, FiBookOpen, FiCalendar, FiCheckCircle, FiClock, FiRefreshCcw, FiTag, FiVideo } from "react-icons/fi";
import { PATHS } from "../../app/router/paths";
import { getStudentSessions } from "../../courses/api/studentSessionsApi";
import { getTitClasses } from "../api/liveClassesApi";
import SmartImage from "../../shared/components/SmartImage";
import LiveClassCard from "../components/LiveClassCard";
import SkeletonCard from "../components/SkeletonCard";
import useNow from "../hooks/useNow";
import { fetchDashboardData, joinLiveClass } from "../model/liveClassesSlice";
import { openMeetingLink, openPendingMeetingWindow } from "../../shared/utils/meetingWindow";

function EmptyState({ title, body }) {
  return (
    <div className="rounded-2xl bg-surface p-6 text-sm text-on-surface-variant shadow-sm">
      <div className="font-extrabold text-on-surface">{title}</div>
      <div className="mt-1">{body}</div>
    </div>
  );
}

function SectionCard({ title, right, children }) {
  return (
    <div className="rounded-2xl bg-surface overflow-hidden shadow-sm">
      <div className="px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
        <h2 className="text-base sm:text-lg font-extrabold text-on-surface">
          {title}
        </h2>
        {right ? (
          <div className="text-xs font-semibold text-on-surface-variant">{right}</div>
        ) : null}
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

function formatIST(iso) {
  const date = new Date(iso || "");
  if (Number.isNaN(date.getTime())) return "Schedule pending";
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function LearningStat({ icon: Icon, label, value, tone = "emerald" }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-100",
    slate: "bg-slate-50 text-slate-800 border-slate-100",
    amber: "bg-amber-50 text-amber-800 border-amber-100",
  };

  return (
    <div className={["rounded-2xl border p-4", tones[tone] || tones.emerald].join(" ")}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-extrabold uppercase tracking-widest opacity-75">
          {label}
        </span>
        <Icon className="text-lg opacity-80" />
      </div>
      <div className="mt-3 text-2xl font-black">{value}</div>
    </div>
  );
}

function formatDate(iso) {
  const date = new Date(iso || "");
  if (Number.isNaN(date.getTime())) return "Date pending";
  return date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso) {
  const date = new Date(iso || "");
  if (Number.isNaN(date.getTime())) return "Time pending";
  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDurationLabel(minutes) {
  const value = Number(minutes || 0);
  if (!Number.isFinite(value) || value <= 0) return "Duration pending";
  if (value < 60) return `${Math.round(value)} min`;
  const hours = Math.floor(value / 60);
  const rest = Math.round(value % 60);
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

function titClassStatusLabel(titClass) {
  const backendStatus = String(titClass?.status || "").trim();
  if (backendStatus) return backendStatus.charAt(0).toUpperCase() + backendStatus.slice(1);
  const now = Date.now();
  const start = new Date(titClass?.scheduledAt || "").getTime();
  const end = new Date(titClass?.endsAt || "").getTime();
  if (!Number.isFinite(start)) return "Schedule pending";
  if (Number.isFinite(end) && now > end) return "Completed";
  if (Number.isFinite(end) && now >= start && now <= end) return "Live now";
  return "Upcoming";
}

function TitClassCard({ titClass, now, onOpenMeeting }) {
  const status = titClassStatusLabel(titClass);
  const meetingLink = titClass?.meetingLink || "";
  const startMs = new Date(titClass?.scheduledAt || "").getTime();
  const endMs = new Date(titClass?.endsAt || "").getTime();
  const joinOpensMs = startMs - 5 * 60 * 1000;
  const canJoin =
    !!meetingLink &&
    Number.isFinite(startMs) &&
    Number.isFinite(endMs) &&
    now >= joinOpensMs &&
    now <= endMs;
  const actionLabel = canJoin ? "Join" : titClass?.isFree ? "Enroll" : "Enroll";

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-md border border-gray-200 bg-white transition-all duration-200 hover:border-emerald-200 hover:shadow-md">
      <div className="relative aspect-[16/6] overflow-hidden bg-gray-100">
        <SmartImage
          src={titClass?.thumbnail}
          alt={titClass?.title || "TIT class"}
          className="h-full w-full object-cover"
          fallbackClassName="h-full w-full bg-gradient-to-br from-slate-900 via-emerald-800 to-teal-500"
        />
        <div className="absolute right-2 top-2 overflow-hidden rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-[11px] font-black text-[#00342b] shadow-[0_14px_34px_rgba(3,52,43,0.20)] ring-1 ring-emerald-900/5 animate-priceFloat">
          <span className="absolute inset-y-0 -left-6 w-5 rotate-12 bg-white/80 blur-[2px] animate-priceShine" />
          <span className="relative inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
            {titClass?.priceLabel || "Free"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-2.5">
        <h3 className="line-clamp-2 text-[13px] font-extrabold leading-snug text-gray-900">
          {titClass?.title || "TIT class"}
        </h3>
        <p className="mt-0.5 truncate text-[11px] text-gray-500">
          {titClass?.instructorName || "LurnStack Trainer"}
        </p>

        <div className="mt-2 rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1.5">
          <div className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-800">
            TIT class
          </div>
          <div className="mt-1 truncate text-[11px] font-bold text-gray-800">
            {titClass?.courseName || "Course pending"}
          </div>
          {titClass?.description ? (
            <p className="mt-1 line-clamp-1 text-[10px] leading-4 text-gray-600">
              {titClass.description}
            </p>
          ) : null}
          <div className="mt-2 grid gap-1 text-[10px] font-semibold text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <FiCalendar className="shrink-0" />
              {formatDate(titClass?.scheduledAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FiClock className="shrink-0" />
              {formatTime(titClass?.scheduledAt)} - {formatTime(titClass?.endsAt)} IST
            </span>
            <span>{formatDurationLabel(titClass?.durationMinutes)}</span>
          </div>
          <div className="mt-2 truncate text-[10px] font-bold text-emerald-800">
            {status}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-[14px] font-extrabold text-gray-900">
            <FiTag className="text-[13px]" />
            {titClass?.priceLabel || "Free"}
          </span>
          <span className="rounded-sm bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
            {status}
          </span>
        </div>

        <div className="mt-auto pt-2.5">
          <button
            type="button"
            disabled={!canJoin}
            onClick={() => onOpenMeeting?.(meetingLink)}
            className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-[#00342b] px-3 text-[11px] font-extrabold text-white transition-colors hover:bg-[#004d40] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiVideo className="text-[13px]" />
            {actionLabel}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function StudentDashboardPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [actionNotice, setActionNotice] = useState("");
  const [learningSessions, setLearningSessions] = useState([]);
  const [learningLoading, setLearningLoading] = useState(true);
  const [learningError, setLearningError] = useState("");
  const [titClasses, setTitClasses] = useState([]);
  const [titLoading, setTitLoading] = useState(false);
  const [titError, setTitError] = useState("");
  const now = useNow(1000);
  const {
    enrolledCourses,
    upcomingClasses,
    completedClasses,
    joinedByClassId,
    loading,
    error,
    lastUpdatedAt,
  } =
    useSelector((s) => s.liveClasses);
  const isLiveClassesView = location.pathname === PATHS.LIVE_CLASSES;

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  useEffect(() => {
    if (!isLiveClassesView) return;
    let cancelled = false;
    setTitLoading(true);
    setTitError("");
    getTitClasses()
      .then((items) => {
        if (!cancelled) setTitClasses(items || []);
      })
      .catch((err) => {
        if (!cancelled) {
          setTitClasses([]);
          setTitError(err?.message || "Unable to load TIT classes.");
        }
      })
      .finally(() => {
        if (!cancelled) setTitLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isLiveClassesView]);

  useEffect(() => {
    if (isLiveClassesView) {
      setLearningSessions([]);
      setLearningError("");
      setLearningLoading(false);
      return;
    }
    let cancelled = false;
    setLearningLoading(true);
    setLearningError("");
    getStudentSessions()
      .then((items) => {
        if (!cancelled) setLearningSessions(items || []);
      })
      .catch((err) => {
        if (!cancelled) {
          setLearningSessions([]);
          setLearningError(err?.message || "Unable to load your learning sessions.");
        }
      })
      .finally(() => {
        if (!cancelled) setLearningLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isLiveClassesView]);

  const nextLive = upcomingClasses?.[0] || null;
  const nextWhen = useMemo(() => {
    const start = new Date(nextLive?.scheduledAt || "");
    if (Number.isNaN(start.getTime())) return "";
    return start.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }, [nextLive?.scheduledAt]);

  const notifications = useMemo(() => {
    const items = [];
    if (upcomingClasses?.length) {
      const next = upcomingClasses[0];
      const start = new Date(next?.scheduledAt || "");
      const when = Number.isNaN(start.getTime())
        ? ""
        : start.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            weekday: "short",
            day: "2-digit",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
          });
      items.push({
        id: `next-${next.id}`,
        title: "Next live class",
        body: [next.courseName, next.title, when].filter(Boolean).join(" • "),
      });
    }
    return items;
  }, [upcomingClasses]);

  const learningSummary = useMemo(() => {
    const now = Date.now();
    const upcoming = learningSessions.filter((session) => {
      const start = new Date(session?.liveClass?.scheduledAt || session?.scheduledAt || "").getTime();
      return Number.isFinite(start) && start >= now;
    });
    const completed = learningSessions.filter((session) => {
      const end = new Date(session?.liveClass?.endsAt || session?.endsAt || "").getTime();
      return Number.isFinite(end) && end < now;
    });
    const nextSession = [...upcoming].sort(
      (a, b) =>
        new Date(a?.liveClass?.scheduledAt || a?.scheduledAt || "").getTime() -
        new Date(b?.liveClass?.scheduledAt || b?.scheduledAt || "").getTime()
    )[0] || null;

    return {
      total: learningSessions.length,
      upcoming: upcoming.length,
      completed: completed.length,
      nextSession,
    };
  }, [learningSessions]);

  const titClassSessions = useMemo(() => {
    return (titClasses || []).filter((titClass) => titClass?.id != null);
  }, [titClasses]);

  const openTitMeeting = (meetingLink) => {
    openMeetingLink(null, meetingLink || "");
  };

  const handleJoin = async (liveClass) => {
    const classId = liveClass?.id;
    if (!classId) return;
    if (liveClass?.pricePending || liveClass?.priceInPaise == null) {
      setActionNotice("This class is not yet open for enrollment");
      return;
    }
    setActionNotice("");
    const meetingWindow = openPendingMeetingWindow();
    try {
      const result = await dispatch(joinLiveClass({ classId })).unwrap();
      const meetUrl = result?.meetUrl || liveClass?.meetUrl;
      openMeetingLink(meetingWindow, meetUrl);
    } catch {
      openMeetingLink(meetingWindow, liveClass?.meetUrl || "");
      // Error is displayed via slice state.
    }
  };

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile sm:px-margin-desktop py-10 sm:py-14">
      {!isLiveClassesView ? (
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="font-h2 text-h2 text-on-surface">
            {isLiveClassesView ? "Live Classes" : "My Learning"}
          </h1>
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
            {isLiveClassesView
              ? "View your upcoming live classes, class status, and completed live sessions."
              : "Track your booked sessions, upcoming live classes, attendance, and learning progress in one place."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-on-surface-variant">
            Last updated:{" "}
            <span className="text-on-surface">
              {lastUpdatedAt
                ? new Date(lastUpdatedAt).toLocaleTimeString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "—"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => dispatch(fetchDashboardData())}
            disabled={loading}
            className={[
              "h-10 px-5 rounded-xl text-sm font-extrabold transition-colors inline-flex items-center gap-2",
              loading
                ? "bg-surface-variant text-on-surface-variant cursor-not-allowed"
                : "bg-primary text-on-primary hover:bg-primary/90",
            ].join(" ")}
          >
            <FiRefreshCcw className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>
      ) : null}

      {!isLiveClassesView ? (
        <section className="mt-8 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-stretch">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">
                Learning dashboard
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                Continue where you left off
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
                Your joined, paid, and free learning sessions appear here. Use this page to review what is coming next and open the right class when access starts.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <LearningStat
                  icon={FiBookOpen}
                  label="My sessions"
                  value={learningLoading ? "..." : learningSummary.total}
                />
                <LearningStat
                  icon={FiClock}
                  label="Upcoming"
                  value={learningLoading ? "..." : learningSummary.upcoming}
                  tone="amber"
                />
                <LearningStat
                  icon={FiCheckCircle}
                  label="Completed"
                  value={learningLoading ? "..." : learningSummary.completed}
                  tone="slate"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="text-[11px] font-black uppercase tracking-widest text-emerald-800">
                Next learning session
              </div>
              {learningSummary.nextSession ? (
                <div className="mt-3">
                  <div className="text-base font-black leading-snug text-slate-950">
                    {learningSummary.nextSession.title}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-slate-600">
                    Trainer: {learningSummary.nextSession.instructorName || learningSummary.nextSession.instructor || "LurnStack Trainer"}
                  </div>
                  <div className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-xs font-bold text-slate-700">
                    {formatIST(learningSummary.nextSession.liveClass?.scheduledAt || learningSummary.nextSession.scheduledAt)}
                  </div>
                  <Link
                    to={PATHS.COURSE_DETAILS.replace(":courseId", encodeURIComponent(String(learningSummary.nextSession.id)))}
                    className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#004d3d] px-4 text-xs font-extrabold text-white transition-colors hover:bg-[#00392d]"
                  >
                    View details <FiArrowRight />
                  </Link>
                </div>
              ) : (
                <div className="mt-3 text-sm font-semibold text-slate-600">
                  No upcoming learning session yet.
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className={isLiveClassesView ? "lg:col-span-12 space-y-8" : "lg:col-span-12 space-y-8"}>
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          {actionNotice ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
              {actionNotice}
            </div>
          ) : null}

          {learningError ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
              {learningError}
            </div>
          ) : null}

          {isLiveClassesView && titError ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {titError}
            </div>
          ) : null}

          {!isLiveClassesView ? (
            <SectionCard
              title="My learning sessions"
              right={learningLoading ? "Loading..." : `${learningSessions.length} sessions`}
            >
              {learningLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-56 animate-pulse rounded-2xl bg-slate-100" />
                  ))}
                </div>
              ) : learningSessions.length === 0 ? (
                <EmptyState
                  title="No learning sessions yet"
                  body="Your paid, free, and joined sessions will appear here after you start learning."
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {learningSessions.slice(0, 6).map((session) => (
                    <Link
                      key={session.id}
                      to={PATHS.COURSE_DETAILS.replace(":courseId", encodeURIComponent(String(session.id)))}
                      className="group overflow-hidden rounded-2xl border border-outline-variant bg-white transition-all hover:border-emerald-200 hover:shadow-sm"
                    >
                      <div className="relative h-28 bg-surface-variant">
                        <SmartImage
                          src={session.thumbnail}
                          alt={session.title}
                          className="h-full w-full object-cover"
                          fallbackClassName="h-full w-full bg-gradient-to-br from-slate-900 via-emerald-800 to-teal-500"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black text-[#00342b]">
                          {session.isFree ? "Free" : session.isPaid ? "Paid" : session.price || "Session"}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="text-sm font-extrabold leading-snug text-on-surface line-clamp-2">
                          {session.title}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-on-surface-variant line-clamp-1">
                          {session.instructorName || session.instructor || "LurnStack Trainer"}
                        </div>
                        <div className="mt-3 text-[11px] font-bold text-emerald-800">
                          {formatIST(session.liveClass?.scheduledAt || session.scheduledAt)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {!learningLoading && learningSessions.length > 6 ? (
                <div className="mt-5">
                  <Link
                    to={PATHS.SESSIONS}
                    className="inline-flex items-center gap-2 text-sm font-extrabold text-[#004d3d] hover:underline"
                  >
                    View all sessions <FiArrowRight />
                  </Link>
                </div>
              ) : null}
            </SectionCard>
          ) : null}

          {isLiveClassesView ? (
            <section>
              <div className="pb-4">
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h1 className="text-[30px] font-extrabold tracking-tight text-slate-900 sm:text-[36px]">
                      TIT class sessions
                    </h1>
                    <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-700">
                      Browse your trainer-led live sessions in the same course card format, with price, schedule, details, and join access in one place.
                    </p>
                  </div>
                  <div className="text-sm font-bold text-slate-500">
                    {titLoading ? "Loading..." : `${titClassSessions.length} sessions`}
                  </div>
                </div>
              </div>

              {titLoading ? (
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-72 animate-pulse rounded-lg bg-gray-100" />
                  ))}
                </div>
              ) : titClassSessions.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                  <h2 className="text-xl font-extrabold text-gray-900">
                    No TIT classes available
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Published TIT sessions will appear here once the backend returns them.
                  </p>
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {titClassSessions.map((titClass) => (
                    <TitClassCard
                      key={titClass.id}
                      titClass={titClass}
                      now={now}
                      onOpenMeeting={openTitMeeting}
                    />
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {false ? (
          <SectionCard
            title="Upcoming live classes"
            right={loading ? "Loading..." : `${upcomingClasses.length} scheduled`}
          >
            <div className="space-y-4">
              {loading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : upcomingClasses.length === 0 ? (
                <EmptyState
                  title="No upcoming live classes"
                  body="When a class is scheduled, it will appear here."
                />
              ) : (
                upcomingClasses.map((lc) => (
                  <LiveClassCard
                    key={lc.id}
                    liveClass={lc}
                    joined={joinedByClassId[String(lc.id)]}
                    onJoin={handleJoin}
                  />
                ))
              )}
            </div>
          </SectionCard>
          ) : null}

          {!isLiveClassesView ? (
            <SectionCard
              title="My enrolled courses"
              right={loading ? "Loading..." : `${enrolledCourses.length} courses`}
            >
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {(loading ? Array.from({ length: 3 }) : enrolledCourses).map((c, idx) => (
                <div
                  key={c?.id || idx}
                  className="rounded-2xl border border-outline-variant bg-surface overflow-hidden hover:shadow-sm transition-shadow"
                >
                  <div className="h-24 bg-surface-variant">
                    <div
                      className={[
                        "w-full h-full bg-gradient-to-br",
                        c?.thumbnailBg || "from-slate-800 to-slate-600",
                      ].join(" ")}
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-extrabold text-on-surface line-clamp-1">
                      {c?.name || "Loading…"}
                    </div>
                    <div className="mt-1 text-xs text-on-surface-variant line-clamp-1">
                      {c?.instructor ? `Instructor: ${c.instructor}` : " "}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {!loading && enrolledCourses.length === 0 ? (
              <div className="mt-4">
                <EmptyState title="No enrolled courses" body="Enroll in a course to see it here." />
              </div>
            ) : null}
            </SectionCard>
          ) : null}

          {false ? (
          <SectionCard
            title="Completed classes"
            right={loading ? "Loading..." : `${completedClasses.length} classes`}
          >
            <div className="space-y-4">
              {loading ? (
                <SkeletonCard />
              ) : completedClasses.length === 0 ? (
                <EmptyState
                  title="No completed classes"
                  body="Completed classes will show here with recordings/materials."
                />
              ) : (
                completedClasses.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-outline-variant bg-surface p-5">
                    <div className="text-sm font-extrabold text-on-surface line-clamp-1">
                      {c.courseName} • {c.title}
                    </div>
                    <div className="mt-1 text-xs text-on-surface-variant">
                      Instructor: {c.instructorName} • Attendance:{" "}
                      <span className="font-semibold text-on-surface">
                        {c.attendanceStatus || "—"}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-3 flex-wrap text-sm">
                      {c.recordingUrl ? (
                        <a
                          href={c.recordingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-95 transition-opacity"
                        >
                          Recording
                        </a>
                      ) : null}
                      {(c.materials || []).map((m) => (
                        <a
                          key={m.url}
                          href={m.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface text-sm font-semibold hover:bg-surface-container-low transition-colors"
                        >
                          {m.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
          ) : null}
        </section>

        {false ? (
        <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
          <div className="rounded-2xl bg-surface p-5 sticky top-24 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-on-surface font-semibold">
                <FiBell className="w-4 h-4 text-primary" />
                Updates
              </div>
              <div className="text-xs font-semibold text-on-surface-variant">
                {loading ? "Loading..." : `${notifications.length} items`}
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {nextLive ? (
                <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-3 hover:bg-surface-container transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-variant flex-shrink-0">
                      <SmartImage
                        src={nextLive?.thumbnail}
                        alt={nextLive?.title || "Next live class"}
                        className="w-full h-full object-cover"
                        fallbackClassName="w-full h-full bg-gradient-to-br from-slate-900 via-emerald-800 to-teal-500"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold text-on-surface-variant truncate">
                        Next live class
                      </div>
                      <div className="mt-1 text-[12px] font-semibold text-on-surface-variant truncate">
                        {nextLive?.courseName || "—"}
                      </div>
                      <div className="mt-0.5 text-[13px] font-extrabold text-on-surface leading-snug line-clamp-2">
                        {nextLive?.title || "—"}
                      </div>
                      {nextWhen ? (
                        <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-on-surface-variant whitespace-nowrap">
                          <FiClock className="text-[13px]" />
                          {nextWhen}
                        </div>
                      ) : null}
                    </div>

                    {nextLive?.id != null ? (
                      <Link
                        to={PATHS.LIVE_CLASS_DETAILS.replace(
                          ":classId",
                          encodeURIComponent(String(nextLive.id))
                        )}
                        className="h-9 px-3 rounded-xl bg-primary text-on-primary text-xs font-extrabold inline-flex items-center gap-1.5 flex-shrink-0 hover:bg-primary/90 transition-colors self-center"
                      >
                        View <FiArrowRight />
                      </Link>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-on-surface-variant">No updates right now.</div>
              )}
            </div>
          </div>
        </aside>
        ) : null}
      </div>
    </main>
  );
}

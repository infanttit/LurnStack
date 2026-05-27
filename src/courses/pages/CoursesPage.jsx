import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiFilter, FiSearch } from "react-icons/fi";
import { HiMiniStar } from "react-icons/hi2";
import { useAuth } from "../../auth";
import AuthRequiredModal from "../../auth/components/AuthRequiredModal";
import {
  createStudentSessionBooking,
  getPublicSessions,
  getStudentSessions,
  joinStudentSession,
  rememberPaidSessionAccess,
  verifyRazorpayPayment,
} from "../api/studentSessionsApi";
import useNow from "../../live-classes/hooks/useNow";
import { formatDuration } from "../../live-classes/lib/time";
import { getSessionOccurrenceTiming, isSessionUnavailable } from "../../shared/utils/sessionTiming";
import { openMeetingLink, openPendingMeetingWindow } from "../../shared/utils/meetingWindow";
import { openRazorpayCheckout } from "../../shared/utils/razorpayCheckout";
import { formatAttendanceStatus } from "../api/studentAttendanceApi";
import { startAttendanceHeartbeat } from "../utils/attendanceHeartbeat";

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
  const { startMs, endMs } = getSessionOccurrenceTiming(liveClass, now, { defaultRecurring: false });
  if (!startMs) return "Schedule pending";
  if (now > endMs) return "Today's session completed";
  if (now >= startMs && now <= endMs) return "Live now";
  if (now < startMs) return `Join opens when class starts - ${formatDuration(startMs - now)} left`;
  return `Starts in ${formatDuration(startMs - now)}`;
}

function isSessionCompleted(liveClass, now = Date.now()) {
  const { startMs, endMs } = getSessionOccurrenceTiming(liveClass, now, { defaultRecurring: false });
  return startMs > 0 && now > endMs;
}

function getKolkataDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getCourseTiming(course, now) {
  return getSessionOccurrenceTiming(course.liveClass, now, { defaultRecurring: false });
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
  const needsPayment = isTrainerCourse && course.paymentRequired && !course.isPaid;
  const paymentReady = !course.paymentRequired || course.isPaid;
  const paying = actionId === `pay:${course.id}`;
  const canJoin = isTrainerCourse && paymentReady && !unavailable && startMs > 0 && now >= startMs && now <= endMs;
  const accessNotice = isCancelled
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

      <div className="p-2.5 flex-1 flex flex-col">
        <h3 className="font-extrabold text-[13px] text-gray-900 leading-snug line-clamp-2">
          {course.title}
        </h3>
        <p className="mt-0.5 truncate text-[11px] text-gray-500">{course.instructor}</p>

        {isTrainerCourse && liveClass ? (
          <div className="mt-2 rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1.5">
            <div className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-800">
              Live class
            </div>
            <div className="mt-1 truncate text-[11px] font-bold text-gray-800">
              {liveClass.title}
            </div>
            <div className="mt-1 truncate text-[10px] text-gray-500">
              {formatLiveWhen(occurrence.scheduledAt)} IST • {liveClass.durationMinutes} min
            </div>
            <div className="mt-1 truncate text-[10px] font-bold text-emerald-800">
              {isCancelled ? "Cancelled" : liveTimerLabel(liveClass, now)}
            </div>
            {accessNotice ? (
              <div className="mt-1 truncate text-[10px] font-semibold text-slate-600">
                {accessNotice}
              </div>
            ) : null}
            {attendanceStatus ? (
              <div className={["mt-1.5 inline-flex w-fit rounded-full px-2 py-0.5 text-[9px] font-extrabold", attendanceBadgeClass].join(" ")}>
                Attendance: {formatAttendanceStatus(attendanceStatus)}
              </div>
            ) : null}
            {isCancelled && cancellationReason ? (
              <div className="mt-2 rounded-md border border-red-100 bg-red-50 px-2 py-1.5 text-[11px] font-semibold text-red-700">
                Reason: {cancellationReason}
              </div>
            ) : null}
          </div>
        ) : null}

        {!isTrainerCourse ? (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="font-bold text-[12px] text-[#b4690e]">{course.rating}</span>
            <StarRating rating={course.rating} />
            <span className="truncate text-[10px] text-gray-500">({course.ratingCount})</span>
          </div>
        ) : null}

        <div className="mt-2 flex items-center justify-between gap-3">
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

        <div className={["mt-auto pt-2.5 grid gap-2", isTrainerCourse ? "grid-cols-1 min-[420px]:grid-cols-[1fr_auto]" : "grid-cols-1"].join(" ")}>
          {isTrainerCourse && needsPayment ? (
            <button
              type="button"
              disabled={paying || isCompleted || unavailable}
              onClick={onPayForClass}
              className="h-8 bg-[#00342b] hover:bg-[#004d40] text-white font-extrabold text-[11px] rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {paying ? "Opening..." : "Pay to Join"}
            </button>
          ) : isTrainerCourse ? (
            <button
              type="button"
              disabled={joining || !canJoin}
              onClick={onJoinClass}
              className="h-8 bg-[#00342b] hover:bg-[#004d40] text-white font-extrabold text-[11px] rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {joining ? "Opening..." : course.isJoined && canJoin ? "Rejoin" : canJoin ? "Join" : course.isPaid ? "Paid" : "Locked"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onViewDetails}
            className="h-8 border border-gray-300 hover:bg-gray-50 text-gray-900 font-extrabold text-[11px] rounded-md transition-colors min-[420px]:px-3"
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
  const tabs = useMemo(
    () => (sessions.length ? [...new Set(sessions.map((s) => s.tab).filter(Boolean))] : ["Trainer Courses"]),
    [sessions]
  );
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [searchQuery, setSearchQuery] = useState(routeSearchQuery);
  const [timeFilter, setTimeFilter] = useState("All");
  const tabsScrollerRef = useRef(null);
  const courses = useMemo(
    () => sessions.filter((session) => !activeTab || session.tab === activeTab),
    [activeTab, sessions]
  );
  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const now = Date.now();
    const todayKey = getKolkataDateKey(now);
    const source = q ? sessions : courses;
    return source.filter((course) => {
      const timing = getCourseTiming(course, now);
      const startsAt = timing.startMs;
      const hasSchedule = startsAt > 0;
      const matchesSearch =
        !q ||
        course.title.toLowerCase().includes(q) ||
        course.instructor.toLowerCase().includes(q) ||
        String(course.description || "").toLowerCase().includes(q) ||
        String(course.category || course.tab || "").toLowerCase().includes(q);
      const matchesTime =
        timeFilter === "All" ||
        (timeFilter === "Upcoming" && hasSchedule && startsAt >= now) ||
        (timeFilter === "Today" &&
          hasSchedule &&
          getKolkataDateKey(startsAt) === todayKey);
      return matchesSearch && matchesTime;
    });
  }, [courses, searchQuery, sessions, timeFilter]);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const now = useNow(1000);
  const [authPrompt, setAuthPrompt] = useState(null);
  const scrollTabs = useCallback((direction) => {
    const node = tabsScrollerRef.current;
    if (!node) return;
    const amount = Math.max(180, Math.floor(node.clientWidth * 0.72));
    node.scrollBy({ left: direction * amount, behavior: "smooth" });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const loader = isAuthenticated ? getStudentSessions() : getPublicSessions();
    loader
      .then((items) => {
        if (cancelled) return;
        setSessions(items);
        setActiveTab((current) => current || items[0]?.tab || "Trainer Courses");
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
  }, [isAuthenticated]);

  useEffect(() => {
    if (tabs.length && !tabs.includes(activeTab)) setActiveTab(tabs[0]);
  }, [activeTab, tabs]);

  useEffect(() => {
    setSearchQuery(routeSearchQuery);
  }, [routeSearchQuery]);

  const joinTrainerClass = useCallback(async (course) => {
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
    const startTracking = (sessionDate) =>
      startAttendanceHeartbeat({
        sessionId: course.id,
        sessionDate,
        scheduledAt: occurrence.scheduledAt,
        startsAt: occurrence.scheduledAt,
        endsAt: occurrence.endsAt,
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
        startTracking(sessionDate);
        setMessage("Opening live class.");
      } else {
        setError("Session joined, but the meeting link was not returned. Please open View details and try again.");
      }
    } catch (err) {
      const fallbackLink = course.liveClass?.meetUrl || course.meetUrl || "";
      if (openMeetingLink(meetingWindow, fallbackLink)) {
        const sessionDate = occurrence.scheduledAt ? occurrence.scheduledAt.slice(0, 10) : "";
        startTracking(sessionDate);
        setError(err?.message || "Attendance could not be recorded. Please try again during the active class time.");
      } else {
        meetingWindow?.close?.();
        setError(err?.message || "Unable to join session.");
      }
    } finally {
      setActionId("");
    }
  }, [isAuthenticated]);

  const payForTrainerClass = useCallback(async (course) => {
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
    if (occurrence.endMs && current > occurrence.endMs) {
      setError("Today's session has already completed.");
      return;
    }

    setActionId(`pay:${course.id}`);
    setError("");
    try {
      const sessionDate = occurrence.scheduledAt ? occurrence.scheduledAt.slice(0, 10) : "";
      const booking = await createStudentSessionBooking(course.id, { sessionDate });
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
        });
      }
      rememberPaidSessionAccess(course.id);
      setSessions((prev) =>
        prev.map((item) =>
          String(item.id) === String(course.id)
            ? {
                ...item,
                isPaid: true,
                bookingStatus: "paid",
                liveClass: {
                  ...item.liveClass,
                  isPaid: true,
                  bookingStatus: "paid",
                },
              }
            : item
        )
      );
      setMessage("Payment verified. You can join when the class access window opens.");
    } catch (err) {
      setError(err?.message || "Payment could not be completed.");
    } finally {
      setActionId("");
    }
  }, [isAuthenticated]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
      <section className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5 shadow-sm">
        {message ? (
          <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions, skills, or experts..."
              className="w-full h-12 rounded-xl border border-gray-200 pl-11 pr-4 text-sm outline-none focus:border-[#006b58] focus:ring-4 focus:ring-emerald-900/5"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  navigate("/courses", { replace: true });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-extrabold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                Clear
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", "Upcoming", "Today"].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setTimeFilter(filter)}
                className={[
                  "h-12 px-4 rounded-xl text-sm font-extrabold inline-flex items-center gap-2 transition-colors",
                  timeFilter === filter
                    ? "bg-[#00342b] text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100",
                ].join(" ")}
              >
                <FiFilter className="text-[15px]" />
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[auto_1fr_auto] items-end border-b border-gray-200">
          <button
            type="button"
            onClick={() => scrollTabs(-1)}
            className="mb-2 mr-1 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
            aria-label="Scroll categories left"
          >
            <FiChevronLeft />
          </button>
          <div
            ref={tabsScrollerRef}
            className="overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex gap-0 min-w-max">
              {tabs.map((tab) => (
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
          <button
            type="button"
            onClick={() => scrollTabs(1)}
            className="mb-2 ml-1 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
            aria-label="Scroll categories right"
          >
            <FiChevronRight />
          </button>
        </div>
      </section>

      {loading ? (
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <h2 className="text-xl font-extrabold text-gray-900">
            {searchQuery ? "No matching sessions found" : "No sessions available yet"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {searchQuery
              ? "Clear the search or try a different keyword to see available sessions."
              : "New expert-led sessions will appear here once they are published."}
          </p>
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
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <AuthRequiredModal
        open={!!authPrompt}
        title={authPrompt?.title}
        message={authPrompt?.message}
        from={authPrompt?.from}
        onClose={() => setAuthPrompt(null)}
      />
    </main>
  );
}


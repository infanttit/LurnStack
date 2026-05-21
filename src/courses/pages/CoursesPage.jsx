import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiClock, FiFilter, FiSearch, FiUsers } from "react-icons/fi";
import { HiMiniStar } from "react-icons/hi2";
import { useAuth } from "../../auth";
import AuthRequiredModal from "../../auth/components/AuthRequiredModal";
import {
  createStudentSessionBooking,
  getStudentSessions,
  joinStudentSession,
  verifyRazorpayPayment,
} from "../api/studentSessionsApi";
import { getAllCourses } from "../data/courseCatalog";
import useNow from "../../live-classes/hooks/useNow";
import { formatDuration } from "../../live-classes/lib/time";
import { getSessionOccurrenceTiming, isSessionUnavailable } from "../../shared/utils/sessionTiming";
import { openMeetingLink, openPendingMeetingWindow } from "../../shared/utils/meetingWindow";
import { openRazorpayCheckout } from "../../shared/utils/razorpayCheckout";

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
  const { startMs, endMs } = getSessionOccurrenceTiming(liveClass, now, { defaultRecurring: true });
  if (!startMs) return "Schedule pending";
  const joinOpensMs = startMs - 5 * 60 * 1000;
  if (now > endMs) return "Today's session completed";
  if (now >= startMs && now <= endMs) return "Live now";
  if (now < joinOpensMs) return `Join opens 5 minutes before class - ${formatDuration(joinOpensMs - now)} left`;
  return `Starts in ${formatDuration(startMs - now)}`;
}

function isSessionCompleted(liveClass, now = Date.now()) {
  const { startMs, endMs } = getSessionOccurrenceTiming(liveClass, now, { defaultRecurring: true });
  return startMs > 0 && now > endMs;
}

function getGuestCourses() {
  return getAllCourses()
    .slice(0, 12)
    .map((course) => ({
      ...course,
      tab: course.tab || "Popular Courses",
      instructor: course.instructor || course.instructorName || "LurnStack Faculty",
      instructorName: course.instructorName || course.instructor || "LurnStack Faculty",
      rating: course.rating || 4.7,
      ratingCount: course.ratingCount || "Live lesson",
      price: course.price || "₹499",
      level: course.level || "All Levels",
      createdByTrainer: false,
    }));
}

function CourseGridCard({ course, liveClass, onViewDetails, onJoinClass, onPayForClass, actionId, now }) {
  const isTrainerCourse = !!course.createdByTrainer;
  const isCancelled = String(liveClass?.status || course.status || "").toLowerCase() === "cancelled";
  const unavailable = isSessionUnavailable(liveClass);
  const cancellationReason = liveClass?.cancellationReason || course.cancellationReason || "";
  const joining = actionId === `join:${course.id}`;
  const occurrence = getSessionOccurrenceTiming(liveClass, now, { defaultRecurring: true });
  const { startMs, endMs } = occurrence;
  const joinOpensMs = startMs - 5 * 60 * 1000;
  const isCompleted = isSessionCompleted(liveClass, now);
  const needsPayment = isTrainerCourse && course.paymentRequired && !course.isPaid;
  const paymentReady = !course.paymentRequired || course.isPaid;
  const paying = actionId === `pay:${course.id}`;
  const canJoin = isTrainerCourse && paymentReady && !unavailable && startMs > 0 && now >= joinOpensMs && now <= endMs;
  const accessNotice = isCancelled
    ? ""
    : isCompleted
      ? "Today's session completed."
      : isTrainerCourse && startMs > 0 && now < joinOpensMs
        ? "You can join from 5 minutes before the class starts."
        : isTrainerCourse && canJoin
          ? "Join is open now."
          : "";

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col">
      <div className="w-full aspect-[16/9] overflow-hidden bg-gray-100">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${course.thumbnailBg}`} />
        )}
      </div>

      <div className="p-3.5 flex-1 flex flex-col">
        <h3 className="font-extrabold text-[14px] text-gray-900 leading-snug line-clamp-2">
          {course.title}
        </h3>
        <p className="mt-1 text-[12px] text-gray-500">{course.instructor}</p>

        {isTrainerCourse && liveClass ? (
          <div className="mt-2.5 rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-2">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800">
              Live class
            </div>
            <div className="mt-1 text-[11px] font-semibold text-gray-700 line-clamp-1">
              {liveClass.title}
            </div>
            <div className="mt-1 text-[11px] text-gray-500">
              {formatLiveWhen(occurrence.scheduledAt)} IST • {liveClass.durationMinutes} min
            </div>
            <div className="mt-1 text-[11px] font-bold text-emerald-800">
              {isCancelled ? "Cancelled" : liveTimerLabel(liveClass, now)}
            </div>
            {accessNotice ? (
              <div className="mt-1.5 text-[11px] font-semibold text-slate-600">
                {accessNotice}
              </div>
            ) : null}
            {isCancelled && cancellationReason ? (
              <div className="mt-2 rounded-md border border-red-100 bg-red-50 px-2 py-1.5 text-[11px] font-semibold text-red-700">
                Reason: {cancellationReason}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-2 flex items-center gap-1.5">
          <span className="font-bold text-[13px] text-[#b4690e]">{course.rating}</span>
          <StarRating rating={course.rating} />
          <span className="text-[11px] text-gray-500">({course.ratingCount})</span>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[15px] text-gray-900">{course.price}</span>
            {course.oldPrice && (
              <span className="text-[12px] text-gray-400 line-through">{course.oldPrice}</span>
            )}
          </div>
          {course.badge && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm ${isCompleted ? "bg-slate-100 text-slate-700" : course.badgeColor}`}>
              {isCompleted ? "Completed today" : course.badge}
            </span>
          )}
        </div>

        <div className={["mt-3 grid gap-2", isTrainerCourse ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"].join(" ")}>
          {isTrainerCourse && needsPayment ? (
            <button
              type="button"
              disabled={paying || isCompleted || unavailable}
              onClick={onPayForClass}
              className="h-9 bg-[#00342b] hover:bg-[#004d40] text-white font-extrabold text-[12px] rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {paying ? "Opening..." : "Pay to Join"}
            </button>
          ) : isTrainerCourse ? (
            <button
              type="button"
              disabled={joining || !canJoin}
              onClick={onJoinClass}
              className="h-9 bg-[#00342b] hover:bg-[#004d40] text-white font-extrabold text-[12px] rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {joining ? "Opening..." : course.isJoined && canJoin ? "Rejoin" : canJoin ? "Join" : course.isPaid ? "Paid" : "Locked"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onViewDetails}
            className="h-9 border border-gray-300 hover:bg-gray-50 text-gray-900 font-extrabold text-[12px] rounded-md transition-colors"
          >
              View details
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
  const tabs = useMemo(
    () => (sessions.length ? [...new Set(sessions.map((s) => s.tab).filter(Boolean))] : ["Trainer Courses"]),
    [sessions]
  );
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("All");
  const courses = useMemo(
    () => sessions.filter((session) => !activeTab || session.tab === activeTab),
    [activeTab, sessions]
  );
  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const now = Date.now();
    return courses.filter((course) => {
      const liveClass = course.liveClass;
      const startsAt = getSessionOccurrenceTiming(liveClass, now, { defaultRecurring: true }).startMs;
      const matchesSearch =
        !q ||
        course.title.toLowerCase().includes(q) ||
        course.instructor.toLowerCase().includes(q) ||
        String(course.description || "").toLowerCase().includes(q);
      const matchesTime =
        timeFilter === "All" ||
        (timeFilter === "Upcoming" && Number.isFinite(startsAt) && startsAt >= now) ||
        (timeFilter === "Today" &&
          Number.isFinite(startsAt) &&
          new Date(startsAt).toDateString() === new Date().toDateString());
      return matchesSearch && matchesTime;
    });
  }, [courses, searchQuery, timeFilter]);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const now = useNow(1000);
  const [authPrompt, setAuthPrompt] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const loader = isAuthenticated ? getStudentSessions() : Promise.resolve(getGuestCourses());
    loader
      .then((items) => {
        if (cancelled) return;
        setSessions(items);
        setActiveTab((current) => current || items[0]?.tab || "Trainer Courses");
      })
      .catch((err) => {
        if (!cancelled) {
          setSessions(getGuestCourses());
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

  const joinTrainerClass = useCallback(async (course) => {
    if (!isAuthenticated) {
      setAuthPrompt({
        title: "Log in to join this class",
        message: "Register or log in first. After authentication, you can return here and join when the session opens.",
      });
      return;
    }
    const current = Date.now();
    if (isSessionUnavailable(course.liveClass)) {
      setError("This class session is not available.");
      return;
    }
    const { startMs, endMs } = getSessionOccurrenceTiming(course.liveClass, current, { defaultRecurring: true });
    const joinOpensMs = startMs - 5 * 60 * 1000;
    if (current > endMs) {
      setError("Today's session has already completed.");
      return;
    }
    if (current < joinOpensMs) {
      setError("Join opens 5 minutes before the class starts.");
      return;
    }
    const meetingWindow = openPendingMeetingWindow();
    setActionId(`join:${course.id}`);
    setError("");
    try {
      const result = await joinStudentSession(course.id);
      setSessions((prev) =>
        prev.map((item) =>
          String(item.id) === String(course.id) ? { ...item, isJoined: true } : item
        )
      );
      const meetingLink = result?.meetingLink || course.liveClass?.meetUrl || course.meetUrl || "";
      if (openMeetingLink(meetingWindow, meetingLink)) {
        setMessage("Opening live class.");
      } else {
        setError("Session joined, but the meeting link was not returned. Please open View details and try again.");
      }
    } catch (err) {
      const fallbackLink = course.liveClass?.meetUrl || course.meetUrl || "";
      if (openMeetingLink(meetingWindow, fallbackLink)) {
        setError("Attendance sync failed, but the live class link has been opened.");
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
      });
      return;
    }
    const current = Date.now();
    if (isSessionUnavailable(course.liveClass)) {
      setError("This class session is not available.");
      return;
    }
    const occurrence = getSessionOccurrenceTiming(course.liveClass, current, { defaultRecurring: true });
    if (occurrence.endMs && current > occurrence.endMs) {
      setError("Today's session has already completed.");
      return;
    }

    setActionId(`pay:${course.id}`);
    setError("");
    try {
      const sessionDate = occurrence.scheduledAt ? occurrence.scheduledAt.slice(0, 10) : "";
      const booking = await createStudentSessionBooking(course.id, { sessionDate });
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
      <section className="rounded-2xl bg-[#00342b] text-white overflow-hidden shadow-sm">
        <div className="p-5 sm:p-7 lg:p-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest">
              <FiUsers />
              Live learning marketplace
            </div>
            <h1 className="mt-4 text-[28px] sm:text-[40px] font-extrabold leading-tight">
              Upcoming expert-led sessions
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/75 max-w-2xl">
              Browse published live classes, add sessions to your cart, review the details, and join when the access window opens.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/10 border border-white/10 p-4">
              <FiCalendar className="text-lg text-white/90" />
              <div className="mt-3 text-2xl font-extrabold">{courses.length}</div>
              <div className="text-xs text-white/65 font-semibold">Published sessions</div>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/10 p-4">
              <FiClock className="text-lg text-white/90" />
              <div className="mt-3 text-2xl font-extrabold">IST</div>
              <div className="text-xs text-white/65 font-semibold">Asia/Kolkata timezone</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white border border-gray-200 p-4 sm:p-5 shadow-sm">
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

        <div className="mt-5 border-b border-gray-200 overflow-x-auto no-scrollbar">
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
      </section>

      {loading ? (
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <h2 className="text-xl font-extrabold text-gray-900">No sessions available yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            New expert-led sessions will appear here once they are published.
          </p>
        </div>
      ) : (
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
        onClose={() => setAuthPrompt(null)}
      />
    </main>
  );
}


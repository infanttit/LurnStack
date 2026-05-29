import { useEffect, useMemo, useState } from "react";
import { FiArrowRight, FiClock, FiCreditCard, FiRefreshCcw, FiSearch } from "react-icons/fi";
import { PATHS } from "../app/router/paths";
import AuthRequiredModal from "../auth/components/AuthRequiredModal";
import { useAuth } from "../auth";
import {
  createStudentSessionBooking,
  getPublicUpcomingSessions,
  hasPaidSessionAccess,
  joinStudentSession,
  rememberPaidSessionAccess,
  verifyRazorpayPayment,
} from "../courses/api/studentSessionsApi";
import { openMeetingLink, openPendingMeetingWindow } from "../shared/utils/meetingWindow";
import { openRazorpayCheckout } from "../shared/utils/razorpayCheckout";
import { formatDuration } from "../live-classes/lib/time";
import { getSessionOccurrenceTiming, isSessionUnavailable } from "../shared/utils/sessionTiming";

function formatIST(iso) {
  const date = new Date(iso);
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

function priceLabel(session) {
  if (session?.isFree) return "FREE";
  if (session?.priceINR) return `₹${session.priceINR}`;
  const amount = Number(session?.amountPaise || 0);
  if (amount > 0) {
    return `₹${(amount / 100).toFixed(amount % 100 === 0 ? 0 : 2)}`;
  }
  return "Paid";
}

function SessionCard({ session, now, onJoin, onPay, actionId, isAuthenticated }) {
  const occurrence = getSessionOccurrenceTiming(session.liveClass || session, now, { defaultRecurring: false });
  const isUnavailable = isSessionUnavailable(session.liveClass || session);
  const loadingJoin = actionId === `join:${session.id}`;
  const loadingPay = actionId === `pay:${session.id}`;
  const isOpen = occurrence.startMs > 0 && now >= occurrence.startMs && now <= occurrence.endMs;
  const hasValidBooking =
    session.isPaid === true ||
    session.bookingStatus === "paid" ||
    hasPaidSessionAccess(session.id);
  const joinText = session.isFree
    ? isOpen
      ? "Join Session"
      : `Join opens in ${formatDuration(occurrence.startMs - now)}`
    : hasValidBooking
      ? isOpen
        ? "Join Session"
        : `Join opens in ${formatDuration(occurrence.startMs - now)}`
      : `Buy & Join — ${priceLabel(session)}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
      <div className="relative aspect-[16/8] overflow-hidden bg-gray-100">
        {session.thumbnail ? (
          <img
            src={session.thumbnail}
            alt={session.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-950 via-teal-800 to-cyan-600 p-5 text-center">
            <span className="text-lg font-black text-white/30">{session.category || "LurnStack"}</span>
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-black text-[#00342b] shadow-[0_14px_34px_rgba(3,52,43,0.20)] ring-1 ring-emerald-900/5">
          {priceLabel(session)}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-[#004d3d] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow">
          {session.isFree ? "Free" : "Paid"}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
          {session.category || "Upcoming Session"}
        </p>
        <h3 className="mt-2 text-[15px] font-extrabold leading-snug text-gray-950 line-clamp-2">
          {session.title}
        </h3>
        <p className="mt-1 text-[12px] font-medium text-gray-500">
          Trainer: {session.instructorName || session.instructor || "LurnStack Trainer"}
        </p>

        <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-800">
            <FiClock className="text-[13px]" />
            Start Time
          </div>
          <div className="mt-1 text-[12px] font-bold text-gray-800">
            {formatIST(occurrence.scheduledAt || session.scheduledAt)}
          </div>
          <div className="mt-1 text-[11px] font-semibold text-slate-600">
            Reminder emails are sent 10 minutes before class starts.
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700">
            {session.isFree ? "FREE" : priceLabel(session)}
          </span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
            {occurrence.isRecurring ? "Recurring" : "One-time"}
          </span>
        </div>

        <div className="mt-auto pt-4">
          {session.isFree ? (
            <button
              type="button"
              disabled={loadingJoin || isUnavailable || !isOpen}
              onClick={() => onJoin(session)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#004d3d] text-[13px] font-bold text-white transition-all hover:bg-[#00392d] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              {loadingJoin ? "Opening..." : joinText}
              {!loadingJoin ? <FiArrowRight /> : null}
            </button>
          ) : hasValidBooking ? (
            <button
              type="button"
              disabled={loadingJoin || isUnavailable || !isOpen}
              onClick={() => onJoin(session)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#004d3d] text-[13px] font-bold text-white transition-all hover:bg-[#00392d] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              {loadingJoin ? "Opening..." : joinText}
              {!loadingJoin ? <FiArrowRight /> : null}
            </button>
          ) : (
            <button
              type="button"
              disabled={loadingPay || isUnavailable}
              onClick={() => onPay(session)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#004d3d] text-[13px] font-bold text-white transition-all hover:bg-[#00392d] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              {loadingPay ? "Opening..." : joinText}
              {!loadingPay ? <FiCreditCard /> : null}
            </button>
          )}
        </div>

        {!isAuthenticated ? (
          <p className="mt-3 text-[11px] text-slate-500">
            Log in to complete payment or join a live session.
          </p>
        ) : null}
      </div>
    </article>
  );
}

export default function StudentSessionsPage() {
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actionId, setActionId] = useState("");
  const [authPrompt, setAuthPrompt] = useState(null);
  const now = Date.now();

  const loadSessions = async (isBackground = false) => {
    if (isBackground) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const items = await getPublicUpcomingSessions();
      setSessions(items || []);
    } catch (err) {
      setSessions([]);
      setError(err?.message || "Unable to load upcoming sessions.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSessions(false);
  }, []);

  const filteredSessions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((session) => {
      return (
        String(session.title || "").toLowerCase().includes(q) ||
        String(session.instructorName || session.instructor || "").toLowerCase().includes(q) ||
        String(session.category || "").toLowerCase().includes(q)
      );
    });
  }, [search, sessions]);

  const handleJoin = async (session) => {
    if (!isAuthenticated) {
      setAuthPrompt({
        title: "Log in to join this session",
        message: "Please log in or register first. After login, you can continue from this session page.",
        from: PATHS.SESSIONS,
      });
      return;
    }

    const live = session.liveClass || session;
    const occurrence = getSessionOccurrenceTiming(live, Date.now(), { defaultRecurring: false });
    if (isSessionUnavailable(live)) {
      setError("This session is not available anymore.");
      return;
    }
    const hasValidBooking =
      session.isFree === true ||
      session.isPaid === true ||
      session.bookingStatus === "paid" ||
      hasPaidSessionAccess(session.id);

    if (!hasValidBooking) {
      setError("Please complete payment before joining this session.");
      return;
    }
    if (!occurrence.startMs || Date.now() < occurrence.startMs) {
      setError("Join opens 5 minutes before the session starts.");
      return;
    }

    const meetingWindow = openPendingMeetingWindow();
    setActionId(`join:${session.id}`);
    setError("");
    try {
      const result = await joinStudentSession(session.id, {
        sessionDate: occurrence.scheduledAt ? occurrence.scheduledAt.slice(0, 10) : "",
        scheduledAt: occurrence.scheduledAt,
        startsAt: occurrence.scheduledAt,
        endsAt: occurrence.endsAt,
      });
      const meetingLink = result?.meetingLink || live?.meetUrl || session?.liveClass?.meetUrl || "";
      if (openMeetingLink(meetingWindow, meetingLink)) {
        setMessage("Opening live session.");
      } else {
        setError("The meeting link was not returned. Please try again later.");
      }
    } catch (err) {
      const fallbackLink = live?.meetUrl || session?.liveClass?.meetUrl || "";
      if (openMeetingLink(meetingWindow, fallbackLink)) {
        setError(err?.message || "Joined session, but attendance could not be recorded.");
      } else {
        meetingWindow?.close?.();
        setError(err?.message || "Unable to join this session.");
      }
    } finally {
      setActionId("");
    }
  };

  const handlePay = async (session) => {
    if (!isAuthenticated) {
      setAuthPrompt({
        title: "Log in to buy this session",
        message: "Please log in or register first. After login, you can complete payment from this page.",
        from: PATHS.SESSIONS,
      });
      return;
    }

    const live = session.liveClass || session;
    if (isSessionUnavailable(live)) {
      setError("This session is not available anymore.");
      return;
    }

    const hasValidBooking =
      session.isFree === true ||
      session.isPaid === true ||
      session.bookingStatus === "paid" ||
      hasPaidSessionAccess(session.id);
    if (hasValidBooking) {
      setError("You already have access to this session. Please join instead of paying again.");
      return;
    }

    const occurrence = getSessionOccurrenceTiming(live, Date.now(), { defaultRecurring: false });
    if (occurrence.endMs && Date.now() > occurrence.endMs) {
      setError("This session has already finished.");
      return;
    }

    setActionId(`pay:${session.id}`);
    setError("");
    try {
      const sessionDate = occurrence.scheduledAt ? occurrence.scheduledAt.slice(0, 10) : "";
      const booking = await createStudentSessionBooking(session.id, { sessionDate });
      if (!booking.alreadyPaid) {
        const payment = await openRazorpayCheckout({
          keyId: booking.keyId,
          amountPaise: booking.amountPaise || session.amountPaise || 0,
          currency: booking.currency || "INR",
          razorpayOrderId: booking.razorpayOrderId,
          sessionTitle: session.title,
          student: booking.student,
        });
        await verifyRazorpayPayment({
          bookingId: booking.bookingId,
          razorpayOrderId: payment.razorpay_order_id || booking.razorpayOrderId,
          razorpayPaymentId: payment.razorpay_payment_id,
          razorpaySignature: payment.razorpay_signature,
        });
      }
      rememberPaidSessionAccess(session.id);
      setSessions((prev) =>
        prev.map((item) =>
          String(item.id) === String(session.id)
            ? { ...item, isPaid: true, bookingStatus: "paid" }
            : item
        )
      );
      setMessage("Payment verified. You can join when the access window opens.");
    } catch (err) {
      setError(err?.message || "Payment could not be completed.");
    } finally {
      setActionId("");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14">
      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">
              Student sessions
            </p>
            <h1 className="mt-2 text-3xl font-black text-gray-950 sm:text-4xl">
              Upcoming live sessions
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-600">
              Browse all published sessions, see the Free or Paid badge, and join or pay when the access window opens.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadSessions(true)}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#004d3d] px-5 text-sm font-bold text-white transition-all hover:bg-[#00392d] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <FiRefreshCcw className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search sessions, trainers, or categories..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-[16px] outline-none transition-all focus:border-[#004d3d] focus:ring-4 focus:ring-[#004d3d]/5"
            />
          </div>
          <button
            type="button"
            onClick={() => loadSessions(true)}
            className="h-12 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Reload sessions
          </button>
        </div>
      </section>

      {message ? (
        <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <section className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-[420px] animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <h2 className="text-xl font-black text-gray-950">
              {search ? "No matching sessions found" : "No upcoming sessions yet"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {search
                ? "Clear the search and try again."
                : "Published sessions will appear here once the backend returns them."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                now={now}
                onJoin={handleJoin}
                onPay={handlePay}
                actionId={actionId}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}
      </section>

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

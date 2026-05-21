import React, { useEffect, useMemo, useState, useRef } from "react";
import { FaCheck } from "react-icons/fa";
import { HiMiniStar } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  createStudentSessionBooking,
  joinStudentSession,
  verifyRazorpayPayment,
} from "../../courses/api/studentSessionsApi";
import useNow from "../../live-classes/hooks/useNow";
import { formatDuration } from "../../live-classes/lib/time";
import { getSessionOccurrenceTiming, isSessionUnavailable } from "../../shared/utils/sessionTiming";
import { useAuth } from "../../auth";
import AuthRequiredModal from "../../auth/components/AuthRequiredModal";
import { openMeetingLink, openPendingMeetingWindow } from "../../shared/utils/meetingWindow";
import { openRazorpayCheckout } from "../../shared/utils/razorpayCheckout";

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <HiMiniStar
          key={s}
          className={`text-[12px] ${
            s <= Math.round(rating) ? "text-[#f69c08]" : "text-gray-300"
          }`}
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

function formatINRFromPaise(amountPaise) {
  const amount = Number(amountPaise || 0);
  if (!amount) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: amount % 100 === 0 ? 0 : 2,
  }).format(amount / 100);
}

/**
 * CourseCard Component
 * High-fidelity Udemy-style interactive course card.
 */
export default function CourseCard({
  id,
  thumbnail,
  category,
  title,
  rating,
  ratingCount,
  instructorName,
  price,
  originalPrice,
  badge,
  totalHours,
  level,
  description,
  takeaways: customTakeaways,
  createdByTrainer = false,
  liveClass = null,
  amountPaise = 0,
  currency = "INR",
  paymentRequired = false,
  isPaid = false
}) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewSide, setPreviewSide] = useState("right");
  const [canHover, setCanHover] = useState(true);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const cardRef = useRef(null);
  const timerRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const [authPrompt, setAuthPrompt] = useState(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paymentAction, setPaymentAction] = useState("");
  const now = useNow(1000);
  const occurrence = getSessionOccurrenceTiming(liveClass, now, { defaultRecurring: true });
  const { startMs, endMs } = occurrence;
  const joinOpensMs = startMs - 5 * 60 * 1000;
  const isLiveNow = startMs > 0 && now >= startMs && now <= endMs;
  const isEnded = startMs > 0 && now > endMs;
  const isCancelled = String(liveClass?.status || "").toLowerCase() === "cancelled";
  const unavailable = isSessionUnavailable(liveClass);
  const cancellationReason = liveClass?.cancellationReason || "";
  const effectivePaid = isPaid || paymentVerified;
  const needsPayment = createdByTrainer && paymentRequired && !effectivePaid;
  const canJoin = createdByTrainer && !needsPayment && !unavailable && startMs > 0 && now >= joinOpensMs && now <= endMs;
  const timerLabel = !startMs
    ? "Schedule pending"
    : isCancelled
      ? "Cancelled"
      : isEnded
      ? "Today's session completed"
      : isLiveNow
        ? "Live now"
        : now < joinOpensMs
          ? `Join opens 5 minutes before class - ${formatDuration(joinOpensMs - now)} left`
          : `Starts in ${formatDuration(startMs - now)}`;
  const accessNotice = isCancelled
    ? ""
    : isEnded
      ? "Today's session completed."
      : createdByTrainer && startMs > 0 && now < joinOpensMs
        ? "You can join from 5 minutes before the class starts."
        : createdByTrainer && canJoin
          ? "Join is open now."
          : "";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setCanHover(window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches ?? true);
    } catch {
      setCanHover(true);
    }
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!canHover) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const spaceRight = window.innerWidth - rect.right;
        setPreviewSide(spaceRight < 360 ? "left" : "right");
        setShowPreview(true);
      }
    }, 200);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowPreview(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const priceLabel = useMemo(() => {
    if (createdByTrainer && amountPaise > 0) return formatINRFromPaise(amountPaise);
    if (price === 0) return "Free";
    const p = typeof price === "number" ? price * 80 : 499;
    return `₹${p.toLocaleString()}`;
  }, [amountPaise, createdByTrainer, price]);

  const originalLabel = useMemo(() => {
    if (!originalPrice) return null;
    const p = typeof originalPrice === "number" ? originalPrice * 80 : 3499;
    return `₹${p.toLocaleString()}`;
  }, [originalPrice]);

  const handleViewDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (createdByTrainer) {
      navigate(`/courses/${encodeURIComponent(String(id))}`);
      return;
    }
    setMobilePreviewOpen(true);
  };

  const handlePayForClass = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setAuthPrompt({
        title: "Log in to pay for this class",
        message: "Register or log in first. After payment verification, you can join when the session opens.",
      });
      return;
    }
    if (!createdByTrainer || !needsPayment || isEnded || unavailable) return;

    setPaymentAction("pay");
    try {
      const sessionDate = occurrence.scheduledAt ? occurrence.scheduledAt.slice(0, 10) : "";
      const booking = await createStudentSessionBooking(id, { sessionDate });
      const payment = await openRazorpayCheckout({
        keyId: booking.keyId,
        amountPaise: booking.amountPaise || amountPaise,
        currency: booking.currency || currency || "INR",
        razorpayOrderId: booking.razorpayOrderId,
        sessionTitle: title,
        student: booking.student,
      });
      await verifyRazorpayPayment({
        bookingId: booking.bookingId,
        razorpayOrderId: payment.razorpay_order_id || booking.razorpayOrderId,
        razorpayPaymentId: payment.razorpay_payment_id,
        razorpaySignature: payment.razorpay_signature,
      });
      setPaymentVerified(true);
    } catch (err) {
      setAuthPrompt({
        title: "Payment not completed",
        message: err?.message || "Please try the payment again.",
      });
    } finally {
      setPaymentAction("");
    }
  };

  const handleJoinClass = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setAuthPrompt({
        title: "Log in to join this class",
        message: "Register or log in first. After authentication, you can continue with this session.",
      });
      return;
    }
    if (createdByTrainer && needsPayment) {
      await handlePayForClass(e);
      return;
    }
    if (createdByTrainer && !canJoin) {
      return;
    }
    const meetingWindow = openPendingMeetingWindow();
    try {
      const result = await joinStudentSession(id);
      const meetingLink = result?.meetingLink || liveClass?.meetUrl || "";
      if (openMeetingLink(meetingWindow, meetingLink)) {
        return;
      }
    } catch {
      if (openMeetingLink(meetingWindow, liveClass?.meetUrl || "")) {
        return;
      }
      meetingWindow?.close?.();
    }
    navigate(`/courses/${encodeURIComponent(String(id))}`);
  };

  const takeaways = customTakeaways || [
    "Master advanced industry workflows and best practices.",
    "Build a production-ready portfolio with real projects.",
    "Comprehensive curriculum with lifetime access to updates.",
    "Step-by-step guidance from expert industry professionals."
  ];

  return (
    <div 
      ref={cardRef}
      className={`relative border border-gray-200 bg-white rounded-sm cursor-pointer transition-all duration-200 min-w-0 ${isHovered ? "z-[1000]" : "z-0"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ boxShadow: isHovered ? "0 0 0 2px #059669" : undefined }}
    >
      {/* ── Main List Card ── */}
      <div className="flex flex-col h-full group">
        {/* Thumbnail */}
        <div className="w-full h-[140px] sm:h-[160px] overflow-hidden bg-gray-100 relative">
          {thumbnail ? (
            <img src={thumbnail} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-teal-600 flex items-center justify-center">
               <span className="text-white/20 font-black text-4xl select-none">LurnStack</span>
            </div>
          )}
          {isHovered && <div className="absolute inset-0 bg-black/10 transition-opacity" />}
        </div>
        
        {/* Card body */}
        <div className="p-3 flex flex-col gap-1.5 flex-1 min-w-0">
          <h3 className="font-bold text-[14px] text-gray-900 leading-snug line-clamp-2 break-words">
            {title}
          </h3>
          <p className="text-[12px] text-gray-500 line-clamp-1 break-words">{instructorName}</p>
          
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[13px] text-[#b4690e]">{rating || 4.8}</span>
            <StarRating rating={rating || 4.8} />
            <span className="text-[11px] text-gray-500">({(ratingCount || 1200).toLocaleString()})</span>
          </div>
          
          {badge && (
            <span className={[
              "self-start text-[10px] font-bold px-1.5 py-[2px] rounded-sm",
              isEnded ? "bg-slate-100 text-slate-700" : "bg-[#eceb98] text-[#3d3c0a]",
            ].join(" ")}>
              {isEnded ? "Completed today" : badge}
            </span>
          )}

          {createdByTrainer && liveClass ? (
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-2">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800">
                Live class
              </div>
              <div className="mt-1 text-[11px] font-semibold text-gray-700 line-clamp-1">
                {liveClass.title}
              </div>
              <div className="mt-1 text-[10px] text-gray-500 line-clamp-1">
                {formatLiveWhen(occurrence.scheduledAt)} IST
              </div>
              <div className="mt-1 text-[10px] font-extrabold text-emerald-800">
                {timerLabel}
              </div>
              {accessNotice ? (
                <div className="mt-1 text-[10px] font-semibold text-slate-600">
                  {accessNotice}
                </div>
              ) : null}
              {isCancelled && cancellationReason ? (
                <div className="mt-2 rounded-md border border-red-100 bg-red-50 px-2 py-1.5 text-[10px] font-semibold text-red-700">
                  Reason: {cancellationReason}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-bold text-[15px] text-gray-900">{priceLabel}</span>
            {originalLabel && (
              <span className="text-[12px] text-gray-400 line-through">{originalLabel}</span>
            )}
          </div>

          {/* Mobile actions */}
          <div className={["grid gap-2 mt-3 sm:hidden", createdByTrainer ? "grid-cols-2" : "grid-cols-1"].join(" ")}>
            {createdByTrainer ? (
              <button
                type="button"
                onClick={handleJoinClass}
                disabled={paymentAction === "pay" || isEnded || unavailable || (!needsPayment && !canJoin)}
                className="w-full h-9 flex items-center justify-center bg-[#00342b] hover:bg-[#004d40] text-white font-bold text-[13px] rounded-sm transition-colors active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {paymentAction === "pay" ? "Opening..." : needsPayment ? "Pay to Join" : canJoin ? "Join" : effectivePaid ? "Paid" : "Locked"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleViewDetails}
              className={[
                "w-full h-9 flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-900 font-bold text-[13px] rounded-sm transition-colors active:scale-[0.99]",
              ].join(" ")}
            >
              View details
            </button>
          </div>
        </div>
      </div>

      {/* ── Udemy-style Preview Popover ── */}
      <AnimatePresence>
        {canHover && showPreview && (
          <motion.div
            initial={{ opacity: 0, x: previewSide === "right" ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: previewSide === "right" ? 10 : -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              minWidth: 300,
              [previewSide === "right" ? "left" : "right"]: "calc(100% + 8px)",
              top: "-10px"
            }}
            className="absolute z-[1100] w-[300px] bg-white border border-gray-200 shadow-2xl rounded-sm p-3 flex flex-col gap-2 pointer-events-auto"
          >
            {/* Popover Arrow */}
            <div
              className={`absolute top-6 w-3 h-3 bg-white border-gray-200 rotate-45 z-10
                ${previewSide === "right"
                  ? "-left-[7px] border-b-0 border-r-0 border border-l border-t"
                  : "-right-[7px] border-t-0 border-l-0 border border-r border-b"
                }`}
            />

            <div className="relative z-20">
              <h4 className="font-bold text-sm text-gray-900 leading-snug break-words">
                {title}
              </h4>

              <div className="flex items-center gap-2 flex-wrap mt-2">
                {badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-[#eceb98] text-[#3d3c0a]">
                    {badge}
                  </span>
                )}
                <span className="text-[11px] text-gray-500">
                  Updated{" "}
                  <span className="font-semibold text-[#059669]">April 2026</span>
                </span>
              </div>

              <p className="text-[11px] text-gray-500 mt-2">
                {totalHours || 22.5} total hours · {level || 'All Levels'} · Subtitles
              </p>

              <p className="text-[12px] text-gray-700 leading-snug mt-2 line-clamp-3">
                {description || "Explore comprehensive modules designed for deep learning. From fundamental concepts to advanced practical applications, this course covers everything you need to succeed."}
              </p>

              {createdByTrainer && liveClass ? (
                <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800">
                Expert-led session
                  </div>
                  <div className="mt-1 text-[12px] font-semibold text-gray-800">
                    {liveClass.title}
                  </div>
                  <div className="mt-1 text-[11px] text-gray-500">
                    {formatLiveWhen(occurrence.scheduledAt)} IST
                  </div>
                  <div className="mt-1 text-[11px] font-extrabold text-emerald-800">
                    {timerLabel}
                  </div>
                  {accessNotice ? (
                    <div className="mt-1 text-[11px] font-semibold text-slate-600">
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

              <ul className="flex flex-col gap-1.5 mt-3">
                {takeaways.map((b, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <FaCheck className="text-gray-800 mt-[2px] flex-shrink-0 w-3 h-3 text-[10px]" />
                    <span className="text-[11px] text-gray-700 leading-snug">{b}</span>
                  </li>
                ))}
              </ul>

              <div className={["grid gap-2 mt-4", createdByTrainer ? "grid-cols-1 min-[360px]:grid-cols-2" : "grid-cols-1"].join(" ")}>
                {createdByTrainer ? (
                  <button
                    type="button"
                    onClick={handleJoinClass}
                    disabled={paymentAction === "pay" || isEnded || unavailable || (!needsPayment && !canJoin)}
                    className="w-full h-8 flex items-center justify-center bg-[#00342b] hover:bg-[#004d40] text-white font-bold text-[13px] rounded-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {paymentAction === "pay" ? "Opening..." : needsPayment ? "Pay to Join" : canJoin ? "Join" : effectivePaid ? "Paid" : "Locked"}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={(e) => {
                    if (createdByTrainer) handleViewDetails(e);
                    else {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  className="w-full h-8 flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-900 font-bold text-[13px] rounded-sm transition-colors"
                >
                  View details
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile details sheet */}
      <AnimatePresence>
        {!canHover && mobilePreviewOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[9998]"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMobilePreviewOpen(false);
              }}
            />
            <motion.div
              initial={{ y: 32, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 32, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="fixed left-0 right-0 bottom-0 z-[9999] bg-white rounded-t-2xl shadow-2xl border-t border-gray-200 p-4 pb-6"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-3" />
              <div className="flex items-start gap-3">
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {thumbnail ? (
                    <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-[15px] text-gray-900 leading-snug break-words">
                    {title}
                  </h4>
                  <p className="text-[12px] text-gray-500 mt-0.5">{instructorName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-[14px] text-gray-900">{priceLabel}</span>
                    {originalLabel ? (
                      <span className="text-[12px] text-gray-400 line-through">{originalLabel}</span>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  className="px-2 py-1 text-gray-500 text-sm"
                  onClick={() => setMobilePreviewOpen(false)}
                  aria-label="Close"
                >
                  âœ•
                </button>
              </div>

              <p className="text-[12px] text-gray-700 leading-snug mt-3">
                {description ||
                  "Explore comprehensive modules designed for deep learning. From fundamental concepts to advanced practical applications, this course covers everything you need to succeed."}
              </p>

              {createdByTrainer && liveClass ? (
                <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800">
                    Expert-led session
                  </div>
                  <div className="mt-1 text-[12px] font-semibold text-gray-800 line-clamp-1">
                    {liveClass.title}
                  </div>
                  <div className="mt-1 text-[11px] text-gray-500">
                    {formatLiveWhen(occurrence.scheduledAt)} IST
                  </div>
                  <div className="mt-1 text-[11px] font-extrabold text-emerald-800">
                    {timerLabel}
                  </div>
                  {accessNotice ? (
                    <div className="mt-1 text-[11px] font-semibold text-slate-600">
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

              <ul className="flex flex-col gap-1.5 mt-3">
                {takeaways.map((b, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <FaCheck className="text-gray-800 mt-[2px] flex-shrink-0 w-3 h-3 text-[10px]" />
                    <span className="text-[11px] text-gray-700 leading-snug">{b}</span>
                  </li>
                ))}
              </ul>

              <div className={["grid gap-2 mt-4", createdByTrainer ? "grid-cols-1 min-[420px]:grid-cols-2" : "grid-cols-1"].join(" ")}>
                {createdByTrainer ? (
                  <button
                    type="button"
                    onClick={handleJoinClass}
                    disabled={paymentAction === "pay" || isEnded || unavailable || (!needsPayment && !canJoin)}
                    className="w-full h-10 flex items-center justify-center bg-[#00342b] hover:bg-[#004d40] text-white font-bold text-[13px] rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {paymentAction === "pay" ? "Opening..." : needsPayment ? "Pay to Join" : canJoin ? "Join" : effectivePaid ? "Paid" : "Locked"}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={(e) => {
                    if (createdByTrainer) handleViewDetails(e);
                    else {
                      e.preventDefault();
                      e.stopPropagation();
                      setMobilePreviewOpen(false);
                    }
                  }}
                  className="w-full h-10 flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-900 font-bold text-[13px] rounded-lg transition-colors"
                >
                  {createdByTrainer ? "View details" : "Done"}
                </button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
      <AuthRequiredModal
        open={!!authPrompt}
        title={authPrompt?.title}
        message={authPrompt?.message}
        onClose={() => setAuthPrompt(null)}
      />
    </div>
  );
}

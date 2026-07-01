import { useEffect, useMemo, useCallback, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { HiDownload } from "react-icons/hi";
import {
  HiOutlinePlayCircle,
  HiOutlineCheckCircle,
  HiOutlineQuestionMarkCircle,
  HiChevronDown,
  HiChevronUp,
} from "react-icons/hi2";
import { Info } from "lucide-react";
import { useCart, emitCartFlyFromElement, parseINRPriceToPaise } from "../../cart";
import { useAuth } from "../../auth";
import { useActiveOffers } from "../../shared/hooks/useActiveOffers";
import { getDiscountedPrice } from "../../shared/utils/offerCalculator";
import AuthRequiredModal from "../../auth/components/AuthRequiredModal";
import { getCourseById, getCourseLiveClasses } from "../data/courseCatalog";
import {
  addStudentSessionCard,
  createStudentSessionBooking,
  getPublicSessionById,
  getStudentSessionById,
  joinStudentSession,
  getCourseAccessId,
  hasPaidCourseAccess,
  hasPaidSessionAccess,
  rememberPaidCourseAccess,
  rememberPaidSessionAccess,
  verifyRazorpayPayment,
} from "../api/studentSessionsApi";
import { useAttendanceTracking } from "../hooks/useAttendanceTracking";
import useNow from "../../live-classes/hooks/useNow";
import { formatDuration } from "../../live-classes/lib/time";
import { getSessionOccurrenceTiming, isSessionUnavailable, isClassActiveOnDate, formatRecurringDays } from "../../shared/utils/sessionTiming";
import { openMeetingLink, openPendingMeetingWindow } from "../../shared/utils/meetingWindow";
import { openRazorpayCheckout } from "../../shared/utils/razorpayCheckout";
import {
  formatAttendanceStatus,
  getStudentCourseAttendanceEligibility,
  getStudentAttendanceHistory,
} from "../api/studentAttendanceApi";
import useOfferCampaignClick from "../hooks/useOfferCampaignClick";
import { rememberRecentlyJoinedSession } from "../../my-learning/utils/learningModel";
import { formatDecimalHours } from "../../shared/utils/durationFormatter";

// ── Video path ─────────────────────────────────────────────────────────────
import demoVideo from "../../assets/Videos/Hero.mp4";

// ── Helpers ────────────────────────────────────────────────────────────────
 
// ── Mock course content sections ───────────────────────────────────────────
function toCartItem(course, activeOffers) {
  const offerInfo = getDiscountedPrice(course, activeOffers || []);
  const finalPrice = offerInfo.hasDiscount ? offerInfo.price : course.price;
  
  return {
    id: String(course.id),
    title: course.title,
    instructor: course.instructor,
    thumbnail: course.thumbnail,
    thumbnailBg: course.thumbnailBg,
    unitPricePaise: parseINRPriceToPaise(finalPrice),
    displayPrice: finalPrice,
    oldPrice: offerInfo.hasDiscount ? course.price : (course.oldPrice || null),
    qty: 1,
    rating: Number(course.rating) || 4.8,
    ratingCount: Number(course.ratingCount) || 0,
    totalHours: course.totalHours || null,
    totalDays: course.totalDays || null,
    completedHours: course.completedHours || null,
    completedDays: course.completedDays || null,
    classDuration: course.liveClass?.durationMinutes || 60,
    level: course.level || "All Levels",
    isPremium: !course.createdByTrainer,
    sessionId: course.createdByTrainer ? String(course.id) : undefined,
  };
}

function isCourseSessionCompleted(course) {
  const liveClass = course?.liveClass;
  const occurrence = getSessionOccurrenceTiming(liveClass, Date.now(), { defaultRecurring: false });
  return !occurrence.isRecurring && occurrence.startMs > 0 && Date.now() > occurrence.endMs;
}

const MOCK_SECTIONS = [
  {
    id: 1,
    title: "The Foundation",
    lectures: [
      { id: 1, title: "Environment Setup", duration: "08:24", done: true, type: "video" },
      { id: 2, title: "Project Initialization", duration: "12:10", done: true, type: "video" },
    ],
  },
  {
    id: 2,
    title: "Advanced Concepts",
    lectures: [
      { id: 3, title: "Current: Generic Patterns", duration: "45:60", current: true, type: "video" },
      { id: 4, title: "Advanced Interfaces", duration: "15:45", type: "video" },
      { id: 5, title: "Module Quiz", questions: 12, type: "quiz" },
    ],
  },
];

// ── Video Player ───────────────────────────────────────────────────────────
function VideoPlayer({ isSubscribed }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [quality] = useState("1080P");
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(pct);
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * videoRef.current.duration;
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => setShowControls(false), 2500);
  };

  return (
    <div
      className="relative w-full aspect-[16/9] bg-black rounded-none overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={demoVideo}
        preload="metadata"
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setPlaying(false)}
        onClick={togglePlay}
      />

      {/* Play button overlay */}
      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-black/60 border-2 border-white/80 flex items-center justify-center hover:bg-black/80 transition-colors">
            <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}

      {/* Controls bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 transition-opacity duration-300 ${
          showControls || !playing ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress bar */}
        <div
          className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer mb-3"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-[#b0d400] rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button type="button" onClick={togglePlay} className="text-white hover:text-gray-200">
              {playing ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Skip forward */}
            <button
              type="button"
              onClick={() => { if (videoRef.current) videoRef.current.currentTime += 15; }}
              className="text-white hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 13c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6v4l5-5-5-5v4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8h-2z" />
              </svg>
            </button>

            {/* Volume */}
            <button type="button" className="text-white hover:text-gray-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
            </button>

            <span className="text-white text-xs font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quality badge */}
            <span className="text-white text-[11px] font-bold border border-white/50 px-1.5 py-0.5 rounded">
              {quality}
            </span>

            {/* Settings */}
            <button type="button" className="text-white hover:text-gray-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.58 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
              </svg>
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={() => videoRef.current?.requestFullscreen?.()}
              className="text-white hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Demo watermark */}
      {!isSubscribed && (
        <div className="absolute top-3 right-3 bg-black/60 text-white text-[11px] font-bold px-2 py-1 rounded">
          DEMO PREVIEW
        </div>
      )}
    </div>
  );
}

// ── Course Content Sidebar ─────────────────────────────────────────────────
function CourseContentSidebar({ progress = 65 }) {
  const [openSections, setOpenSections] = useState({ 1: true, 2: true });

  const toggle = (id) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="border border-gray-200 bg-white rounded-none h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200">
        <h3 className="text-[15px] font-extrabold text-gray-900">Course Content</h3>
        <div className="mt-2.5 flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#b0d400] rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-bold text-gray-700 shrink-0">{progress}%</span>
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto">
        {MOCK_SECTIONS.map((section) => (
          <div key={section.id} className="border-b border-gray-100">
            {/* Section header */}
            <button
              type="button"
              className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50"
              onClick={() => toggle(section.id)}
            >
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                  SECTION {section.id}
                </div>
                <div className="text-[13px] font-bold text-gray-900">{section.title}</div>
              </div>
              {openSections[section.id] ? (
                <HiChevronUp className="text-gray-500 text-lg shrink-0" />
              ) : (
                <HiChevronDown className="text-gray-500 text-lg shrink-0" />
              )}
            </button>

            {/* Lectures */}
            {openSections[section.id] && (
              <div>
                {section.lectures.map((lec) => (
                  <div
                    key={lec.id}
                    className={`flex items-start gap-3 px-5 py-3 ${
                      lec.current ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {lec.done ? (
                        <HiOutlineCheckCircle className="text-[18px] text-[#059669]" />
                      ) : lec.current ? (
                        <HiOutlinePlayCircle className="text-[18px] text-gray-800" />
                      ) : (
                        <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[13px] leading-snug ${
                          lec.current ? "font-bold text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {lec.title}
                        {lec.current && (
                          <div className="text-[10px] font-bold text-gray-500 mt-0.5 uppercase tracking-wide">
                            NOW PLAYING • {lec.duration}
                          </div>
                        )}
                      </div>
                      {!lec.current && lec.type === "video" && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                          </svg>
                          <span className="text-[11px] text-gray-400">{lec.duration}</span>
                        </div>
                      )}
                      {lec.type === "quiz" && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <HiOutlineQuestionMarkCircle className="text-gray-400 text-xs" />
                          <span className="text-[11px] text-gray-400">{lec.questions} QUESTIONS</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resume button */}
      <div className="px-5 py-4 border-t border-gray-200">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 border-2 border-gray-900 text-gray-900 font-extrabold text-[14px] py-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <HiOutlineCheckCircle className="text-lg" />
          Resume Assignment
        </button>
      </div>
    </div>
  );
}

// ── Tabs ───────────────────────────────────────────────────────────────────
const TABS = ["Overview", "Q&A", "Notes", "Announcements", "Resources"];

// ── Main Component ─────────────────────────────────────────────────────────
export default function CourseDetailsPage() {
  const activeOffers = useActiveOffers();
  const { courseId, sessionId } = useParams();
  const detailId = courseId || sessionId || "";
  const offerTargetType = sessionId ? "session" : "course";
  const location = useLocation();
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const { isAuthenticated } = useAuth();
  const now = useNow(1000);
  const [activeTab, setActiveTab] = useState("Overview");
  const [isSubscribed] = useState(false); // Set to true after subscription
  const [remoteCourse, setRemoteCourse] = useState(null);
  const [sessionAction, setSessionAction] = useState("");
  const [authPrompt, setAuthPrompt] = useState(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [sessionAttendance, setSessionAttendance] = useState(null);
  const [attendanceEligibility, setAttendanceEligibility] = useState(null);
  const [checkInLogs, setCheckInLogs] = useState([]);
  const liveClasses = useMemo(() => getCourseLiveClasses(detailId), [detailId]);
  const { track } = useAttendanceTracking();

  useEffect(() => {
    if (!isAuthenticated || !detailId) return;

    let active = true;

    getStudentCourseAttendanceEligibility(detailId)
      .then((res) => {
        if (active && res?.success) {
          setAttendanceEligibility(res.data);
        }
      })
      .catch((err) => console.error("Error fetching attendance eligibility:", err));

    getStudentAttendanceHistory({ courseId: detailId })
      .then((res) => {
        if (active && res?.success) {
          setCheckInLogs(res.data);
        }
      })
      .catch((err) => console.error("Error fetching attendance history:", err));

    return () => {
      active = false;
    };
  }, [detailId, isAuthenticated]);

  useOfferCampaignClick(offerTargetType, detailId);

  const remoteCourseMatches = remoteCourse && String(remoteCourse.id) === String(detailId);
  const course = useMemo(() => {
    const fromState = location?.state?.course;
    if (fromState && String(fromState.id) === String(detailId)) return fromState;
    if (remoteCourseMatches) return remoteCourse;
    if (sessionId) return null;
    return getCourseById(detailId);
  }, [detailId, location?.state, remoteCourse, remoteCourseMatches, sessionId]);
  
  const offerInfo = getDiscountedPrice(course, activeOffers);
  const isInCart = useMemo(
    () => items.some((item) => String(item.sessionId || item.id) === String(course?.id || "")),
    [course?.id, items]
  );

  useEffect(() => {
    if (course || !detailId) return;
    let cancelled = false;
    const loader = isAuthenticated ? getStudentSessionById : getPublicSessionById;
    loader(detailId)
      .then((session) => {
        if (!cancelled) setRemoteCourse(session);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [course, detailId, isAuthenticated]);

  const addToCart = useCallback(
    async (fromEl) => {
      if (!course) return;
      if (course.createdByTrainer && isCourseSessionCompleted(course)) {
        setAuthPrompt({
          title: "Completed today",
          message: "Today's live session has already completed. It will be available again on the next scheduled day.",
        });
        return;
      }
      if (!isAuthenticated) {
        setAuthPrompt({
          title: "Log in to add this course",
          message: "Register or log in to add this class to your cart and continue.",
        });
        return;
      }
      if (isInCart) return;
      if (course.createdByTrainer) {
        setSessionAction("card");
        addItem(toCartItem(course, activeOffers));
        emitCartFlyFromElement(fromEl, course.thumbnail, course.title);
        if (course.isAddedToCard) {
          setSessionAction("");
          return;
        }
        try {
          await addStudentSessionCard(course.id);
          setRemoteCourse((prev) => (prev ? { ...prev, isAddedToCard: true } : prev));
        } finally {
          setSessionAction("");
        }
        return;
      }
      addItem(toCartItem(course, activeOffers));
      emitCartFlyFromElement(fromEl);
    },
    [addItem, course, isAuthenticated, isInCart, activeOffers]
  );

  if (!course) {
    return (
      <main className="max-w-container-max mx-auto px-margin-desktop py-16">
        <h1 className="font-h2 text-h2 text-primary">Course not found</h1>
        <p className="mt-3 font-body-md text-body-md text-on-surface-variant">
          This course may have been removed. Go back to Courses to browse.
        </p>
        <button
          type="button"
          className="mt-6 px-6 py-3 rounded-xl bg-primary text-on-primary font-extrabold text-sm"
          onClick={() => navigate("/courses")}
        >
          Browse Courses
        </button>
      </main>
    );
  }

  if (course.createdByTrainer) {
    const liveClass = course.liveClass || liveClasses[0] || null;
    const trainerInstructions = course.trainerInstructions || liveClass?.trainerInstructions || "";
    const isCancelled = String(liveClass?.status || course.status || "").toLowerCase() === "cancelled";
    const unavailable = isSessionUnavailable(liveClass);
    const cancellationReason = liveClass?.cancellationReason || course.cancellationReason || "";
    const currentOccurrence = getSessionOccurrenceTiming(liveClass, now, { defaultRecurring: false });
    const occurrence = getSessionOccurrenceTiming(liveClass, now, {
      defaultRecurring: false,
      rollForwardAfterEnd: true,
    });
    const { startMs, endMs } = occurrence;
    const todayCompleted =
      currentOccurrence.startMs > 0 && now > currentOccurrence.endMs && currentOccurrence.isRecurring;
    const sessionCompleted = !occurrence.isRecurring && startMs > 0 && now > endMs;
    const courseAccessId = getCourseAccessId({ ...course, liveClass }) || course.id;
    const sessionIsFree =
      course.isFree === true ||
      course.is_free === true ||
      String(course.pricingState || course.pricing_state || "").trim().toUpperCase() === "FREE" ||
      Number(course.amountPaise || course.amount_paise || liveClass?.amountPaise || 0) <= 0;
    const effectivePaid =
      course.isPaid ||
      course.hasCourseAccess ||
      paymentVerified ||
      hasPaidCourseAccess(courseAccessId) ||
      hasPaidSessionAccess(liveClass?.id || course.id);
    const needsPayment = !sessionIsFree && course.paymentRequired && !effectivePaid;
    const activeToday = isClassActiveOnDate(liveClass || course, new Date(now));
    const canJoin = startMs > 0 && now >= startMs && now <= endMs && !isCancelled && !unavailable && !needsPayment && activeToday;
    const attendanceStatus =
      sessionAttendance?.attendanceStatus ||
      sessionAttendance?.status ||
      course.attendance?.attendanceStatus ||
      course.attendance?.status ||
      course.attendanceStatus ||
      "";
    const attendanceBadgeClass =
      attendanceStatus === "late"
        ? "bg-amber-100 text-amber-800"
        : attendanceStatus === "absent"
          ? "bg-red-100 text-red-700"
          : attendanceStatus === "pending"
            ? "bg-sky-100 text-sky-800"
            : "bg-emerald-100 text-emerald-800";
    const sessionStatusText = !startMs
      ? "Schedule pending"
      : isCancelled
        ? "Class cancelled"
        : needsPayment
          ? "Payment required before joining."
        : !activeToday
          ? `Next class scheduled on ${new Date(occurrence.scheduledAt).toLocaleDateString("en-IN", { weekday: "long" })}.`
        : sessionCompleted
          ? "Today's session completed."
        : todayCompleted
          ? "Today's session completed. Next class opens on the next scheduled day."
          : now < startMs
            ? `Join opens when class starts - ${formatDuration(startMs - now)} left`
            : "Live now";
    const scheduledAt = occurrence.scheduledAt ? new Date(occurrence.scheduledAt) : null;
    const when =
      scheduledAt && !Number.isNaN(scheduledAt.getTime())
        ? scheduledAt.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })
        : "Schedule not available";
    const payForSession = async () => {
      if (!isAuthenticated) {
        setAuthPrompt({
          title: "Log in to pay for this class",
          message: "Register or log in first. After payment verification, you can join when the session opens.",
        });
        return;
      }
      if (!liveClass?.id || !needsPayment || sessionCompleted || unavailable) return;

      setSessionAction("pay");
      try {
        const sessionDate = occurrence.scheduledAt ? occurrence.scheduledAt.slice(0, 10) : "";
        const booking = await createStudentSessionBooking(liveClass.id, {
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
            sessionId: liveClass.id,
            courseId: booking.courseAccessId || courseAccessId,
          });
        }
        setPaymentVerified(true);
        rememberPaidSessionAccess(liveClass.id || course.id);
        rememberPaidCourseAccess(booking.courseAccessId || courseAccessId, {
          sessionId: liveClass.id || course.id,
        });
        setAuthPrompt({
          title: "Payment verified",
          message: "Course access verified. You can join all sessions in this course until it ends.",
        });
      } catch (err) {
        setAuthPrompt({
          title: "Payment not completed",
          message: err?.message || "Please try the payment again.",
        });
      } finally {
        setSessionAction("");
      }
    };

    return (
      <>
      <main className="min-h-screen bg-[#f4f7f6]">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
          <button
            type="button"
            onClick={() => navigate("/courses")}
            className="text-sm font-semibold text-slate-500 hover:text-slate-900"
          >
            Back to courses
          </button>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] gap-5 items-start">
            <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
              <div className="h-[190px] sm:h-[235px] lg:h-[270px] bg-slate-100">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${course.thumbnailBg}`} />
                )}
              </div>

              <div className="p-4 sm:p-5">
                <div className="inline-flex rounded-full bg-emerald-100 text-emerald-900 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest">
                  Expert-led session
                </div>
                <h1 className="mt-3 text-2xl sm:text-[30px] font-extrabold text-slate-950 leading-tight">
                  {course.title}
                </h1>
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                  {course.description}
                </p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {[
                    ["Trainer", course.instructor || course.instructorName || course.trainerName || "LurnStack Trainer"],
                    ["Level", course.level || "All Levels"],
                    ["Duration", liveClass?.durationMinutes ? `${liveClass.durationMinutes} min` : course.hours],
                    ["Ends On", occurrence.isRecurring 
                      ? ((liveClass?.recurrenceEndDate || liveClass?.recurrence_end_date || course?.recurrenceEndDate || course?.recurrence_end_date || liveClass?.raw?.recurrenceEndDate || liveClass?.raw?.recurrence_end_date || course?.raw?.recurrenceEndDate || course?.raw?.recurrence_end_date)
                        ? new Date(liveClass?.recurrenceEndDate || liveClass?.recurrence_end_date || course?.recurrenceEndDate || course?.recurrence_end_date || liveClass?.raw?.recurrenceEndDate || liveClass?.raw?.recurrence_end_date || course?.raw?.recurrenceEndDate || course?.raw?.recurrence_end_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                        : "Ongoing")
                      : "One-time"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        {label}
                      </div>
                      <div className="mt-1 text-sm font-extrabold text-slate-900">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {isAuthenticated && attendanceEligibility && (
              <div className="rounded-xl bg-white border border-slate-200 p-4 sm:p-5 shadow-sm">
                <h2 className="text-lg font-extrabold text-slate-900 mb-4">Attendance & Course Progress</h2>
                
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Attendance Badge/Ring */}
                  <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke={attendanceEligibility.attendancePercentage >= 75 ? "#10b981" : "#ef4444"}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - (attendanceEligibility.attendancePercentage || 0) / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <span className="absolute text-sm font-extrabold text-slate-800">
                      {attendanceEligibility.attendancePercentage}%
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="text-sm font-extrabold text-slate-900">
                      Attendance Percentage: {attendanceEligibility.attendancePercentage}%
                    </div>
                    <p className="mt-1 text-xs text-slate-500 leading-normal">
                      You have attended {attendanceEligibility.attendedCount || 0} out of {attendanceEligibility.totalSessions || 0} completed classes.
                    </p>

                    {/* Certificate Eligibility Indicator */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        attendanceEligibility.isEligible ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                      }`}>
                        Certificate Status: {attendanceEligibility.isEligible ? "Eligible" : "Ineligible"}
                      </span>
                      {attendanceEligibility.certificateType && (
                        <span className="text-xs text-slate-500 font-semibold">
                          ({attendanceEligibility.certificateType} Certificate)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Warning Banner */}
                {attendanceEligibility.attendancePercentage < 75 && (
                  <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3.5 flex items-start gap-2.5 text-amber-800">
                    <Info className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider mb-0.5 font-sans">Warning Alert</div>
                      <p className="text-xs font-semibold leading-normal">
                        You need at least 75% attendance to qualify for a certificate. Keep attending upcoming classes to raise your attendance percentage.
                      </p>
                    </div>
                  </div>
                )}

                {/* Check-in Event List */}
                {checkInLogs.length > 0 && (
                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <h3 className="text-sm font-extrabold text-slate-900 mb-3">Attendance & Check-in Logs</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse font-sans">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400">
                            <th className="pb-2 font-bold uppercase text-[10px]">Class Session</th>
                            <th className="pb-2 font-bold uppercase text-[10px]">Check-in Time</th>
                            <th className="pb-2 font-bold uppercase text-[10px]">Duration</th>
                            <th className="pb-2 font-bold uppercase text-[10px]">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {checkInLogs.map((log) => (
                            <tr key={log.id} className="text-slate-700 hover:bg-slate-50/50">
                              <td className="py-2.5 pr-2 font-bold text-slate-900">{log.sessionTitle}</td>
                              <td className="py-2.5 text-slate-500">
                                {log.firstJoinedAt ? new Date(log.firstJoinedAt).toLocaleString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true
                                }) : "-"}
                              </td>
                              <td className="py-2.5 text-slate-600 font-medium">
                                {log.attendedMinutes} mins
                              </td>
                              <td className="py-2.5">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold capitalize ${
                                  log.status === "present" ? "bg-emerald-100 text-emerald-800" :
                                  log.status === "late" ? "bg-amber-100 text-amber-800" :
                                  "bg-red-100 text-red-800"
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            <aside className="rounded-xl bg-white border border-slate-200 shadow-sm lg:sticky lg:top-24 overflow-hidden">
              <div className="border-b border-slate-100 bg-gradient-to-br from-white to-emerald-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700">
                    {todayCompleted ? "Next recurring class" : "Next live class"}
                  </div>
                  {occurrence.isRecurring ? (
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 ring-1 ring-emerald-100">
                      {formatRecurringDays(liveClass?.recurringDays || liveClass?.recurring_days || course?.recurringDays || course?.recurring_days, { useFullNames: true })}
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-2 text-base font-extrabold text-slate-950 leading-snug">
                  {liveClass?.title || course.title}
                </h2>
                {todayCompleted ? (
                  <div className="mt-3 rounded-lg bg-white/80 px-3 py-2 text-[12px] font-semibold text-slate-600 ring-1 ring-emerald-100">
                    Today's class is completed. Your paid access continues for the next session.
                  </div>
                ) : null}
              </div>
              <div className="p-4">
                <div className="space-y-2.5 text-sm text-slate-600">
                  <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Date and time
                    </div>
                    <div className="mt-1 font-extrabold text-slate-900">{when} IST</div>
                  </div>
                  {occurrence.isRecurring && (
                    <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        Weekly Schedule
                      </div>
                      <div className="mt-1 font-extrabold text-slate-900">
                        {formatRecurringDays(liveClass?.recurringDays || liveClass?.recurring_days || course?.recurringDays || course?.recurring_days, { useFullNames: true })}
                      </div>
                      {(liveClass?.recurrenceEndDate || liveClass?.recurrence_end_date || course?.recurrenceEndDate || course?.recurrence_end_date || liveClass?.raw?.recurrenceEndDate || liveClass?.raw?.recurrence_end_date || course?.raw?.recurrenceEndDate || course?.raw?.recurrence_end_date) && (
                        <div className="mt-1.5 text-[11px] font-semibold text-slate-500">
                          Recurring until: {new Date(liveClass?.recurrenceEndDate || liveClass?.recurrence_end_date || course?.recurrenceEndDate || course?.recurrence_end_date || liveClass?.raw?.recurrenceEndDate || liveClass?.raw?.recurrence_end_date || course?.raw?.recurrenceEndDate || course?.raw?.recurrence_end_date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 flex flex-col justify-center">
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        Payment
                      </div>
                      {offerInfo.hasDiscount ? (
                        <div className="mt-1 flex flex-col">
                          <span className="font-extrabold text-red-600 text-[14px] leading-tight">{offerInfo.price}</span>
                          <span className="text-[10px] text-gray-400 line-through leading-none mt-0.5">{offerInfo.oldPrice}</span>
                          <span className="text-[8px] font-black text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded mt-1.5 text-center w-max tracking-wide">
                            {offerInfo.badgeText}
                          </span>
                        </div>
                      ) : (
                        <div className="mt-1 font-extrabold text-slate-900 text-[14px]">{course.price || "Free"}</div>
                      )}
                    </div>
                    <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        Access
                      </div>
                      <span className={[
                        "mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold",
                        needsPayment ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800",
                      ].join(" ")}>
                        {needsPayment ? "Pay once" : sessionIsFree ? "Free" : "Paid"}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Meeting
                    </div>
                    <div className="mt-1 font-semibold text-slate-700 break-all">
                      {liveClass?.meetUrl ? (
                        liveClass.meetUrl.includes("meet.google.com") ? "Google Meet (Available upon joining)" :
                        liveClass.meetUrl.includes("zoom.us") ? "Zoom Meeting (Available upon joining)" :
                        "Live Session Link (Available upon joining)"
                      ) : "Meeting link will be available soon"}
                    </div>
                  </div>
                {isCancelled && cancellationReason ? (
                  <div className="rounded-lg bg-red-50 border border-red-100 p-3">
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-red-500">
                      Cancellation reason
                    </div>
                    <div className="mt-1 text-sm font-semibold text-red-700">
                      {cancellationReason}
                    </div>
                  </div>
                ) : null}
                {!isCancelled ? (
                  <div className={[
                    "rounded-lg border p-3",
                    sessionCompleted
                      ? "bg-slate-50 border-slate-200"
                      : canJoin
                        ? "bg-emerald-50 border-emerald-100"
                        : "bg-amber-50 border-amber-100",
                  ].join(" ")}>
                    <div className={[
                      "text-[10px] font-extrabold uppercase tracking-widest",
                      sessionCompleted ? "text-slate-500" : canJoin ? "text-emerald-700" : "text-amber-700",
                    ].join(" ")}>
                      Session access
                    </div>
                    <div className={[
                      "mt-1 text-sm font-semibold",
                      sessionCompleted ? "text-slate-700" : canJoin ? "text-emerald-800" : "text-amber-800",
                    ].join(" ")}>
                      {sessionStatusText}
                    </div>
                  </div>
                ) : null}
                {attendanceStatus ? (
                  <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Attendance
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={["rounded-full px-2.5 py-1 text-[11px] font-extrabold", attendanceBadgeClass].join(" ")}>
                        {formatAttendanceStatus(attendanceStatus)}
                      </span>
                      {sessionAttendance?.joinCount ? (
                        <span className="text-xs font-semibold text-slate-500">
                          Join count: {sessionAttendance.joinCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                {trainerInstructions ? (
                  <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 flex items-start gap-2.5">
                    <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-blue-700">
                        Trainer Instructions
                      </div>
                      <div className="mt-1 text-xs font-semibold text-blue-800 leading-normal">
                        {trainerInstructions}
                      </div>
                    </div>
                  </div>
                ) : null}
                </div>

              <div className="mt-4 grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={async () => {
                    if (!isAuthenticated) {
                      setAuthPrompt({
                        title: "Log in to join this class",
                        message: "Register or log in first. After authentication, you can continue with this session.",
                      });
                      return;
                    }
                    if (needsPayment) {
                      await payForSession();
                      return;
                    }
                    if (!liveClass?.id || !canJoin) return;
                    const meetingWindow = openPendingMeetingWindow();
                    setSessionAction("join");
                    const startTracking = (sessionDate, joinResult = {}) =>
                      track({
                        sessionId: liveClass.id,
                        sessionDate,
                        scheduledAt: occurrence.scheduledAt,
                        startsAt: occurrence.scheduledAt,
                        endsAt: occurrence.endsAt,
                        bookingId: joinResult.bookingId || "",
                        joinedAt: joinResult.joinedAt || "",
                        meetingWindow,
                        onAttendance: setSessionAttendance,
                      });
                    try {
                      const sessionDate = occurrence.scheduledAt ? occurrence.scheduledAt.slice(0, 10) : "";
                      const result = await joinStudentSession(liveClass.id, {
                        sessionDate,
                        scheduledAt: occurrence.scheduledAt,
                        startsAt: occurrence.scheduledAt,
                        endsAt: occurrence.endsAt,
                      });
                      rememberRecentlyJoinedSession({ ...course, id: liveClass.id, liveClass }, {
                        joinedAt: result?.joinedAt || new Date().toISOString(),
                        attendanceStatus: result?.attendance?.attendanceStatus || result?.attendance?.status || "joined",
                      });
                      setSessionAttendance(result?.attendance || { attendanceStatus: "pending", firstJoinedAt: result?.joinedAt || "" });
                      if (openMeetingLink(meetingWindow, result?.meetingLink || liveClass?.meetUrl || course?.meetUrl || "")) {
                        startTracking(sessionDate, result);
                      }
                    } catch {
                      if (!openMeetingLink(meetingWindow, liveClass?.meetUrl || course?.meetUrl || "")) {
                        meetingWindow?.close?.();
                      }
                    } finally {
                      setSessionAction("");
                    }
                  }}
                  disabled={!liveClass?.id || sessionAction === "join" || sessionAction === "pay" || (!needsPayment && !canJoin) || sessionCompleted}
                  className={[
                    "h-11 rounded-lg text-sm font-extrabold transition-colors",
                    liveClass?.id && (canJoin || needsPayment) && !sessionCompleted
                      ? "bg-[#00342b] text-white hover:bg-[#004d40]"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed",
                  ].join(" ")}
                >
                  {sessionAction === "pay" ? "Opening payment..." : sessionAction === "join" ? "Joining..." : needsPayment ? "Pay once to join" : canJoin ? "Join class" : sessionCompleted ? "Completed" : !activeToday ? "Next class opens soon" : todayCompleted ? "Next class opens soon" : sessionIsFree ? "Join opens soon" : course.paymentRequired ? "Paid, join opens soon" : "Join opens soon"}
                </button>
                <button
                  type="button"
                  onClick={(e) => addToCart(e?.currentTarget)}
                  disabled={sessionAction === "card" || isInCart || sessionCompleted}
                  className="h-11 rounded-lg border border-slate-200 text-slate-900 text-sm font-extrabold hover:bg-slate-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sessionCompleted ? "Session completed" : isInCart ? "In shopping cart" : sessionAction === "card" ? "Adding..." : "Add to cart"}
                </button>
              </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <AuthRequiredModal
        open={!!authPrompt}
        title={authPrompt?.title}
        message={authPrompt?.message}
        onClose={() => setAuthPrompt(null)}
      />
      </>
    );
  }

  return (
    <main className="bg-[#f8f9fa] min-h-screen">
      {/* ── Two-column layout: video+content left, sidebar right ── */}
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-0 items-start">
          {/* LEFT: Video + info */}
          <div className="bg-white">
            {/* Video Player */}
            <VideoPlayer isSubscribed={isSubscribed} />

            {/* Status tags + date */}
            <div className="px-6 pt-5 pb-2 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="bg-[#b0d400] text-[#2d3a00] text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded">
                  IN PROGRESS
                </span>
                <span className="bg-gray-100 text-gray-600 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                  MODULE 4: GENERICS
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Updated {course.updated || "Oct 24, 2024"}
              </div>
            </div>

            {/* Title & description */}
            <div className="px-6 pb-4">
              <h1 className="text-[24px] sm:text-[28px] font-extrabold text-gray-900 leading-tight">
                {course.title}
              </h1>
              <p className="mt-2 text-[14px] text-gray-500 leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* Tab bar */}
            <div className="border-b border-gray-200 px-6">
              <div className="flex gap-0">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-1 mr-6 pb-3 text-[14px] font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? "text-gray-900 font-bold border-b-2 border-gray-900"
                        : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
                    }`}
                  >
                    {tab}
                    {tab === "Q&A" && (
                      <span className="ml-1 text-[11px] font-bold bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full">
                        12
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="px-6 py-6">
              {activeTab === "Overview" && (
                <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-8">
                  {/* What you'll learn */}
                  <div>
                    <h2 className="text-[16px] font-extrabold text-gray-900 flex items-center gap-2 mb-4">
                      <span className="text-[#b0d400]">✦</span> What you'll learn in this lecture
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(course.bullets || []).map((b) => (
                        <div
                          key={b}
                          className="flex items-start gap-2.5 bg-gray-50 border border-gray-100 rounded-lg p-3"
                        >
                          <HiOutlineCheckCircle className="mt-0.5 text-[18px] text-[#059669] shrink-0" />
                          <span className="text-[13px] text-gray-700 leading-snug">{b}</span>
                        </div>
                      ))}
                    </div>

                    {/* Attendance & Course Progress */}
                    {isAuthenticated && attendanceEligibility && (
                      <div className="mt-8 border-t border-gray-100 pt-6">
                        <h3 className="text-[13px] font-extrabold uppercase tracking-widest text-gray-400 mb-3">
                          ATTENDANCE & PROGRESS
                        </h3>
                        <div className="rounded-xl border border-gray-200 p-4 sm:p-5 mb-6">
                          <div className="flex flex-col sm:flex-row items-center gap-6">
                            {/* Attendance Badge/Ring */}
                            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="40"
                                  cy="40"
                                  r="34"
                                  stroke="#e2e8f0"
                                  strokeWidth="6"
                                  fill="transparent"
                                />
                                <circle
                                  cx="40"
                                  cy="40"
                                  r="34"
                                  stroke={attendanceEligibility.attendancePercentage >= 75 ? "#10b981" : "#ef4444"}
                                  strokeWidth="6"
                                  fill="transparent"
                                  strokeDasharray={2 * Math.PI * 34}
                                  strokeDashoffset={2 * Math.PI * 34 * (1 - (attendanceEligibility.attendancePercentage || 0) / 100)}
                                  strokeLinecap="round"
                                  className="transition-all duration-500"
                                />
                              </svg>
                              <span className="absolute text-xs font-extrabold text-slate-800">
                                {attendanceEligibility.attendancePercentage}%
                              </span>
                            </div>

                            <div className="flex-1">
                              <div className="text-sm font-extrabold text-slate-900">
                                Attendance Percentage: {attendanceEligibility.attendancePercentage}%
                              </div>
                              <p className="mt-1 text-xs text-slate-500 leading-normal">
                                You have attended {attendanceEligibility.attendedCount || 0} out of {attendanceEligibility.totalSessions || 0} completed classes.
                              </p>

                              {/* Certificate Eligibility Indicator */}
                              <div className="mt-3 flex items-center gap-2">
                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                  attendanceEligibility.isEligible ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                                }`}>
                                  Certificate Status: {attendanceEligibility.isEligible ? "Eligible" : "Ineligible"}
                                </span>
                                {attendanceEligibility.certificateType && (
                                  <span className="text-xs text-slate-500 font-semibold">
                                    ({attendanceEligibility.certificateType} Certificate)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Warning Banner */}
                          {attendanceEligibility.attendancePercentage < 75 && (
                            <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2.5 text-amber-800">
                              <Info className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                              <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5">Warning Alert</div>
                                <p className="text-xs font-semibold leading-normal">
                                  You need at least 75% attendance to qualify for a certificate. Keep attending upcoming classes to raise your attendance percentage.
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Check-in Event List */}
                          {checkInLogs.length > 0 && (
                            <div className="mt-5 border-t border-gray-100 pt-4">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5 font-sans">Attendance & Check-in Logs</h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-[11px] border-collapse font-sans">
                                  <thead>
                                    <tr className="border-b border-gray-100 text-gray-400">
                                      <th className="pb-1.5 font-bold uppercase text-[9px]">Class Session</th>
                                      <th className="pb-1.5 font-bold uppercase text-[9px]">Check-in Time</th>
                                      <th className="pb-1.5 font-bold uppercase text-[9px]">Duration</th>
                                      <th className="pb-1.5 font-bold uppercase text-[9px]">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50">
                                    {checkInLogs.map((log) => (
                                      <tr key={log.id} className="text-gray-600 hover:bg-gray-50/50">
                                        <td className="py-2 pr-2 font-bold text-gray-800">{log.sessionTitle}</td>
                                        <td className="py-2 text-gray-500">
                                          {log.firstJoinedAt ? new Date(log.firstJoinedAt).toLocaleString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            hour: "numeric",
                                            minute: "2-digit",
                                            hour12: true
                                          }) : "-"}
                                        </td>
                                        <td className="py-2 text-gray-500 font-medium">
                                          {log.attendedMinutes} mins
                                        </td>
                                        <td className="py-2">
                                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-extrabold capitalize ${
                                            log.status === "present" ? "bg-emerald-100 text-emerald-800" :
                                            log.status === "late" ? "bg-amber-100 text-amber-800" :
                                            "bg-red-100 text-red-800"
                                          }`}>
                                            {log.status}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Course Stats */}
                    <div className="mt-8 border-t border-gray-100 pt-6">
                      <h3 className="text-[13px] font-extrabold uppercase tracking-widest text-gray-400 mb-3">
                        COURSE STATS
                      </h3>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                        {[
                          course.createdByTrainer ? (
                            ["Hours Progress", `${formatDecimalHours(course.completedHours || 0)} / ${formatDecimalHours(course.totalHours || 30)} completed`]
                          ) : (
                            ["Total Duration", formatDecimalHours(course.totalHours) || course.hours || "12 hrs 45 mins"]
                          ),
                          ...(course.createdByTrainer && course.totalDays ? [
                            ["Days Progress", `${course.completedDays || 0} / ${course.totalDays} days completed`]
                          ] : []),
                          ["Level", course.level || "Intermediate"],
                          ["Students", course.ratingCount?.split(" ")[0] || "20,000+"],
                          ["Rating", `${course.rating} ★`],
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="text-[13px] text-gray-500">{label}</span>
                            <span className="text-[13px] font-semibold text-gray-800">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {liveClasses.length > 0 ? (
                      <div className="mt-8 border-t border-gray-100 pt-6">
                        <h3 className="text-[13px] font-extrabold uppercase tracking-widest text-gray-400 mb-3">
                          TRAINER LIVE CLASSES
                        </h3>
                        <div className="space-y-3">
                          {liveClasses.map((liveClass) => {
                            const occurrence = getSessionOccurrenceTiming(liveClass, now, { defaultRecurring: false });
                            return (
                            <div
                              key={liveClass.id}
                              className="rounded-xl border border-emerald-100 bg-emerald-50 p-4"
                            >
                              <div className="text-[14px] font-extrabold text-gray-900">
                                {liveClass.title}
                              </div>
                              <div className="mt-1 text-[12px] text-gray-600">
                                {new Date(occurrence.scheduledAt).toLocaleString("en-IN", {
                                  timeZone: "Asia/Kolkata",
                                  weekday: "short",
                                  day: "2-digit",
                                  month: "short",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}{" "}
                                IST • {liveClass.durationMinutes} min
                              </div>
                              <div className="mt-1 text-[12px] text-gray-600">
                                Instructor: {liveClass.instructorName}
                              </div>
                            </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Instructor + Download */}
                  <div className="flex flex-col gap-4">
                    {/* Instructor card */}
                    <div className="border border-gray-200 rounded-xl p-4">
                      <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                        INSTRUCTOR
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-extrabold text-lg shrink-0">
                          {(course.instructor || "I")[0]}
                        </div>
                        <div>
                          <div className="text-[14px] font-extrabold text-gray-900">
                            {course.instructor}
                          </div>
                          <div className="text-[12px] text-gray-500">Senior Software Architect</div>
                        </div>
                      </div>
                    </div>

                    {/* Download resources */}
                    <button
                      type="button"
                      className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-extrabold text-[13px] py-3.5 rounded-xl transition-colors"
                    >
                      <HiDownload className="text-lg" />
                      Download Resources
                    </button>

                    {/* Not subscribed - subscribe CTA */}
                    {!isSubscribed && (
                      <div className="border border-[#b0d400] bg-[#f7fde8] rounded-xl p-4">
                        <p className="text-[12px] text-gray-600 leading-relaxed mb-3">
                          🔒 <strong>Full course access</strong> requires a subscription. You're watching the free demo.
                        </p>
                        <button
                          type="button"
                          onClick={(e) => addToCart(e?.currentTarget)}
                          disabled={isInCart}
                          className="w-full bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-[13px] py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isInCart ? "In shopping cart" : `Subscribe - ${offerInfo.hasDiscount ? offerInfo.price : course.price}`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "Q&A" && (
                <div className="text-gray-500 text-[14px] py-8 text-center">
                  No questions yet. Be the first to ask!
                </div>
              )}
              {activeTab === "Notes" && (
                <div className="text-gray-500 text-[14px] py-8 text-center">
                  Your notes will appear here.
                </div>
              )}
              {activeTab === "Announcements" && (
                <div className="text-gray-500 text-[14px] py-8 text-center">
                  No announcements yet.
                </div>
              )}
              {activeTab === "Resources" && (
                <div className="text-gray-500 text-[14px] py-8 text-center">
                  Downloadable resources will appear here after subscribing.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Course content sidebar */}
          <div className="lg:sticky lg:top-0 lg:h-screen border-l border-gray-200">
            <CourseContentSidebar progress={65} />
          </div>
        </div>
      </div>
      <AuthRequiredModal
        open={!!authPrompt}
        title={authPrompt?.title}
        message={authPrompt?.message}
        onClose={() => setAuthPrompt(null)}
      />
    </main>
  );
}

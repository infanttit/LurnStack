import { useMemo, useCallback, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { HiDownload } from "react-icons/hi";
import {
  HiOutlinePlayCircle,
  HiOutlineCheckCircle,
  HiOutlineQuestionMarkCircle,
  HiChevronDown,
  HiChevronUp,
} from "react-icons/hi2";
import { useCart, emitCartFlyFromElement, parseINRPriceToPaise } from "../../cart";
import { getCourseById, getCourseLiveClasses } from "../data/courseCatalog";

// ── Video path ─────────────────────────────────────────────────────────────
import demoVideo from "../../assets/Videos/Hero.mp4";

// ── Helpers ────────────────────────────────────────────────────────────────
 
// ── Mock course content sections ───────────────────────────────────────────
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
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState("Overview");
  const [isSubscribed] = useState(false); // Set to true after subscription
  const liveClasses = useMemo(() => getCourseLiveClasses(courseId), [courseId]);

  const course = useMemo(() => {
    const fromState = location?.state?.course;
    if (fromState && String(fromState.id) === String(courseId)) return fromState;
    return getCourseById(courseId);
  }, [courseId, location?.state]);

  const addToCart = useCallback(
    (fromEl) => {
      if (!course) return;
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
    },
    [addItem, course]
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
    const liveClass = liveClasses[0] || null;
    const scheduledAt = liveClass?.scheduledAt ? new Date(liveClass.scheduledAt) : null;
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

    return (
      <main className="min-h-screen bg-[#f4f7f6]">
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
          <button
            type="button"
            onClick={() => navigate("/courses")}
            className="text-sm font-semibold text-slate-500 hover:text-slate-900"
          >
            Back to courses
          </button>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
            <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
              <div className="aspect-[16/8] bg-slate-100">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${course.thumbnailBg}`} />
                )}
              </div>

              <div className="p-5 sm:p-7">
                <div className="inline-flex rounded-full bg-emerald-100 text-emerald-900 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest">
                  Expert-led session
                </div>
                <h1 className="mt-4 text-2xl sm:text-4xl font-extrabold text-slate-950 leading-tight">
                  {course.title}
                </h1>
                <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                  {course.description}
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    ["Trainer", course.instructor],
                    ["Level", course.level || "All Levels"],
                    ["Duration", liveClass?.durationMinutes ? `${liveClass.durationMinutes} min` : course.hours],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                        {label}
                      </div>
                      <div className="mt-1 text-sm font-extrabold text-slate-900">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-7">
                  <h2 className="text-lg font-extrabold text-slate-950">What students get</h2>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(course.bullets || []).map((item) => (
                      <div key={item} className="rounded-xl border border-slate-200 bg-white p-4 flex gap-3">
                        <HiOutlineCheckCircle className="mt-0.5 text-xl text-emerald-600 flex-shrink-0" />
                        <span className="text-sm text-slate-600 leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <aside className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm lg:sticky lg:top-24">
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700">
                Next live class
              </div>
              <h2 className="mt-2 text-xl font-extrabold text-slate-950">
                {liveClass?.title || course.title}
              </h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                    Date and time
                  </div>
                  <div className="mt-1 font-extrabold text-slate-900">{when} IST</div>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                    Meeting
                  </div>
                  <div className="mt-1 font-semibold text-slate-700 break-all">
                    {liveClass?.meetUrl || "Meeting link will be available soon"}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => liveClass?.meetUrl && window.open(liveClass.meetUrl, "_blank", "noopener,noreferrer")}
                  disabled={!liveClass?.meetUrl}
                  className={[
                    "h-12 rounded-xl text-sm font-extrabold transition-colors",
                    liveClass?.meetUrl
                      ? "bg-[#00342b] text-white hover:bg-[#004d40]"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed",
                  ].join(" ")}
                >
                  Join class
                </button>
                <button
                  type="button"
                  onClick={(e) => addToCart(e?.currentTarget)}
                  className="h-12 rounded-xl border border-slate-200 text-slate-900 text-sm font-extrabold hover:bg-slate-50 transition-colors"
                >
                  Add class card
                </button>
              </div>
            </aside>
          </div>
        </section>
      </main>
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

                    {/* Course Stats */}
                    <div className="mt-8 border-t border-gray-100 pt-6">
                      <h3 className="text-[13px] font-extrabold uppercase tracking-widest text-gray-400 mb-3">
                        COURSE STATS
                      </h3>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                        {[
                          ["Total Duration", course.hours || "12h 45m"],
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
                          {liveClasses.map((liveClass) => (
                            <div
                              key={liveClass.id}
                              className="rounded-xl border border-emerald-100 bg-emerald-50 p-4"
                            >
                              <div className="text-[14px] font-extrabold text-gray-900">
                                {liveClass.title}
                              </div>
                              <div className="mt-1 text-[12px] text-gray-600">
                                {new Date(liveClass.scheduledAt).toLocaleString("en-IN", {
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
                          ))}
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
                          className="w-full bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-[13px] py-2.5 rounded-lg transition-colors"
                        >
                          Subscribe — {course.price}
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
    </main>
  );
}

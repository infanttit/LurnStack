import { Link } from "react-router-dom";
import { HiCheckBadge } from "react-icons/hi2";
import { FiPlay, FiUsers, FiTrendingUp, FiArrowRight, FiCode, FiDatabase, FiCloud, FiSmartphone, FiCpu } from "react-icons/fi";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import lurnStackLogo from "../../assets/Logo/Logo4.png";
import bannerIntroVideo from "../../assets/Images/Banner-video/Hailuo_Video_but insife that image that hum_516003651053973511.mp4";
import heroLoginImage from "../../assets/Images/Hero/hero3.png";
import heroLoginImageAlt from "../../assets/Images/Hero/hero-image1.png";
import { useAuth } from "../../auth";
import { getPublicUpcomingSessions, getStudentSessions } from "../../courses/api/studentSessionsApi";
import { getSessionOccurrenceTiming, isSessionUnavailable } from "../../shared/utils/sessionTiming";
import { env } from "../../shared/config/env";

const MOCK_STORIES = [
  {
    id: "mock-1",
    title: "SQL Mastery Live",
    instructorName: "Aks Hai",
    thumbnail: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    isLive: true,
    isMock: true,
  },
  {
    id: "mock-2",
    title: "Python Programming",
    instructorName: "Social Critic",
    thumbnail: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
    isLive: true,
    isMock: true,
  },
  {
    id: "mock-3",
    title: "AWS Cloud Expert",
    instructorName: "Radha Kutty",
    thumbnail: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80",
    isLive: true,
    isMock: true,
  },
  {
    id: "mock-4",
    title: "DevOps Pipeline",
    instructorName: "Anisha Vid",
    thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    isLive: true,
    isMock: true,
  },
  {
    id: "mock-5",
    title: "Power BI Bootcamp",
    instructorName: "Im Your N",
    thumbnail: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80",
    isLive: true,
    isMock: true,
  },
  {
    id: "mock-6",
    title: "React Web Dev",
    instructorName: "Azhagiya T",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    isLive: true,
    isMock: true,
  }
];

function formatInstagramHandle(name) {
  if (!name) return "trainer";
  const clean = name.toLowerCase().trim();
  
  if (clean.includes("aks") && clean.includes("hai")) return "__aks__hai...";
  if (clean.includes("social") && clean.includes("critic")) return "social_cri...";
  if (clean.includes("radha") && clean.includes("kutty")) return "radhakutty...";
  if (clean.includes("anisha") && clean.includes("vid")) return "anisha_vid...";
  if (clean.includes("im") && clean.includes("your") && clean.includes("n")) return "imyour_.n...";
  if (clean.includes("azhagiya") && clean.includes("t")) return "azhagiya_t...";

  let handle = clean
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_.]/g, "");

  if (handle.length > 11) {
    return handle.slice(0, 10) + "...";
  }
  return handle;
}

function getSessionImageUrl(session) {
  if (session.isMock) return session.thumbnail;
  
  const trainerPhoto = session?.raw?.trainer?.profilePhotoUrl || session?.raw?.trainer?.profile_photo_url;
  if (trainerPhoto) {
    if (/^(https?:|data:|blob:)/i.test(trainerPhoto)) return trainerPhoto;
    const baseUrl = String(env.apiBaseUrl || "").replace(/\/+$/, "");
    return `${baseUrl}/${trainerPhoto.replace(/^\/+/, "")}`;
  }
  
  if (session.thumbnail && !session.thumbnail.includes("placeholder")) {
    return session.thumbnail;
  }
  
  const seed = String(session.id || "").charCodeAt(0) || 0;
  const avatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80"
  ];
  return avatars[seed % avatars.length];
}

const authenticatedHeroImages = [heroLoginImage, heroLoginImageAlt];
const HERO_INTRO_SEEN_KEY = "lurnstack:hero:intro-seen:v1";

function hasSeenHeroIntro() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(HERO_INTRO_SEEN_KEY) === "true";
}

function rememberHeroIntroSeen() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HERO_INTRO_SEEN_KEY, "true");
}

function prioritizeUpcomingSessions(sessions, now) {
  return (sessions || [])
    .map((session) => {
      const live = session?.liveClass || session;
      const occurrence = getSessionOccurrenceTiming(live, now, { defaultRecurring: false, rollForwardAfterEnd: true });
      const startMs = occurrence.startMs || 0;
      const endMs = occurrence.endMs || 0;
      const isLive = startMs > 0 && now >= startMs && now <= endMs;

      return {
        ...session,
        occurrence,
        priorityTime: startMs || Number.MAX_SAFE_INTEGER,
        isLive,
      };
    })
    .filter((session) => {
      if (!session?.id) return false;
      if (isSessionUnavailable(session.liveClass || session)) return false;
      return !session.occurrence.endMs || session.occurrence.endMs >= now;
    })
    .sort((a, b) => {
      if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
      return a.priorityTime - b.priorityTime;
    });
}

function getUpcomingBadgeText(scheduledAt) {
  if (!scheduledAt) return "UPCOMING";
  const date = new Date(scheduledAt);
  const now = new Date();
  
  if (date.toDateString() === now.toDateString()) {
    const timeStr = date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).toUpperCase();
    return `TODAY ${timeStr}`;
  }
  
  const day = date.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase();
  const dateNum = date.getDate();
  const month = date.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
  return `${day} ${dateNum} ${month}`;
}

export function UpcomingSessionsTicker() {
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState([]);

  const scrollRef = useRef(null);
  const isInteractingRef = useRef(false);
  const resumeTimeoutRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
      try {
        const items = isAuthenticated
          ? await getStudentSessions()
          : await getPublicUpcomingSessions();
        if (!cancelled) {
          const activeList = prioritizeUpcomingSessions(items, Date.now());
          setSessions(activeList);
        }
      } catch {
        try {
          const fallbackItems = await getPublicUpcomingSessions();
          if (!cancelled) {
            setSessions(prioritizeUpcomingSessions(fallbackItems, Date.now()));
          }
        } catch {
          if (!cancelled) setSessions([]);
        }
      }
    }

    loadSessions();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Continuous auto-scroll loop via requestAnimationFrame
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !sessions.length) return undefined;

    let animId;
    const speed = 0.75; // Pixels per frame (~45px/s at 60fps)

    const step = () => {
      if (el && !isInteractingRef.current && !isDraggingRef.current) {
        el.scrollLeft += speed;
        const halfWidth = el.scrollWidth / 2;
        if (halfWidth > 0 && el.scrollLeft >= halfWidth) {
          el.scrollLeft -= halfWidth;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [sessions.length]);

  const handleInteractionStart = () => {
    isInteractingRef.current = true;
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
  };

  const handleInteractionEnd = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 2500);
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const halfWidth = el.scrollWidth / 2;
    if (halfWidth > 0) {
      if (el.scrollLeft >= halfWidth * 1.5) {
        el.scrollLeft -= halfWidth;
      } else if (el.scrollLeft <= 0) {
        el.scrollLeft += halfWidth;
      }
    }
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    handleInteractionStart();
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.clientX;
    if (scrollRef.current) {
      startScrollLeftRef.current = scrollRef.current.scrollLeft;
    }
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    if (Math.abs(deltaX) > 5) {
      hasMovedRef.current = true;
    }
    scrollRef.current.scrollLeft = startScrollLeftRef.current - deltaX;
  };

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      handleInteractionEnd();
    }
  };

  const handleCardClick = (e) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (!sessions.length) return null;

  let repeatedSessions = [...sessions];
  while (repeatedSessions.length < 18) {
    repeatedSessions = [...repeatedSessions, ...sessions];
  }
  const tickerItems = [...repeatedSessions, ...repeatedSessions];

  return (
    <div className="relative z-20 bg-transparent py-4 border-b border-slate-100/80">
      <div
        ref={scrollRef}
        onMouseEnter={handleInteractionStart}
        onMouseLeave={() => {
          handleMouseUp();
          handleInteractionEnd();
        }}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
        onTouchCancel={handleInteractionEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onScroll={handleScroll}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar scroll-smooth select-none cursor-grab active:cursor-grabbing"
        style={{ touchAction: "pan-x" }}
      >
        <div className="auth-session-ticker-track flex w-max items-center py-1">
          {tickerItems.map((session, index) => {
            const handle = formatInstagramHandle(session.instructorName || session.instructor);
            const imageUrl = getSessionImageUrl(session);
            const linkPath = `/courses/${encodeURIComponent(String(session.id))}`;
            const isLive = session.isLive;

            return (
              <Link
                key={`${session.id}-${index}`}
                to={linkPath}
                onClick={handleCardClick}
                className="flex flex-col items-center shrink-0 group transition-all duration-200 hover:scale-105 active:scale-95 mr-6"
              >
                <div className="relative">
                  <div className={`w-[74px] h-[74px] rounded-full p-[2.5px] ${
                    isLive 
                      ? "bg-gradient-to-tr from-[#f59e0b] via-[#ef4444] to-[#ec4899] shadow-sm animate-pulse" 
                      : "bg-gradient-to-tr from-[#10b981] via-[#06b6d4] to-[#3b82f6] shadow-sm"
                  }`}>
                    <div className="w-full h-full rounded-full bg-white p-[2.5px] flex items-center justify-center">
                      <img
                        src={imageUrl}
                        alt={session.instructorName || "Trainer"}
                        className="w-full h-full rounded-full object-cover bg-slate-50 pointer-events-none"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {isLive ? (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md scale-95 flex items-center gap-0.5 border border-white">
                      <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
                      LIVE
                    </div>
                  ) : (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[7.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm scale-95 border border-white whitespace-nowrap">
                      {getUpcomingBadgeText(session.occurrence?.scheduledAt || session.scheduledAt)}
                    </div>
                  )}
                </div>

                <span className="text-[11px] text-[#52525b] group-hover:text-slate-900 font-medium mt-3.5 tracking-wide truncate max-w-[78px]">
                  {handle}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const { isAuthenticated } = useAuth();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [authHeroImageIndex, setAuthHeroImageIndex] = useState(0);
  const [bannerGone, setBannerGone] = useState(() => isAuthenticated || hasSeenHeroIntro());
  const [displayedHeading1, setDisplayedHeading1] = useState("");
  const [displayedHeading2, setDisplayedHeading2] = useState("");
  const [displayedDescription, setDisplayedDescription] = useState("");

  const headingText  = "Upgrade Your Skills.";
  const headingText2 = "Advance Your Career.";
  const descriptionText = "Access elite education from global experts. Our structured paths are meticulously designed for those aiming to master high-impact skills in technology and design.";

  useEffect(() => {
    if (isAuthenticated) {
      rememberHeroIntroSeen();
      setBannerGone(true);
      return;
    }

    if (hasSeenHeroIntro()) {
      setBannerGone(true);
      setDisplayedHeading1(headingText);
      setDisplayedHeading2(headingText2);
      setDisplayedDescription(descriptionText);
      return;
    }

    rememberHeroIntroSeen();

    // Keep banner visible for 5s, then begin the handoff
    const liftTimer = setTimeout(() => {
      setBannerGone(false);
    }, 5000);

    // Start typewriter as banner begins moving
    const typeTimer = setTimeout(() => {
      let i = 0;
      const t1 = setInterval(() => {
        if (i < headingText.length) {
          setDisplayedHeading1(headingText.slice(0, i + 1));
          i++;
        } else {
          clearInterval(t1);
          let j = 0;
          const t2 = setInterval(() => {
            if (j < headingText2.length) {
              setDisplayedHeading2(headingText2.slice(0, j + 1));
              j++;
            } else {
              clearInterval(t2);
            }
          }, 52);
        }
      }, 75);
    }, 5200);

    const descTimer = setTimeout(() => {
      let k = 0;
      const t3 = setInterval(() => {
        if (k < descriptionText.length) {
          setDisplayedDescription(descriptionText.slice(0, k + 1));
          k++;
        } else {
          clearInterval(t3);
        }
      }, 18);
    }, 5500);

    // Remove banner from DOM after animation completes
    const doneTimer = setTimeout(() => setBannerGone(true), 6200);

    return () => {
      clearTimeout(liftTimer);
      clearTimeout(typeTimer);
      clearTimeout(descTimer);
      clearTimeout(doneTimer);
    };
  }, [isAuthenticated, descriptionText, headingText, headingText2]);

  // Authenticated hero image rotation
  useEffect(() => {
    if (!isAuthenticated || authenticatedHeroImages.length <= 1) return;
    const timer = window.setInterval(() => {
      setAuthHeroImageIndex((i) => (i + 1) % authenticatedHeroImages.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      /*
        KEY FIX:
        - section is position:relative with a fixed height (100svh)
        - .hero-content sits position:absolute, top=0, filling the whole section — always visible
        - .banner sits position:absolute, top=0, same size — slides UP with translateY(-100%)
        - No padding/margin offsets on the banner that would create gaps
        - When banner slides away, hero is already there pixel-perfectly
      */
      <section className="relative overflow-hidden bg-white min-h-[138svh] md:min-h-[100svh]">

        {/* ── HERO CONTENT — absolutely positioned, always behind banner, no gap ── */}
        <div className="absolute inset-0 flex flex-col">
          {/* spacer that matches navbar height so content doesn't sit under navbar */}
          <div className="shrink-0" style={{ height: "var(--navbar-height, 48px)" }} />

          <div className="relative mx-auto grid w-full max-w-7xl flex-1 items-start gap-10 px-4 pb-16 pt-2 sm:px-6 sm:pb-20 sm:pt-4 md:pt-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:pb-0 lg:pt-8">

            {/* LEFT */}
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="mb-6"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    World-Class Academic Excellence
                  </span>
                </div>
              </motion.div>

              <div className="mb-5">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  <div className="min-h-[3.5rem] text-gray-950 sm:min-h-[4.5rem] lg:min-h-[5rem]">
                    {displayedHeading1}
                    {displayedHeading1.length > 0 && displayedHeading1.length < headingText.length && (
                      <span className="animate-pulse">|</span>
                    )}
                  </div>
                  <div className="min-h-[3.5rem] bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent sm:min-h-[4.5rem] lg:min-h-[5rem]">
                    {displayedHeading2}
                    {displayedHeading2.length > 0 && displayedHeading2.length < headingText2.length && (
                      <span className="animate-pulse text-emerald-600">|</span>
                    )}
                  </div>
                </h1>
              </div>

              <div className="mb-7">
                <p className="min-h-[7rem] max-w-2xl text-base leading-relaxed text-gray-600 sm:min-h-[6rem] md:text-lg">
                  {displayedDescription}
                  {displayedDescription.length > 0 && displayedDescription.length < descriptionText.length && (
                    <span className="animate-pulse text-emerald-600">|</span>
                  )}
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                className="mb-8 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/courses"
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-teal-500/25 transition-all duration-300 hover:shadow-teal-500/40 min-[420px]:w-auto"
                  >
                    Start Learning
                    <FiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/plans"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-800 transition-all duration-300 hover:border-emerald-500 hover:bg-emerald-50 min-[420px]:w-auto"
                  >
                    View Programs
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => setIsVideoPlaying(true)}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-emerald-800 transition-all duration-300 hover:bg-emerald-50 hover:text-emerald-950 min-[420px]:w-auto"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 transition-all group-hover:bg-emerald-200">
                      <FiPlay className="ml-0.5 h-3 w-3" />
                    </span>
                    Watch Demo
                  </button>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.3 }}
                className="flex flex-wrap items-center gap-3 pt-2"
              >
                <div className="flex items-center gap-1.5">
                  <FiTrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-[11px] text-gray-600">Top Rated Platform</span>
                </div>
                <div className="h-0.5 w-0.5 rounded-full bg-emerald-500" />
                <div className="flex items-center gap-1.5">
                  <HiCheckBadge className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-[11px] text-gray-600">Certified Courses</span>
                </div>
                <div className="h-0.5 w-0.5 rounded-full bg-emerald-500" />
                <div className="flex items-center gap-1.5">
                  <FiUsers className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-[11px] text-gray-600">24/7 Support</span>
                </div>
              </motion.div>
            </div>

            {/* RIGHT — Globe */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 1.0 }}
            className="ag-globe-col relative flex min-h-[320px] lg:min-h-[520px] lg:flex"
          >
              <div className="ag-globe-wrap">
                <div className="ag-globe-ring ag-globe-ring-1" />
                <div className="ag-globe-ring ag-globe-ring-2" />
                <div style={{ position: "absolute", inset: "40px", borderRadius: "50%", border: "1px dashed rgba(16,185,129,0.16)" }} />
                <div className="ag-globe-core">
                  <svg viewBox="0 0 200 200" aria-hidden="true" style={{ width: "100%", height: "100%" }}>
                    <ellipse cx="100" cy="100" rx="98" ry="98" fill="none" stroke="#fbd9da" strokeWidth="0.75" />
                    <ellipse cx="100" cy="100" rx="60" ry="98" fill="none" stroke="#fbd9da" strokeWidth="0.55" />
                    <ellipse cx="100" cy="100" rx="24" ry="98" fill="none" stroke="#fbd9da" strokeWidth="0.45" />
                    <line x1="2" y1="100" x2="198" y2="100" stroke="#fbd9da" strokeWidth="0.55" />
                    <line x1="100" y1="2" x2="100" y2="198" stroke="#fbd9da" strokeWidth="0.45" />
                    <ellipse cx="100" cy="100" rx="98" ry="40" fill="none" stroke="#fbd9da" strokeWidth="0.55" />
                    <ellipse cx="100" cy="100" rx="98" ry="70" fill="none" stroke="#fbd9da" strokeWidth="0.45" />
                  </svg>
                  <div className="ag-globe-center">
                    <img src={lurnStackLogo} alt="LurnStack" width="66" height="66" className="object-contain" />
                  </div>
                </div>
                <svg className="ag-connection-map" viewBox="0 0 540 540" aria-hidden="true">
                  <path className="ag-connection-line ag-connection-line-main" d="M270 270 L140 160 L270 62 L405 150 L382 392 L160 378 Z" />
                  <path className="ag-connection-line" d="M270 270 L140 160" />
                  <path className="ag-connection-line" d="M270 270 L405 150" />
                  <path className="ag-connection-line" d="M270 270 L160 378" />
                  <path className="ag-connection-line" d="M270 270 L382 392" />
                  <path className="ag-connection-line" d="M270 270 L270 62" />
                  <circle className="ag-moving-dot ag-moving-dot-green" r="4">
                    <animateMotion dur="8s" repeatCount="indefinite" path="M270 270 L140 160 L270 62 L405 150 L382 392 L160 378 Z" />
                  </circle>
                  <circle className="ag-moving-dot ag-moving-dot-blue" r="3.5">
                    <animateMotion dur="8s" begin="1.6s" repeatCount="indefinite" path="M270 270 L140 160 L270 62 L405 150 L382 392 L160 378 Z" />
                  </circle>
                  <circle className="ag-moving-dot ag-moving-dot-purple" r="3.5">
                    <animateMotion dur="8s" begin="3.2s" repeatCount="indefinite" path="M270 270 L140 160 L270 62 L405 150 L382 392 L160 378 Z" />
                  </circle>
                </svg>
                <div className="ag-course-node ag-course-node-programming"><span><FiCode /></span><strong>Programming</strong></div>
                <div className="ag-course-node ag-course-node-database"><span><FiDatabase /></span><strong>Database</strong></div>
                <div className="ag-course-node ag-course-node-ai"><span><FiCpu /></span><strong>AI</strong></div>
                <div className="ag-course-node ag-course-node-cloud"><span><FiCloud /></span><strong>Cloud</strong></div>
                <div className="ag-course-node ag-course-node-mobile"><span><FiSmartphone /></span><strong>Mobile</strong></div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── BANNER VIDEO — covers inset-0, slides straight up, no padding/offset ── */}
        {!bannerGone && (
          <motion.div
            className="absolute inset-0 z-50"
            initial={{ y: "0%" }}
            animate={{ y: "-100%" }}
            transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1], delay: 5.0 }}
            onAnimationComplete={() => setBannerGone(true)}
          >
            <video
              src={bannerIntroVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="h-full w-full object-cover"
            />
          </motion.div>
        )}

        {/* Demo video modal */}
        {isVideoPlaying && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90"
            onClick={() => setIsVideoPlaying(false)}
          >
            <div
              className="relative mx-4 w-full max-w-4xl overflow-hidden rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsVideoPlaying(false)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-sm text-white transition-all hover:bg-black/80"
              >
                ✕
              </button>
              <div className="relative pb-[56.25%]">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://www.instagram.com/reel/DYrXAIQhIay/embed/"
                  title="Demo Video"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  // ── AUTHENTICATED FLOW (unchanged) ────────────────────────────────────────
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#ffe7ea] via-[#fff5f6] to-transparent" />
      <div className="relative mx-auto grid min-h-[calc(100svh-137px)] w-full max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, x: -36 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-2xl"
        >
          <div className="inline-flex text-[11px] font-black uppercase tracking-[0.28em] text-rose-500">
            Live classes made simple
          </div>
          <h1 className="mt-4 text-4xl font-black leading-tight text-[#19213d] sm:text-5xl lg:text-6xl">
            Join Live Online
            <span className="block">Learning Sessions</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
            Discover expert-led live classes, book upcoming sessions, and keep building practical skills with LurnStack trainers.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const query = new FormData(event.currentTarget).get("heroSearch");
              const q = String(query || "").trim();
              window.location.href = q ? `/courses?q=${encodeURIComponent(q)}` : "/courses";
            }}
            className="mt-8 flex max-w-md overflow-hidden rounded-sm border border-gray-100 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.08)]"
          >
            <input
              name="heroSearch"
              type="search"
              placeholder="What do you want to learn?"
              className="min-w-0 flex-1 px-4 py-4 text-sm font-semibold text-gray-700 outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="flex w-14 items-center justify-center bg-rose-500 text-white transition hover:bg-rose-600"
              aria-label="Search courses"
            >
              <FiArrowRight className="text-xl" />
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 36, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="relative flex min-h-[360px] items-end justify-center sm:min-h-[460px] lg:min-h-[560px]"
        >
          <div className="absolute inset-x-8 bottom-10 top-10 rounded-[48%] bg-[#ffe5e8]" />
          <motion.img
            key={authenticatedHeroImages[authHeroImageIndex]}
            src={authenticatedHeroImages[authHeroImageIndex]}
            alt="Student attending online live classes"
            initial={{ opacity: 0, scale: 0.96, x: 18 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="relative z-10 max-h-[520px] w-full max-w-[620px] object-contain"
            loading="eager"
          />
        </motion.div>
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import { HiCheckBadge } from "react-icons/hi2";
import { FiAward, FiPlay, FiUsers, FiBookOpen, FiTrendingUp, FiArrowRight, FiCode, FiDatabase, FiCloud, FiSmartphone, FiCpu } from "react-icons/fi";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import lurnStackLogo from "../../assets/Logo/Logo3.png";
import heroLoginImage from "../../assets/Images/Hero/hero3.png";
import heroLoginImageAlt from "../../assets/Images/Hero/hero-image1.png";
import { useAuth } from "../../auth";

const authenticatedHeroImages = [heroLoginImage, heroLoginImageAlt];

export default function HeroSection() {
  const { isAuthenticated } = useAuth();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [authHeroImageIndex, setAuthHeroImageIndex] = useState(0);

  // Text animation - character by character
  const headingText = "Upgrade Your Skills.";
  const headingText2 = "Advance Your Career.";
  
  const [displayedHeading1, setDisplayedHeading1] = useState("");
  const [displayedHeading2, setDisplayedHeading2] = useState("");
  const [displayedDescription, setDisplayedDescription] = useState("");
  
  const descriptionText = "Access elite education from global experts. Our structured paths are meticulously designed for those aiming to master high-impact skills in technology and design.";

  // Typewriter effect for headings
  useEffect(() => {
    let i = 0;
    const timer1 = setInterval(() => {
      if (i < headingText.length) {
        setDisplayedHeading1(headingText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer1);
        // Start second heading after first completes
        let j = 0;
        const timer2 = setInterval(() => {
          if (j < headingText2.length) {
            setDisplayedHeading2(headingText2.slice(0, j + 1));
            j++;
          } else {
            clearInterval(timer2);
          }
        }, 50);
      }
    }, 80);

    return () => clearInterval(timer1);
  }, []);

  // Typewriter effect for description
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < descriptionText.length) {
        setDisplayedDescription(descriptionText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 20);

    return () => clearInterval(timer);
  }, []);

  // Separate counters for each stat
  const [learnersCount, setLearnersCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  
  useEffect(() => {
    // Learners counter (0 to 25000)
    let startLearners = 0;
    const endLearners = 25000;
    const durationLearners = 2500;
    const incrementLearners = endLearners / (durationLearners / 16);
    const timerLearners = setInterval(() => {
      startLearners += incrementLearners;
      if (startLearners >= endLearners) {
        setLearnersCount(endLearners);
        clearInterval(timerLearners);
      } else {
        setLearnersCount(Math.floor(startLearners));
      }
    }, 16);

    // Courses counter (0 to 500)
    let startCourses = 0;
    const endCourses = 500;
    const durationCourses = 2000;
    const incrementCourses = endCourses / (durationCourses / 16);
    const timerCourses = setInterval(() => {
      startCourses += incrementCourses;
      if (startCourses >= endCourses) {
        setCoursesCount(endCourses);
        clearInterval(timerCourses);
      } else {
        setCoursesCount(Math.floor(startCourses));
      }
    }, 16);

    // Success rate counter (0 to 98)
    let startSuccess = 0;
    const endSuccess = 98;
    const durationSuccess = 1800;
    const incrementSuccess = endSuccess / (durationSuccess / 16);
    const timerSuccess = setInterval(() => {
      startSuccess += incrementSuccess;
      if (startSuccess >= endSuccess) {
        setSuccessRate(endSuccess);
        clearInterval(timerSuccess);
      } else {
        setSuccessRate(Math.floor(startSuccess));
      }
    }, 16);

    return () => {
      clearInterval(timerLearners);
      clearInterval(timerCourses);
      clearInterval(timerSuccess);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || authenticatedHeroImages.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setAuthHeroImageIndex((index) => (index + 1) % authenticatedHeroImages.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <section className="relative flex min-h-[calc(100svh-72px)] items-center bg-white">
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
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
                  <span className="animate-pulse">|</span>
                </div>
                <div className="min-h-[3.5rem] bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent sm:min-h-[4.5rem] lg:min-h-[5rem]">
                  {displayedHeading2}
                  {displayedHeading2.length === headingText2.length ? null : (
                    <span className="animate-pulse text-emerald-600">|</span>
                  )}
                </div>
              </h1>
            </div>

            <div className="mb-7">
              <p className="min-h-[7rem] max-w-2xl text-base leading-relaxed text-gray-600 opacity-95 sm:min-h-[6rem] md:text-lg">
                {displayedDescription}
                {displayedDescription.length === descriptionText.length ? null : (
                  <span className="animate-pulse text-emerald-600">|</span>
                )}
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.5 }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.8 }}
              className="mb-6 grid gap-4 min-[520px]:flex min-[520px]:flex-wrap min-[520px]:items-center min-[520px]:gap-5"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-teal-600 to-emerald-600 shadow-md"
                    />
                  ))}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-teal-500 to-emerald-500 text-[10px] font-bold text-white shadow-md">
                    +2k
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500">Active Learners</p>
                  <p className="text-lg font-bold text-gray-950">
                    {learnersCount.toLocaleString()}+
                  </p>
                </div>
              </div>

              <div className="hidden h-6 w-px bg-gray-200 sm:block" />

              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                  <FiBookOpen className="h-4 w-4 text-emerald-700" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500">Expert-Led Courses</p>
                  <p className="text-lg font-bold text-gray-950">{coursesCount}+</p>
                </div>
              </div>

              <div className="hidden h-6 w-px bg-gray-200 sm:block" />

              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                  <FiAward className="h-4 w-4 text-emerald-700" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500">Success Rate</p>
                  <p className="text-lg font-bold text-gray-950">{successRate}%</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 2.0 }}
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

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="ag-globe-col relative hidden min-h-[520px] lg:flex"
          >
            <div className="ag-globe-wrap">
              <div className="ag-globe-ring ag-globe-ring-1"></div>
              <div className="ag-globe-ring ag-globe-ring-2"></div>
              <div style={{ position: "absolute", inset: "40px", borderRadius: "50%", border: "1px dashed rgba(16, 185, 129, 0.16)" }}></div>
              <div className="ag-globe-core">
                <svg viewBox="0 0 200 200" aria-hidden="true" style={{ width: "100%", height: "100%" }}>
                  <ellipse cx="100" cy="100" rx="98" ry="98" fill="none" stroke="#fbd9da" strokeWidth="0.75"></ellipse>
                  <ellipse cx="100" cy="100" rx="60" ry="98" fill="none" stroke="#fbd9da" strokeWidth="0.55"></ellipse>
                  <ellipse cx="100" cy="100" rx="24" ry="98" fill="none" stroke="#fbd9da" strokeWidth="0.45"></ellipse>
                  <line x1="2" y1="100" x2="198" y2="100" stroke="#fbd9da" strokeWidth="0.55"></line>
                  <line x1="100" y1="2" x2="100" y2="198" stroke="#fbd9da" strokeWidth="0.45"></line>
                  <ellipse cx="100" cy="100" rx="98" ry="40" fill="none" stroke="#fbd9da" strokeWidth="0.55"></ellipse>
                  <ellipse cx="100" cy="100" rx="98" ry="70" fill="none" stroke="#fbd9da" strokeWidth="0.45"></ellipse>
                </svg>
                <div className="ag-globe-center">
                  <img src={lurnStackLogo} alt="LurnStack" />
                </div>
              </div>
              <svg className="ag-connection-map" viewBox="0 0 540 540" aria-hidden="true">
                <path
                  className="ag-connection-line ag-connection-line-main"
                  d="M270 270 L140 160 L270 62 L405 150 L382 392 L160 378 Z"
                />
                <path className="ag-connection-line" d="M270 270 L140 160" />
                <path className="ag-connection-line" d="M270 270 L405 150" />
                <path className="ag-connection-line" d="M270 270 L160 378" />
                <path className="ag-connection-line" d="M270 270 L382 392" />
                <path className="ag-connection-line" d="M270 270 L270 62" />
                <circle className="ag-moving-dot ag-moving-dot-green" r="4">
                  <animateMotion
                    dur="8s"
                    repeatCount="indefinite"
                    path="M270 270 L140 160 L270 62 L405 150 L382 392 L160 378 Z"
                  />
                </circle>
                <circle className="ag-moving-dot ag-moving-dot-blue" r="3.5">
                  <animateMotion
                    dur="8s"
                    begin="1.6s"
                    repeatCount="indefinite"
                    path="M270 270 L140 160 L270 62 L405 150 L382 392 L160 378 Z"
                  />
                </circle>
                <circle className="ag-moving-dot ag-moving-dot-purple" r="3.5">
                  <animateMotion
                    dur="8s"
                    begin="3.2s"
                    repeatCount="indefinite"
                    path="M270 270 L140 160 L270 62 L405 150 L382 392 L160 378 Z"
                  />
                </circle>
              </svg>
              <div className="ag-course-node ag-course-node-programming">
                <span><FiCode /></span>
                <strong>Programming</strong>
              </div>
              <div className="ag-course-node ag-course-node-database">
                <span><FiDatabase /></span>
                <strong>Database</strong>
              </div>
              <div className="ag-course-node ag-course-node-ai">
                <span><FiCpu /></span>
                <strong>AI</strong>
              </div>
              <div className="ag-course-node ag-course-node-cloud">
                <span><FiCloud /></span>
                <strong>Cloud</strong>
              </div>
              <div className="ag-course-node ag-course-node-mobile">
                <span><FiSmartphone /></span>
                <strong>Mobile</strong>
              </div>
              <div style={{ position: "absolute", width: "120px", height: "120px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16, 185, 129, 0.12), transparent 70%)", pointerEvents: "none" }}></div>
            </div>
          </motion.div>
        </div>

        {isVideoPlaying && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setIsVideoPlaying(false)}>
            <div className="relative mx-4 w-full max-w-4xl overflow-hidden rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsVideoPlaying(false)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-sm text-white transition-all hover:bg-black/80"
              >
                X
              </button>
              <div className="relative pb-[56.25%]">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1"
                  title="Demo Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#ffe7ea] via-[#fff5f6] to-transparent" />
      <div className="relative mx-auto grid min-h-[calc(100svh-89px)] w-full max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-14">
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

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-2xl font-black text-[#19213d]">{coursesCount}+</p>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Sessions</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#19213d]">{learnersCount.toLocaleString()}+</p>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Learners</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#19213d]">{successRate}%</p>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Success</p>
            </div>
          </div>
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

import { Link } from "react-router-dom";
import { HiCheckBadge } from "react-icons/hi2";
import { FiAward, FiPlay, FiUsers, FiBookOpen, FiTrendingUp, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import heroVideoAuth from "../../assets/Videos/Hero.mp4";
import heroVideoGuest from "../../assets/Videos/Hero1.mp4";
import { useAuth } from "../../auth";

export default function HeroSection() {
  const { isAuthenticated } = useAuth();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

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

  return (
    <section className="relative bg-[#00342B] min-h-screen flex items-center">
      <div className="absolute inset-0 w-full h-full">
        <video
          key={isAuthenticated ? "auth" : "guest"}
          autoPlay
          loop
          muted
          playsInline
          className="absolute w-full h-full object-cover"
        >
          <source src={isAuthenticated ? heroVideoAuth : heroVideoGuest} type="video/mp4" />
        </video>
        <div className={["absolute inset-0", isAuthenticated ? "bg-black/50" : "bg-black/55"].join(" ")} />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="max-w-3xl">
          
          {/* Item 1 - Badge - Fade in from left */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/20 backdrop-blur-sm rounded-full border border-teal-400/30">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-teal-100 uppercase tracking-wider">
                World-Class Academic Excellence
              </span>
            </div>
          </motion.div>

          {/* Item 2 - Main Heading - Typewriter effect */}
          <div className="mb-5">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <div className="text-white min-h-[4rem] md:min-h-[5rem]">
                {displayedHeading1}
                <span className="animate-pulse">|</span>
              </div>
              <div className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent min-h-[4rem] md:min-h-[5rem]">
                {displayedHeading2}
                {displayedHeading2.length === headingText2.length ? null : <span className="animate-pulse text-teal-400">|</span>}
              </div>
            </h1>
          </div>

          {/* Item 3 - Description - Typewriter effect */}
          <div className="mb-7">
            <p className="text-base md:text-lg text-teal-100 leading-relaxed opacity-95 max-w-2xl min-h-[6rem]">
              {displayedDescription}
              {displayedDescription.length === descriptionText.length ? null : <span className="animate-pulse text-teal-300">|</span>}
            </p>
          </div>

          {/* Item 4 - Buttons - Fade in sequentially */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.5 }}
            className="flex flex-wrap gap-3 mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/courses"
                className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg font-medium text-sm text-white shadow-md shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-300"
              >
                Start Learning
                <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/plans"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-teal-100 border border-teal-400/40 hover:border-teal-400/70 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                View Programs
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => setIsVideoPlaying(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-teal-100 hover:text-white transition-all duration-300 group backdrop-blur-sm"
              >
                <div className="w-7 h-7 rounded-full bg-teal-500/30 flex items-center justify-center group-hover:bg-teal-500/50 transition-all">
                  <FiPlay className="w-3 h-3 ml-0.5" />
                </div>
                Watch Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Item 5 - Stats Section - Animated counters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.8 }}
            className="flex flex-wrap items-center gap-5 mb-6"
          >
            {/* Active Learners */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#00342B] bg-gradient-to-br from-teal-600 to-emerald-600 shadow-md"
                  />
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-[#00342B] bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-[10px] font-bold shadow-md">
                  +2k
                </div>
              </div>
              <div>
                <p className="text-teal-200 text-[11px]">Active Learners</p>
                <p className="font-bold text-lg text-white">
                  {learnersCount.toLocaleString()}+
                </p>
              </div>
            </div>
            
            <div className="h-6 w-[1px] bg-teal-600/50 hidden sm:block" />
            
            {/* Expert Courses - Counter */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 backdrop-blur-sm flex items-center justify-center">
                <FiBookOpen className="w-4 h-4 text-teal-200" />
              </div>
              <div>
                <p className="text-teal-200 text-[11px]">Expert-Led Courses</p>
                <p className="font-bold text-lg text-white">
                  {coursesCount}+
                </p>
              </div>
            </div>

            <div className="h-6 w-[1px] bg-teal-600/50 hidden sm:block" />
            
            {/* Success Rate - Counter */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 backdrop-blur-sm flex items-center justify-center">
                <FiAward className="w-4 h-4 text-teal-200" />
              </div>
              <div>
                <p className="text-teal-200 text-[11px]">Success Rate</p>
                <p className="font-bold text-lg text-white">{successRate}%</p>
              </div>
            </div>
          </motion.div>

          {/* Item 6 - Trust Badges - Fade in */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 2.0 }}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            <div className="flex items-center gap-1.5">
              <FiTrendingUp className="w-3.5 h-3.5 text-teal-300" />
              <span className="text-teal-200 text-[11px]">Top Rated Platform</span>
            </div>
            <div className="w-0.5 h-0.5 rounded-full bg-teal-400" />
            <div className="flex items-center gap-1.5">
              <HiCheckBadge className="w-3.5 h-3.5 text-teal-300" />
              <span className="text-teal-200 text-[11px]">Certified Courses</span>
            </div>
            <div className="w-0.5 h-0.5 rounded-full bg-teal-400" />
            <div className="flex items-center gap-1.5">
              <FiUsers className="w-3.5 h-3.5 text-teal-300" />
              <span className="text-teal-200 text-[11px]">24/7 Support</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoPlaying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setIsVideoPlaying(false)}>
          <div className="relative w-full max-w-4xl mx-4 rounded-lg overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsVideoPlaying(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all text-sm"
            >
              ✕
            </button>
            <div className="relative pb-[56.25%]">
              <iframe
                className="absolute inset-0 w-full h-full"
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

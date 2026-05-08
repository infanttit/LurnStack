import { useRef, useState, useEffect } from "react";

import designImg        from "../../assets/Images/sample.png";
import productivityImg  from "../../assets/Images/sample.png";
import photographyImg   from "../../assets/Images/sample.png";
import fineArtImg       from "../../assets/Images/sample.png";
import marketingImg     from "../../assets/Images/sample.png";
import graphicDesignImg from "../../assets/Images/sample.png";
import developmentImg   from "../../assets/Images/sample.png";
import businessImg      from "../../assets/Images/sample.png";

const CATEGORIES = [
  {
    id: "design",
    name: "Design",
    img: designImg,
    fallback: "from-pink-500 to-rose-400",
  },
  {
    id: "productivity",
    name: "Productivity",
    img: productivityImg,
    fallback: "from-sky-500 to-cyan-400",
  },
  {
    id: "photography",
    name: "Photography",
    img: photographyImg,
    fallback: "from-zinc-700 to-zinc-500",
  },
  {
    id: "fine-art",
    name: "Fine Art",
    img: fineArtImg,
    fallback: "from-amber-400 to-yellow-300",
  },
  {
    id: "marketing",
    name: "Marketing",
    img: marketingImg,
    fallback: "from-orange-500 to-amber-400",
  },
  {
    id: "graphic-design",
    name: "Graphic Design",
    img: graphicDesignImg,
    fallback: "from-violet-600 to-purple-400",
  },
  {
    id: "development",
    name: "Development",
    img: developmentImg,
    fallback: "from-emerald-500 to-teal-400",
  },
  {
    id: "business",
    name: "Business",
    img: businessImg,
    fallback: "from-yellow-400 to-amber-300",
  },
];

/** Width of each panel in px — increased for bigger cards */
const PANEL_W = 350;

/** Height of the slider container — increased for bigger cards */
const SLIDER_HEIGHT = 450;

/** Seconds for one full loop — adjust as needed */
const DURATION = 44;

// ── Icons ─────────────────────────────────────────────────────
function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="white" aria-hidden="true">
      <rect x="2"  y="2" width="4" height="12" rx="1" />
      <rect x="10" y="2" width="4" height="12" rx="1" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="white" aria-hidden="true">
      <polygon points="3,2 13,8 3,14" />
    </svg>
  );
}

// ── Single slide panel ────────────────────────────────────────
function SlidePanel({ category }) {
  const { name, img, fallback } = category;

  return (
    <div
      className="relative flex-shrink-0 overflow-hidden"
      style={{ width: PANEL_W, height: "100%" }}
    >
      {/* Real image OR gradient fallback */}
      {img ? (
        <img
          src={img}
          alt={name}
          className="w-full h-full object-cover block"
          draggable={false}
        />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${fallback}`} />
      )}

      {/* Darkening overlay */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Category name label - increased font size for bigger cards */}
      <span
        className="absolute top-4 left-4 text-white font-bold text-xl
                   pointer-events-none drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]"
        style={{ fontFamily: "'Georgia','Times New Roman',serif", letterSpacing: "0.01em" }}
      >
        {name}
      </span>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────
export default function CategoryImageSlider() {
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);

  // Duplicate the list so the loop is seamless (track = 2× real items)
  const slides = [...CATEGORIES, ...CATEGORIES];

  // Toggle animation-play-state when paused changes
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.animationPlayState = paused ? "paused" : "running";
    }
  }, [paused]);

  return (
    <div
      className="relative w-full overflow-hidden bg-[#111] select-none"
      style={{ height: SLIDER_HEIGHT }}
    >
      {/* Keyframe — injected once */}
      <style>{`
        @keyframes sliderMarquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* ── Scrolling track ── */}
      <div
        ref={trackRef}
        className="flex h-full"
        style={{
          width: slides.length * PANEL_W,
          animation: `sliderMarquee ${DURATION}s linear infinite`,
        }}
      >
        {slides.map((cat, i) => (
          <SlidePanel key={`${cat.id}-${i}`} category={cat} />
        ))}
      </div>

      {/* ── Pause / Play button (bottom-right) ── */}
      <button
        onClick={() => setPaused((prev) => !prev)}
        aria-label={paused ? "Play slider" : "Pause slider"}
        className="absolute bottom-3 right-3 z-10 w-10 h-10 rounded-full
                   flex items-center justify-center
                   border border-white/25 cursor-pointer
                   hover:bg-white/20 transition-colors duration-200"
        style={{
          background: "rgba(30,30,30,0.75)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      >
        {paused ? <PlayIcon /> : <PauseIcon />}
      </button>
    </div>
  );
}
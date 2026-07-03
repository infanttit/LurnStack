import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosClient } from "../../shared/api/axiosClient";
import { env } from "../../shared/config/env";

const MOCK_POSTERS = [
  {
    id: "promo-ai",
    title: "Generative AI",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&h=800&q=80",
    linkUrl: "/courses?category=Artificial%20Intelligence%20(AI)"
  },
  {
    id: "promo-cert",
    title: "IT Certifications",
    imageUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&h=800&q=80",
    linkUrl: "/courses?category=Amazon%20AWS"
  },
  {
    id: "promo-ds",
    title: "Data Science",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&h=800&q=80",
    linkUrl: "/courses?category=Python"
  },
  {
    id: "promo-web",
    title: "Web Development",
    imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&h=800&q=80",
    linkUrl: "/courses"
  }
];

function getCategoryNameFromPoster(poster) {
  const url = String(poster?.linkUrl || "").toLowerCase();
  const title = String(poster?.title || "").toLowerCase();
  
  if (url.includes("artificial") || url.includes("ai") || title.includes("ai") || title.includes("artificial")) {
    return "Generative AI";
  }
  if (url.includes("aws") || url.includes("azure") || url.includes("cloud") || title.includes("aws") || title.includes("azure") || title.includes("cloud")) {
    return "IT Certifications";
  }
  if (url.includes("excel") || title.includes("excel")) {
    return "Microsoft Excel";
  }
  if (url.includes("marketing") || title.includes("marketing")) {
    return "Digital Marketing";
  }
  if (url.includes("python") || title.includes("python")) {
    return "Python Programming";
  }
  if (url.includes("sql") || url.includes("database") || title.includes("sql") || title.includes("database") || url.includes("data") || title.includes("data")) {
    return "Data Science";
  }
  return poster?.title || "Web Development";
}

function getCategoryPathFromPoster(poster) {
  const catName = getCategoryNameFromPoster(poster);
  
  if (catName === "Generative AI") {
    return "/courses?category=Artificial%20Intelligence%20(AI)";
  }
  if (catName === "IT Certifications") {
    return "/courses?category=Amazon%20AWS";
  }
  if (catName === "Data Science") {
    return "/courses?category=Python";
  }
  if (catName === "Digital Marketing") {
    return "/courses?category=Digital%20Marketing";
  }
  if (catName === "Microsoft Excel") {
    return "/courses?category=Microsoft%20Excel";
  }
  if (catName === "Python Programming") {
    return "/courses?category=Python";
  }
  
  return poster?.linkUrl || "/courses";
}

export default function HeroPromoCarousel() {
  const [posters, setPosters] = useState(MOCK_POSTERS);
  const N = posters.length;
  const [activeIndex, setActiveIndex] = useState(N);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadPosters() {
      try {
        const res = await axiosClient.get("/api/promos/posters");
        if (active && res.data && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setPosters(res.data.data);
        }
      } catch (err) {
        // Fallback silently to mock banners
      }
    }
    loadPosters();
    return () => { active = false; };
  }, []);

  // Sync activeIndex with N
  useEffect(() => {
    setActiveIndex(posters.length);
  }, [posters.length]);

  // Automatic looping interval
  useEffect(() => {
    if (isPaused || !N) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused, N]);

  const nextSlide = () => {
    if (!isTransitioning) return;
    setActiveIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (!isTransitioning) return;
    setActiveIndex((prev) => prev - 1);
  };

  const handleTransitionEnd = () => {
    if (activeIndex >= 2 * N) {
      setIsTransitioning(false);
      setActiveIndex(activeIndex - N);
    } else if (activeIndex < N) {
      setIsTransitioning(false);
      setActiveIndex(activeIndex + N);
    }
  };

  useEffect(() => {
    if (!isTransitioning) {
      const frame = requestAnimationFrame(() => {
        setIsTransitioning(true);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [isTransitioning]);

  if (!posters.length) return null;

  const baseUrl = String(env.apiBaseUrl || "").replace(/\/+$/, "");
  const extendedPosters = [...posters, ...posters, ...posters];


  return (
    <div className="bg-white py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-6 border-b border-slate-100">
      {/* Full-width Slider of full-image tiles */}
      <div 
        className="flex flex-col overflow-hidden w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Track Container */}
        <div className="relative overflow-hidden w-full py-4">
          <div 
            className="flex gap-6"
            style={{ 
              transform: `translateX(-${activeIndex * (280 + 24)}px)`,
              transition: isTransitioning ? "transform 500ms ease-out" : "none"
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {extendedPosters.map((poster, index) => {
              const rawImageUrl = poster?.imageUrl || "";
              const imageUrl = rawImageUrl.startsWith("http")
                ? rawImageUrl
                : `${baseUrl}/${rawImageUrl.replace(/^\/+/, "")}`;
              
              const displayTitle = getCategoryNameFromPoster(poster);
              const displayPath = getCategoryPathFromPoster(poster);
              const isExternal = displayPath.startsWith("http://") || displayPath.startsWith("https://");
              const normalizedLink = (!isExternal && !displayPath.startsWith("/")) ? `/${displayPath}` : displayPath;

              // Determine subtitle and discount text dynamically
              let subtitle = "LURNSTACK CLASS";
              let discountText = "UPTO 50% OFF";
              if (displayTitle === "Generative AI") {
                subtitle = "FUTURE TECH";
                discountText = "UPTO 60% OFF";
              } else if (displayTitle === "IT Certifications") {
                subtitle = "CLOUD & NETWORK";
                discountText = "UPTO 60% OFF";
              } else if (displayTitle === "Data Science") {
                subtitle = "ANALYTICS & PYTHON";
                discountText = "UPTO 50% OFF";
              } else if (displayTitle === "Web Development") {
                subtitle = "FULL STACK & APPS";
                discountText = "FREE ACCESS";
              }

              const cardContent = (
                <div className="w-full h-full p-6 flex flex-col justify-between relative overflow-hidden bg-slate-900 rounded-none hover:shadow-xl transition-all duration-300 group select-none">
                  {/* Background Image */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={imageUrl}
                      alt={displayTitle}
                      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Dark Gradient Overlay for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 z-10" />

                  {/* Top Text & Badge */}
                  <div className="relative z-20 flex flex-col items-start">
                    <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">
                      {subtitle}
                    </span>
                    <h3 className="font-black text-[22px] text-white leading-tight uppercase tracking-tight mt-1">
                      {displayTitle}
                    </h3>
                    <div className="mt-3.5 inline-flex items-center bg-[#004d3d] text-emerald-300 border border-emerald-500/30 rounded-full px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase">
                      {discountText}
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div className="relative z-20 flex items-end justify-between mt-6">
                    {/* Arrow Icon inside Green Circle */}
                    <div className="w-10 h-10 rounded-full bg-[#004d3d] group-hover:bg-[#003d31] text-white flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 shadow-md border border-emerald-500/20">
                      <svg className="w-5 h-5 stroke-current stroke-[2.5]" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              );

              return (
                <div 
                  key={`${poster.id}-${index}`}
                  className="w-[280px] h-[350px] shrink-0 rounded-none cursor-pointer"
                >
                  {isExternal ? (
                    <a href={normalizedLink} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                      {cardContent}
                    </a>
                  ) : (
                    <Link to={normalizedLink} className="block w-full h-full">
                      {cardContent}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Slider Controls underneath */}
        <div className="flex items-center justify-center gap-6 mt-6 select-none w-full">
          {/* Prev Chevron */}
          <button
            onClick={prevSlide}
            className="w-10 h-10 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors focus:outline-none cursor-pointer"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Dots indicators */}
          <div className="flex items-center gap-2">
            {posters.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (!isTransitioning) return;
                  setActiveIndex(N + i);
                }}
                className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                  i === ((activeIndex - N + N) % N) ? "w-8 bg-[#004d3d]" : "w-2 bg-slate-200"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Next Chevron */}
          <button
            onClick={nextSlide}
            className="w-10 h-10 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors focus:outline-none cursor-pointer"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}


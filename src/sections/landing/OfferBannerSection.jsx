import React from "react";

const CARDS_DATA = [
  {
    id: "offer-deals",
    title: "Delightful Deals",
    type: "starburst",
  },
  {
    id: "offer-cash",
    title: "Win ₹100 Free Cash",
    type: "chest",
  },
  {
    id: "offer-discount",
    title: "Flat ₹200 OFF & More",
    type: "tickets",
  },
  {
    id: "offer-99store",
    title: "Meals At ₹99",
    type: "99store",
  }
];

export default function OfferBannerSection() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-8">
      {/* Dark Green Banner container with rounded borders */}
      <div className="bg-[#035a34] rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden">
        
        {/* Header Section with Title, floating money and Order Now button */}
        <div className="flex flex-col items-center justify-center text-center mb-8 select-none">
          <div className="relative flex items-center gap-3 sm:gap-6">
            
            {/* Left Floating Cash Note */}
            <div 
              className="hidden sm:block" 
              style={{ animation: "float 3s ease-in-out infinite" }}
            >
              <svg className="w-12 h-8 text-emerald-300 fill-current transform -rotate-12 drop-shadow-md" viewBox="0 0 60 36">
                <rect width="60" height="36" rx="4" fill="#10b981" />
                <rect x="3" y="3" width="54" height="30" fill="none" stroke="#6ee7b7" strokeWidth="1.2" />
                <circle cx="30" cy="18" r="7" fill="#047857" />
                <text x="30" y="22" fill="#6ee7b7" fontSize="11" fontWeight="bold" textAnchor="middle">₹</text>
              </svg>
            </div>

            {/* Title text with custom typography */}
            <div className="flex flex-col items-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white font-sans uppercase">
                NO FEE DAYS
              </h2>
            </div>

            {/* Right Floating Cash Note */}
            <div 
              className="hidden sm:block" 
              style={{ animation: "float 3s ease-in-out infinite", animationDelay: "0.5s" }}
            >
              <svg className="w-12 h-8 text-emerald-300 fill-current transform rotate-12 drop-shadow-md" viewBox="0 0 60 36">
                <rect width="60" height="36" rx="4" fill="#10b981" />
                <rect x="3" y="3" width="54" height="30" fill="none" stroke="#6ee7b7" strokeWidth="1.2" />
                <circle cx="30" cy="18" r="7" fill="#047857" />
                <text x="30" y="22" fill="#6ee7b7" fontSize="11" fontWeight="bold" textAnchor="middle">₹</text>
              </svg>
            </div>
            
          </div>

          {/* Yellow Pill Button for Instamart order/enroll */}
          <div className="mt-3">
            <span className="bg-[#facc15] hover:bg-yellow-300 text-[#035a34] text-[10px] sm:text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md transition-colors cursor-pointer">
              ORDER NOW
            </span>
          </div>
        </div>

        {/* Scrollable Row of Cards */}
        <div className="flex overflow-x-auto gap-4 pb-4 pt-2 scrollbar-hide snap-x snap-mandatory justify-start md:justify-center w-full px-2">
          {CARDS_DATA.map((card) => {
            return (
              <div
                key={card.id}
                className="bg-[#0b663b] w-[160px] sm:w-[185px] shrink-0 rounded-2xl p-4 flex flex-col items-center justify-between text-center min-h-[200px] border border-[#0d7949]/30 transition-all duration-300 hover:scale-105 hover:shadow-lg snap-start"
              >
                {/* Title */}
                <h3 className="text-xs sm:text-sm font-extrabold leading-tight text-white mb-2 uppercase tracking-wide">
                  {card.title}
                </h3>

                {/* Graphics */}
                <div className="flex-1 flex items-center justify-center my-2">
                  {card.type === "starburst" && (
                    <div className="relative flex items-center justify-center w-24 h-24 my-1 shrink-0">
                      <svg className="w-24 h-24 text-[#e51a80] fill-current drop-shadow-md animate-pulse" viewBox="0 0 100 100">
                        <path d="M50 5 L55 18 L68 12 L67 26 L80 24 L74 37 L86 40 L77 50 L86 60 L74 63 L80 76 L67 74 L68 88 L55 82 L50 95 L45 82 L32 88 L33 74 L20 76 L26 63 L14 60 L23 50 L14 40 L26 37 L20 24 L33 26 L32 12 L45 18 Z" />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] uppercase font-black text-white tracking-widest leading-none">Get</span>
                        <span className="text-lg font-black text-white leading-none my-0.5">70%</span>
                        <span className="text-[9px] uppercase font-black text-white tracking-wider leading-none">OFF</span>
                      </div>
                    </div>
                  )}

                  {card.type === "chest" && (
                    <div className="relative flex items-center justify-center w-24 h-20 my-1 shrink-0">
                      <svg className="w-24 h-20 drop-shadow-md" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Sparkles */}
                        <path d="M25 20 L27 25 L32 27 L27 29 L25 34 L23 29 L18 27 L23 25 Z" fill="#FBBF24" className="animate-pulse" />
                        <path d="M95 30 L97 33 L102 35 L97 37 L95 42 L93 37 L88 35 L93 33 Z" fill="#FBBF24" className="animate-pulse" />
                        
                        {/* Coins heap */}
                        <ellipse cx="60" cy="48" rx="28" ry="12" fill="#F59E0B" />
                        <circle cx="48" cy="45" r="7" fill="#FBBF24" />
                        <circle cx="56" cy="43" r="7" fill="#F59E0B" />
                        <circle cx="64" cy="44" r="7" fill="#D97706" />
                        <circle cx="72" cy="46" r="7" fill="#FBBF24" />
                        <circle cx="52" cy="48" r="7" fill="#F59E0B" />
                        <circle cx="60" cy="47" r="7" fill="#FBBF24" />
                        <circle cx="68" cy="48" r="7" fill="#D97706" />
                        
                        {/* Chest base */}
                        <path d="M25 50 H95 V80 C95 84 91 88 87 88 H33 C29 88 25 84 25 80 Z" fill="#7C3AED" />
                        <path d="M35 50 V88 M85 50 V88 M25 65 H95" stroke="#6D28D9" strokeWidth="3" />
                        
                        {/* Chest lock */}
                        <rect x="52" y="47" width="16" height="16" rx="3" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
                        <circle cx="60" cy="53" r="2.5" fill="#000" />
                        <path d="M60 55.5 V61" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                        
                        {/* Chest lid */}
                        <path d="M22 47 C22 36 32 30 45 30 H75 C88 30 98 36 98 47 H22 Z" fill="#8B5CF6" />
                        <path d="M35 30 C35 38 35 47 35 47 M85 30 C85 38 85 47 85 47" stroke="#A78BFA" strokeWidth="2.5" />
                        <line x1="22" y1="47" x2="98" y2="47" stroke="#A78BFA" strokeWidth="3" />
                      </svg>
                    </div>
                  )}

                  {card.type === "tickets" && (
                    <div className="relative flex items-center justify-center w-24 h-20 my-1 shrink-0">
                      <svg className="w-24 h-20 drop-shadow-md" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Bowl */}
                        <path d="M20 70 C20 85 100 85 100 70 Z" fill="#E2E8F0" />
                        <ellipse cx="60" cy="70" rx="40" ry="6" fill="#F1F5F9" />
                        
                        {/* Ticket 1 (Left) */}
                        <g transform="translate(32, 22) rotate(-8)">
                          <rect width="26" height="46" rx="4" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.5" />
                          <circle cx="0" cy="23" r="3" fill="#0b663b" />
                          <circle cx="26" cy="23" r="3" fill="#0b663b" />
                          <text x="13" y="30" fill="#15803d" fontSize="24" fontWeight="950" textAnchor="middle">₹</text>
                          <line x1="3" y1="38" x2="23" y2="38" stroke="#D97706" strokeWidth="1.2" strokeDasharray="3 2" />
                        </g>
                        
                        {/* Ticket 2 (Right) */}
                        <g transform="translate(58, 20) rotate(8)">
                          <rect width="26" height="46" rx="4" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.5" />
                          <circle cx="0" cy="23" r="3" fill="#0b663b" />
                          <circle cx="26" cy="23" r="3" fill="#0b663b" />
                          <text x="13" y="30" fill="#15803d" fontSize="24" fontWeight="950" textAnchor="middle">₹</text>
                          <line x1="3" y1="38" x2="23" y2="38" stroke="#D97706" strokeWidth="1.2" strokeDasharray="3 2" />
                        </g>
                      </svg>
                    </div>
                  )}

                  {card.type === "99store" && (
                    <div className="relative flex items-center justify-center w-24 h-20 my-1 shrink-0">
                      <svg className="w-24 h-20 drop-shadow-md animate-pulse" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M35 55 C22 55 18 40 30 32 C26 18 45 10 56 22 C68 10 87 18 83 32 C95 40 91 55 78 55 Z" fill="#1E293B" />
                        <path d="M30 42 C30 42 42 32 60 38" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
                        <text x="56" y="44" fill="#FBBF24" fontSize="26" fontWeight="950" textAnchor="middle">99</text>
                        <text x="56" y="54" fill="#FBBF24" fontSize="10" fontWeight="900" textAnchor="middle" letterSpacing="1">STORE</text>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom bar with course fees details */}
        <div className="border-t border-[#0d7949]/50 pt-4 mt-4 flex justify-center items-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#86efac] text-center select-none">
          DEL FEE | PACKAGING FEE | PLATFORM FEE REFUNDED
        </div>
      </div>
    </div>
  );
}

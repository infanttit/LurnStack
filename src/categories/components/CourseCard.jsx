import React, { useMemo, useState, useRef, useEffect } from "react";
import { FaCheck } from "react-icons/fa";
import { HiMiniStar } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../cart/model/CartContext";

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
  takeaways: customTakeaways
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewSide, setPreviewSide] = useState("right");
  const cardRef = useRef(null);
  const timerRef = useRef(null);
  const { addItem } = useCart();

  const handleMouseEnter = () => {
    setIsHovered(true);
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
    if (price === 0) return "Free";
    const p = typeof price === "number" ? price * 80 : 499;
    return `₹${p.toLocaleString()}`;
  }, [price]);

  const originalLabel = useMemo(() => {
    if (!originalPrice) return null;
    const p = typeof originalPrice === "number" ? originalPrice * 80 : 3499;
    return `₹${p.toLocaleString()}`;
  }, [originalPrice]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id,
      title,
      thumbnail,
      unitPricePaise: Math.round((price || 4.99) * 100),
      qty: 1
    });
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
      className={`relative border border-gray-200 bg-white rounded-sm cursor-pointer transition-all duration-200 ${isHovered ? 'z-[90]' : 'z-10'}`}
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
        <div className="p-3 flex flex-col gap-1.5 flex-1">
          <h3 className="font-bold text-[14px] text-gray-900 leading-snug line-clamp-2">
            {title}
          </h3>
          <p className="text-[12px] text-gray-500">{instructorName}</p>
          
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[13px] text-[#b4690e]">{rating || 4.8}</span>
            <StarRating rating={rating || 4.8} />
            <span className="text-[11px] text-gray-500">({(ratingCount || 1200).toLocaleString()})</span>
          </div>
          
          {badge && (
            <span className="self-start text-[10px] font-bold px-1.5 py-[2px] rounded-sm bg-[#eceb98] text-[#3d3c0a]">
              {badge}
            </span>
          )}

          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-bold text-[15px] text-gray-900">{priceLabel}</span>
            {originalLabel && (
              <span className="text-[12px] text-gray-400 line-through">{originalLabel}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Udemy-style Preview Popover ── */}
      <AnimatePresence>
        {showPreview && (
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
            className="absolute z-[100] w-[300px] bg-white border border-gray-200 shadow-2xl rounded-sm p-3 flex flex-col gap-2 pointer-events-auto"
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
              <h4 className="font-bold text-sm text-gray-900 leading-snug">
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

              <ul className="flex flex-col gap-1.5 mt-3">
                {takeaways.map((b, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <FaCheck className="text-gray-800 mt-[2px] flex-shrink-0 w-3 h-3 text-[10px]" />
                    <span className="text-[11px] text-gray-700 leading-snug">{b}</span>
                  </li>
                ))}
              </ul>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full h-8 flex items-center justify-center bg-[#059669] hover:bg-[#047857] text-white font-bold text-[13px] rounded-sm transition-colors"
                >
                  Add to cart
                </button>
                <button
                  type="button"
                  className="w-full h-8 flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-900 font-bold text-[13px] rounded-sm transition-colors"
                >
                  View details
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

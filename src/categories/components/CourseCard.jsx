import React, { useEffect, useMemo, useState, useRef } from "react";
import { FaCheck } from "react-icons/fa";
import { HiMiniStar } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../cart/model/CartContext";
import { emitCartFlyFromElement } from "../../cart";
import { parseINRPriceToPaise } from "../../cart/lib/cartUtils";

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
  const [canHover, setCanHover] = useState(true);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const cardRef = useRef(null);
  const timerRef = useRef(null);
  const addBtnRef = useRef(null);
  const { addItem } = useCart();

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
    emitCartFlyFromElement(addBtnRef.current || cardRef.current, thumbnail, title);
    addItem({
      id,
      title,
      thumbnail,
      unitPricePaise: priceLabel === "Free" ? 0 : parseINRPriceToPaise(priceLabel),
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
      className={`relative border border-gray-200 bg-white rounded-sm cursor-pointer transition-all duration-200 ${isHovered ? "z-[1000]" : "z-0"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        if (!canHover) setMobilePreviewOpen(true);
      }}
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

          {/* Mobile actions */}
          <div className="grid grid-cols-2 gap-2 mt-3 sm:hidden">
            <button
              ref={addBtnRef}
              type="button"
              onClick={handleAddToCart}
              className="w-full h-9 flex items-center justify-center bg-[#059669] hover:bg-[#047857] text-white font-bold text-[13px] rounded-sm transition-colors active:scale-[0.99]"
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMobilePreviewOpen(true);
              }}
              className="w-full h-9 flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-900 font-bold text-[13px] rounded-sm transition-colors active:scale-[0.99]"
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
                  ref={addBtnRef}
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
                  <h4 className="font-extrabold text-[15px] text-gray-900 leading-snug">
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
                  ref={addBtnRef}
                  type="button"
                  onClick={(e) => {
                    handleAddToCart(e);
                    setMobilePreviewOpen(false);
                  }}
                  className="w-full h-10 flex items-center justify-center bg-[#059669] hover:bg-[#047857] text-white font-bold text-[13px] rounded-lg transition-colors"
                >
                  Add to cart
                </button>
                <button
                  type="button"
                  onClick={() => setMobilePreviewOpen(false)}
                  className="w-full h-10 flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-900 font-bold text-[13px] rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

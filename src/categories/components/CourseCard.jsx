import React, { useMemo } from "react";
import { FaStar, FaHeart, FaShoppingCart, FaCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../cart/model/CartContext";

export const TAB_COURSES = {
  "Most Popular": [
    {
      id: 901,
      thumbnail: null,
      category: "Development",
      title: "React + Node Mastery (2026)",
      rating: 4.8,
      ratingCount: 15200,
      instructorName: "Colt Steele",
      price: 19.99,
      originalPrice: 129.99,
      badge: "Bestseller",
      totalHours: 45,
      level: "Beginner",
      priceType: "Paid",
      topic: "Development",
      popularity: 15200,
      dateAdded: "2026-05-01",
    },
    {
      id: 902,
      thumbnail: null,
      category: "Business",
      title: "Business Strategy Foundations",
      rating: 4.7,
      ratingCount: 8400,
      instructorName: "Sarah Jenkins",
      price: 14.99,
      originalPrice: 89.99,
      badge: "Highest Rated",
      totalHours: 18,
      level: "Intermediate",
      priceType: "Paid",
      topic: "Business Strategy",
      popularity: 8400,
      dateAdded: "2026-03-10",
    },
    {
      id: 903,
      thumbnail: null,
      category: "Design",
      title: "Design Systems in Figma",
      rating: 4.9,
      ratingCount: 6800,
      instructorName: "Femke van Schoonhoven",
      price: 24.99,
      originalPrice: 119.99,
      badge: "Highest Rated",
      totalHours: 20,
      level: "Intermediate",
      priceType: "Paid",
      topic: "Design",
      popularity: 6800,
      dateAdded: "2026-04-05",
    },
    {
      id: 904,
      thumbnail: null,
      category: "Finance",
      title: "Finance Essentials for Professionals",
      rating: 4.6,
      ratingCount: 3900,
      instructorName: "James Wilson",
      price: 17.99,
      originalPrice: 99.99,
      badge: undefined,
      totalHours: 22,
      level: "Beginner",
      priceType: "Paid",
      topic: "Finance",
      popularity: 3900,
      dateAdded: "2026-02-12",
    },
  ],
  New: [
    {
      id: 905,
      thumbnail: null,
      category: "Marketing",
      title: "Growth Marketing Playbook 2026",
      rating: 4.9,
      ratingCount: 4200,
      instructorName: "Alex Thorne",
      price: 15.99,
      originalPrice: 89.99,
      badge: "Highest Rated",
      totalHours: 14,
      level: "Intermediate",
      priceType: "Paid",
      topic: "Marketing",
      popularity: 4200,
      dateAdded: "2026-03-01",
    },
    {
      id: 906,
      thumbnail: null,
      category: "Finance",
      title: "Global Economic Outlook 2026",
      rating: 4.8,
      ratingCount: 150,
      instructorName: "Patricia Meyer",
      price: 0,
      originalPrice: null,
      badge: "New",
      totalHours: 8,
      level: "Beginner",
      priceType: "Free",
      topic: "Finance",
      popularity: 150,
      dateAdded: "2026-02-20",
    },
    {
      id: 907,
      thumbnail: null,
      category: "Data Science",
      title: "Data Analytics for Executives",
      rating: 4.9,
      ratingCount: 2100,
      instructorName: "Dr. Michael Ross",
      price: 29.99,
      originalPrice: 159.99,
      badge: "Highest Rated",
      totalHours: 30,
      level: "Executive",
      priceType: "Paid",
      topic: "Data Science",
      popularity: 2100,
      dateAdded: "2025-11-15",
    },
    {
      id: 908,
      thumbnail: null,
      category: "Business",
      title: "Leadership in the Digital Age",
      rating: 4.7,
      ratingCount: 3400,
      instructorName: "Elena Rodriguez",
      price: 21.99,
      originalPrice: 149.99,
      badge: "Bestseller",
      totalHours: 18,
      level: "Intermediate",
      priceType: "Paid",
      topic: "Business Strategy",
      popularity: 3400,
      dateAdded: "2025-12-05",
    },
  ],
  Trending: [
    {
      id: 909,
      thumbnail: null,
      category: "Development",
      title: "Complete Python Masterclass for 2026",
      rating: 4.8,
      ratingCount: 22400,
      instructorName: "Jose Portilla",
      price: 13.99,
      originalPrice: 89.99,
      badge: "Bestseller",
      totalHours: 42,
      level: "Beginner",
      priceType: "Paid",
      topic: "Development",
      popularity: 22400,
      dateAdded: "2026-04-15",
    },
    {
      id: 910,
      thumbnail: null,
      category: "Development",
      title: "Full-Stack Web Development: The 2026 Edition",
      rating: 4.7,
      ratingCount: 15200,
      instructorName: "Colt Steele",
      price: 14.99,
      originalPrice: 84.99,
      badge: "Bestseller",
      totalHours: 65,
      level: "Beginner",
      priceType: "Paid",
      topic: "Development",
      popularity: 15200,
      dateAdded: "2026-05-01",
    },
    {
      id: 911,
      thumbnail: null,
      category: "Design",
      title: "Design Systems with Figma – Pro Edition",
      rating: 4.9,
      ratingCount: 6800,
      instructorName: "Femke van Schoonhoven",
      price: 69.99,
      originalPrice: 179.99,
      badge: "Highest Rated",
      totalHours: 20,
      level: "Intermediate",
      priceType: "Paid",
      topic: "Design",
      popularity: 6800,
      dateAdded: "2026-04-05",
    },
    {
      id: 912,
      thumbnail: null,
      category: "Business",
      title: "Advanced Corporate Strategy & Planning",
      rating: 4.8,
      ratingCount: 1240,
      instructorName: "Sarah Jenkins",
      price: 79.99,
      originalPrice: 189.99,
      badge: "Bestseller",
      totalHours: 22,
      level: "Advanced",
      priceType: "Paid",
      topic: "Business Strategy",
      popularity: 1240,
      dateAdded: "2025-10-01",
    },
  ],
};

const StarRow = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <FaStar
        key={s}
        className={`text-[11px] ${s <= Math.round(rating) ? "text-[#b4690e]" : "text-gray-200"}`}
      />
    ))}
  </div>
);

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
  description
}) {
  const [isHovered, setIsHovered] = React.useState(false);
  const { addItem } = useCart();

  const priceLabel = useMemo(() => {
    if (price === 0) return "Free";
    if (typeof price === "number") return `₹${(price * 80).toFixed(0)}`; // Mocking INR as per screenshot
    return String(price ?? "");
  }, [price]);

  const originalLabel = useMemo(() => {
    if (!originalPrice) return null;
    if (typeof originalPrice === "number") return `₹${(originalPrice * 80).toFixed(0)}`;
    return String(originalPrice);
  }, [originalPrice]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id,
      title,
      thumbnail,
      unitPricePaise: Math.round(price * 100),
      qty: 1
    });
  };

  // Mock takeaways based on title/category
  const takeaways = [
    "Master the core concepts and industry-standard tools.",
    "Build real-world projects for your professional portfolio.",
    "Learn advanced techniques from industry-leading experts.",
    "Get full lifetime access and certificate of completion."
  ];

  return (
    <div 
      className="relative z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Main List Card (Minimal) ── */}
      <div className="flex flex-col cursor-pointer transition-all duration-300">
        <div className="aspect-video w-full rounded-sm overflow-hidden mb-2 border border-gray-100">
          {thumbnail ? (
            <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-teal-500" />
          )}
        </div>
        <div className="space-y-1">
          <h3 className={`text-[14px] font-bold text-gray-900 leading-tight line-clamp-2 transition-colors ${isHovered ? 'text-[#004d3d]' : ''}`}>
            {title}
          </h3>
          <p className="text-[11px] text-gray-500 line-clamp-1">{instructorName}</p>
          <div className="flex items-center gap-1">
            <span className="text-[#b4690e] text-[13px] font-bold">{rating}</span>
            <StarRow rating={rating} />
            <span className="text-[11px] text-gray-400">({ratingCount.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[15px] font-black text-gray-900">{priceLabel}</span>
            {originalLabel && (
              <span className="text-[12px] text-gray-400 line-through">{originalLabel}</span>
            )}
          </div>
          {badge && (
            <div className="pt-1">
              <span className="bg-[#eceb98] text-[#3d3c0a] text-[10px] font-bold px-2 py-0.5 rounded-sm">
                {badge}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Udemy-style Preview Popover ── */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-[-20px] left-[105%] w-[330px] bg-white border border-gray-200 shadow-2xl z-[100] p-6 hidden lg:block rounded-sm pointer-events-auto"
          >
            {/* Popover Arrow */}
            <div className="absolute top-10 left-[-10px] w-5 h-5 bg-white border-l border-b border-gray-200 rotate-45" />

            <div className="relative z-10 space-y-4">
              <h2 className="text-[18px] font-extrabold text-gray-900 leading-tight">
                {title}
              </h2>

              <div className="flex items-center gap-2">
                {badge && (
                  <span className="bg-[#eceb98] text-[#3d3c0a] text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-tighter">
                    {badge}
                  </span>
                )}
                <span className="text-[#004d3d] text-[11px] font-bold">
                  Updated <span className="font-extrabold">April 2026</span>
                </span>
              </div>

              <div className="text-[11px] text-gray-500 font-medium flex items-center gap-3">
                <span>{totalHours || 25.5} total hours</span>
                <span>•</span>
                <span>{level || 'All Levels'}</span>
                <span>•</span>
                <span>Subtitles</span>
              </div>

              <p className="text-[13px] text-gray-700 leading-snug line-clamp-3 font-medium">
                {description || "Master these skills with real-world projects and expert guidance. This course is designed to take you from beginner to advanced level in record time."}
              </p>

              <ul className="space-y-2 py-1">
                {takeaways.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[12px] text-gray-600">
                    <FaCheck className="mt-0.5 flex-shrink-0 text-gray-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-4 pt-2">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 h-12 bg-[#004d3d] hover:bg-[#00392d] text-white font-bold rounded-sm transition-colors flex items-center justify-center gap-2 text-[14px]"
                >
                  <FaShoppingCart /> Add to cart
                </button>
                <button className="w-12 h-12 border-2 border-gray-900 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <FaHeart className="text-[18px] text-gray-900" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


import React, { useRef } from "react";
import {
  FaCode,
  FaBriefcase,
  FaPalette,
  FaServer,
  FaChartLine,
  FaCamera,
  FaBrain,
  FaMusic,
} from "react-icons/fa";
import { motion } from "framer-motion";

const CATEGORIES = [
  { label: "Development", Icon: FaCode, color: "bg-blue-50   text-blue-600   border-blue-200" },
  { label: "Business", Icon: FaBriefcase, color: "bg-amber-50  text-amber-600  border-amber-200" },
  { label: "Design", Icon: FaPalette, color: "bg-pink-50   text-pink-600   border-pink-200" },
  { label: "IT & Software", Icon: FaServer, color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  { label: "Finance", Icon: FaChartLine, color: "bg-green-50  text-green-700  border-green-200" },
  { label: "Photography", Icon: FaCamera, color: "bg-orange-50 text-orange-600 border-orange-200" },
  { label: "Data Science", Icon: FaBrain, color: "bg-purple-50 text-purple-600 border-purple-200" },
  { label: "Music", Icon: FaMusic, color: "bg-red-50    text-red-500    border-red-200" },
];

const CategoryCarousel = ({ activeCategory, onSelect }) => {
  const scrollRef = useRef(null);

  return (
    <div className="mb-8">
      <h2 className="text-[17px] font-bold text-gray-900 mb-4">Top Categories</h2>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {CATEGORIES.map(({ label, Icon, color }, i) => {
          const isActive = activeCategory === label;
          return (
            <motion.button
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(isActive ? null : label)}
              className={`flex-shrink-0 flex flex-col items-center gap-2 px-5 py-3.5 rounded-xl border-2 transition-all duration-200 min-w-[110px] snap-start
                ${isActive ? "border-[#004d3d] bg-[#004d3d] text-white shadow-md" : `${color} hover:shadow-sm`}`}
            >
              <Icon className={`text-xl ${isActive ? "text-white" : ""}`} />
              <span className={`text-[12px] font-semibold whitespace-nowrap ${isActive ? "text-white" : ""}`}>
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryCarousel;

import React, { useRef } from "react";
import { FaChevronLeft, FaChevronRight, FaStar } from "react-icons/fa";
import { motion } from "framer-motion";

const INSTRUCTORS = [
  { id: 1, name: "Dr. Angela Yu", title: "Lead Instructor, App Brewery", rating: 4.8, students: "1.8M", courses: 12, initials: "AY", color: "bg-rose-500" },
  { id: 2, name: "Maximilian Schwarzmüller", title: "Professional Web Developer & Trainer", rating: 4.7, students: "2.9M", courses: 42, initials: "MS", color: "bg-blue-600" },
  { id: 3, name: "Colt Steele", title: "Bootcamp Instructor & Engineer", rating: 4.7, students: "1.4M", courses: 10, initials: "CS", color: "bg-indigo-500" },
  { id: 4, name: "Jose Portilla", title: "Data Scientist & Python Expert", rating: 4.6, students: "1.6M", courses: 20, initials: "JP", color: "bg-emerald-600" },
  { id: 5, name: "Stephane Maarek", title: "AWS & Kafka Solutions Architect", rating: 4.7, students: "2.1M", courses: 18, initials: "SM", color: "bg-amber-500" },
  { id: 6, name: "Andrei Neagoie", title: "Senior Software Developer", rating: 4.6, students: "940K", courses: 15, initials: "AN", color: "bg-purple-600" },
];

const TopInstructors = () => {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[17px] font-bold text-gray-900">Top Instructors</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll(-1)}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
            aria-label="Scroll left"
          >
            <FaChevronLeft className="text-xs text-gray-600" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
            aria-label="Scroll right"
          >
            <FaChevronRight className="text-xs text-gray-600" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {INSTRUCTORS.map(({ id, name, title, rating, students, courses, initials, color }, i) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="flex-shrink-0 w-56 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer group"
          >
            <div className={`${color} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base mb-3 group-hover:scale-105 transition-transform`}>
              {initials}
            </div>

            <h4 className="text-[13px] font-bold text-gray-900 leading-snug mb-0.5 line-clamp-1">{name}</h4>
            <p className="text-[11px] text-gray-500 leading-snug mb-3 line-clamp-2">{title}</p>

            <div className="flex items-center gap-1 mb-1">
              <FaStar className="text-[#f69c08] text-[10px]" />
              <span className="text-[12px] font-bold text-gray-800">{rating}</span>
              <span className="text-[11px] text-gray-400">Instructor Rating</span>
            </div>
            <div className="flex gap-3 text-[11px] text-gray-500">
              <span>
                <span className="font-semibold text-gray-700">{students}</span> students
              </span>
              <span>
                <span className="font-semibold text-gray-700">{courses}</span> courses
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TopInstructors;


import React, { useState } from "react";
import { motion } from "framer-motion";
import CourseCard from "./CourseCard";
import {
  getTrainerCourses,
  getTrainerLiveClassesByCourse,
} from "../../trainers/model/trainerContentStorage";

const TABS = ["New"];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90, damping: 14 } },
};

const CoursesTabSection = () => {
  const [activeTab, setActiveTab] = useState("Most Popular");
  const trainerCourses = getTrainerCourses().map((course) => ({
    id: course.id,
    thumbnail: course.thumbnail,
    category: course.tab || "Trainer Courses",
    title: course.title,
    rating: course.rating || 4.8,
    ratingCount: 0,
    instructorName: course.instructor,
    price: Number(String(course.price || "").replace(/[^0-9.]/g, "")) || 499,
    originalPrice: null,
    badge: course.badge || "Live",
    totalHours: course.hours || "Live class",
    level: course.level || "All Levels",
    priceType: "Paid",
    topic: course.tab || "Trainer Courses",
    popularity: 999999,
    dateAdded: course.createdAt || new Date().toISOString(),
    description: course.description,
    takeaways: course.bullets || [],
    createdByTrainer: true,
    liveClass: getTrainerLiveClassesByCourse(course.id)[0] || null,
  }));
  const activeCourses = trainerCourses;

  return (
    <div className="mb-12">

      <div className="flex items-center border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-4 py-3 text-[13px] font-semibold whitespace-nowrap transition-colors
              ${activeTab === tab
                ? 'text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900 after:content-[""]'
                : "text-gray-500 hover:text-gray-800"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {activeCourses.length === 0 ? (
          <div className="sm:col-span-2 xl:col-span-4 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <div className="text-lg font-extrabold text-gray-900">No sessions yet</div>
            <p className="mt-2 text-sm text-gray-500">
              Published expert-led sessions will appear here.
            </p>
          </div>
        ) : (
          activeCourses.map((course) => (
            <motion.div key={course.id} variants={cardVariants} className="h-full">
              <CourseCard {...course} />
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default CoursesTabSection;


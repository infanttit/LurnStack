import React, { useState } from "react";
import { motion } from "framer-motion";
import CourseCard, { TAB_COURSES } from "./CourseCard";

const TABS = ["Most Popular", "New", "Trending"];

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

  return (
    <div className="mb-12">
      <h2 className="text-[17px] font-bold text-gray-900 mb-4">Courses to get you started</h2>

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
        {TAB_COURSES[activeTab].map((course) => (
          <motion.div key={course.id} variants={cardVariants} className="h-full">
            <CourseCard {...course} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default CoursesTabSection;


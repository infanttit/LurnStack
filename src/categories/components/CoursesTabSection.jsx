import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CourseCard from "./CourseCard";
import { getStudentSessions } from "../../courses/api/studentSessionsApi";
import { getAllCourses } from "../../courses/data/courseCatalog";
import { useAuth } from "../../auth";

const TABS = ["Most Popular"];

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
  const [activeCourses, setActiveCourses] = useState([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let cancelled = false;
    const guestCourses = () =>
      getAllCourses()
        .slice(0, 8)
        .map((course) => ({
          ...course,
          category: course.category || course.tab || "Popular Courses",
          topic: course.topic || course.tab || "Development",
          instructorName: course.instructorName || course.instructor || "LurnStack Faculty",
          rating: course.rating || 4.7,
          ratingCount: Number(course.ratingCount) || 0,
          price: Number(String(course.price || "").replace(/[^0-9.]/g, "")) || 499,
          priceType: course.priceType || "Paid",
          popularity: course.popularity || 1000,
          dateAdded: course.dateAdded || new Date().toISOString(),
          createdByTrainer: false,
        }));
    const loader = isAuthenticated ? getStudentSessions() : Promise.resolve(guestCourses());
    loader
      .then((sessions) => {
        if (!cancelled) {
          setActiveCourses(
            [...sessions]
              .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
              .slice(0, 8)
          );
        }
      })
      .catch(() => {
        if (!cancelled) setActiveCourses(isAuthenticated ? [] : guestCourses());
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  return (
    <div className="mb-12">

      <div className="flex items-center border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto">
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


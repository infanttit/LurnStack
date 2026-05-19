import React from "react";
import { FaCheck, FaClock, FaStar, FaUsers } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import catImages from "../../assets/Images/categories/categories";

const FALLBACK =
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200";

const FeaturedBanner = ({ course }) => {
  const navigate = useNavigate();
  const featured = course || null;
  const title = featured?.title || "Strategic Mastery: Navigating Global Markets in 2026";
  const category = featured?.category || "Business Strategy";
  const instructor = featured?.instructorName || featured?.instructor || "LurnStack Faculty";
  const description =
    featured?.description ||
    "Master competitive positioning, market entry, and executive decision-making frameworks with real-world case studies.";
  const image = featured?.thumbnail || catImages["featured-masterclass"];
  const duration = featured?.liveClass?.durationMinutes || featured?.totalHours || 60;

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-5 sm:mb-8 flex flex-col md:flex-row group hover:shadow-md transition-shadow duration-300">
      <div className="relative md:w-[42%] min-h-[170px] sm:min-h-[220px] overflow-hidden flex-shrink-0 bg-gray-100">
        <img
          src={image}
          onError={(e) => {
            e.currentTarget.src = FALLBACK;
          }}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/25" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="bg-[#eceb98] text-[#3d3c0a] text-[11px] font-bold px-2 py-0.5 rounded-sm">
            #1 Bestseller
          </span>
          <span className="bg-[#004d3d] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-sm">
            Most Popular
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 text-white text-[11px] font-semibold drop-shadow">
            <FaUsers className="text-[10px]" /> Expert-led
          </span>
          <span className="flex items-center gap-1 text-white text-[11px] font-semibold drop-shadow">
            <FaClock className="text-[10px]" /> {duration} min
          </span>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col justify-between">
        <div>
          <p className="text-[10px] sm:text-[11px] font-bold text-[#004d3d] uppercase tracking-widest mb-2">
            Featured Masterclass · {category}
          </p>
          <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 leading-snug mb-2 sm:mb-3 break-words">
            {title}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-4 sm:mb-5 line-clamp-2 sm:line-clamp-3">
            {description}
          </p>

          <ul className="space-y-2 mb-4 sm:mb-5">
            {[
              `Guided by ${instructor}`,
              "Production-focused live learning session",
              "Join opens 5 minutes before start",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                <div className="mt-0.5 w-4 h-4 flex-shrink-0 bg-[#004d3d] rounded-full flex items-center justify-center">
                  <FaCheck className="text-white text-[8px]" />
                </div>
                <span className="min-w-0 break-words">{item}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 mb-4 sm:mb-5 flex-wrap">
            <span className="text-[#b4690e] text-sm font-bold">{featured?.rating || 4.9}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <FaStar key={s} className="text-[#f69c08] text-xs" />
              ))}
            </div>
            <span className="text-gray-400 text-xs">({featured?.ratingCount || "Live session"})</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1.5">
            <span>Course Demand</span>
            <span className="text-[#004d3d] font-bold">Most popular</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-4 sm:mb-5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "92%" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="h-full bg-[#004d3d] rounded-full"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">
                Session Card
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-gray-900">{featured?.price || "₹499"}</span>
                {featured?.oldPrice ? (
                  <span className="text-sm text-gray-400 line-through font-medium">{featured.oldPrice}</span>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={() => featured?.id && navigate(`/courses/${featured.id}`, { state: { course: featured } })}
              className="flex-shrink-0 bg-[#004d3d] hover:bg-[#00382c] text-white font-bold text-sm px-5 sm:px-7 py-3 rounded-lg transition-colors shadow-md active:scale-95"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedBanner;

import React from "react";
import { FaCheck, FaStar, FaUsers, FaClock } from "react-icons/fa";
import { motion } from "framer-motion";
import catImages from "../../assets/Images/categories/categories";

const FALLBACK =
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200";

const FeaturedBanner = () => (
  <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-8 flex flex-col md:flex-row group hover:shadow-md transition-shadow duration-300">
    <div className="relative md:w-[42%] min-h-[220px] overflow-hidden flex-shrink-0 bg-gray-100">
      <img
        src={catImages["featured-masterclass"]}
        onError={(e) => {
          e.target.src = FALLBACK;
        }}
        alt="Featured Course"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/25" />

      <div className="absolute top-3 left-3 flex gap-2">
        <span className="bg-[#eceb98] text-[#3d3c0a] text-[11px] font-bold px-2 py-0.5 rounded-sm">
          #1 Bestseller
        </span>
        <span className="bg-[#004d3d] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-sm">
          Masterclass
        </span>
      </div>

      <div className="absolute bottom-3 left-3 flex items-center gap-3">
        <span className="flex items-center gap-1 text-white text-[11px] font-semibold drop-shadow">
          <FaUsers className="text-[10px]" /> 24,800+ students
        </span>
        <span className="flex items-center gap-1 text-white text-[11px] font-semibold drop-shadow">
          <FaClock className="text-[10px]" /> 32h content
        </span>
      </div>
    </div>

    <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
      <div>
        <p className="text-[11px] font-bold text-[#004d3d] uppercase tracking-widest mb-2">
          Featured Masterclass · Business Strategy
        </p>
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-snug mb-3">
          Strategic Mastery: Navigating Global Markets in 2026
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-3">
          Master competitive positioning, market entry, and executive decision-making frameworks used by Fortune 500
          leaders. Taught by top CEOs and industry consultants with real-world case studies.
        </p>

        <ul className="space-y-2 mb-5">
          {[
            "Design scalable go-to-market architectures",
            "Advanced risk assessment & mitigation frameworks",
            "Live Q&A sessions with industry veterans",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
              <div className="mt-0.5 w-4 h-4 flex-shrink-0 bg-[#004d3d] rounded-full flex items-center justify-center">
                <FaCheck className="text-white text-[8px]" />
              </div>
              {item}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 mb-5">
          <span className="text-[#b4690e] text-sm font-bold">4.9</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <FaStar key={s} className="text-[#f69c08] text-xs" />
            ))}
          </div>
          <span className="text-gray-400 text-xs">(18,420 ratings)</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1.5">
          <span>Course Demand</span>
          <span className="text-[#004d3d] font-bold">92% seats filled</span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "92%" }}
            transition={{ duration: 1.6, ease: "easeOut", delay: 0.4 }}
            className="h-full bg-[#004d3d] rounded-full"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">
              Limited Offer
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-gray-900">$19.99</span>
              <span className="text-sm text-gray-400 line-through font-medium">$199.99</span>
            </div>
          </div>
          <div className="relative">
            <span className="absolute inset-0 rounded-lg bg-[#004d3d] animate-ping opacity-20 pointer-events-none" />
            <button className="relative bg-[#004d3d] hover:bg-[#00382c] text-white font-bold text-sm px-7 py-3 rounded-lg transition-colors shadow-md active:scale-95">
              Enroll Now
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default FeaturedBanner;


import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaCheck, FaStar } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const AccordionItem = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-gray-200 first:border-t-0">
      <button className="w-full flex items-center justify-between py-3.5 text-left" onClick={() => setOpen((o) => !o)}>
        <span className="text-[13px] font-bold text-gray-800 uppercase tracking-wide">{title}</span>
        {open ? (
          <FaChevronUp className="text-gray-400 text-xs flex-shrink-0" />
        ) : (
          <FaChevronDown className="text-gray-400 text-xs flex-shrink-0" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CheckRow = ({ label, checked, onChange, extra }) => (
  <label className="flex items-center gap-2.5 cursor-pointer group py-1">
    <div className="relative flex-shrink-0">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
      <div className="w-4 h-4 border-2 border-gray-400 rounded-sm peer-checked:bg-[#004d3d] peer-checked:border-[#004d3d] transition-colors" />
      <FaCheck className="absolute inset-0 m-auto text-white text-[8px] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
    </div>
    <span className="text-[13px] text-gray-700 group-hover:text-[#004d3d] transition-colors leading-snug">{label}</span>
    {extra && <span className="ml-auto text-[11px] text-gray-400">{extra}</span>}
  </label>
);

const StarRow = ({ rating, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer group py-1">
    <div className="relative flex-shrink-0">
      <input type="radio" name="ratingFilter" className="peer sr-only" checked={checked} onChange={onChange} />
      <div className="w-4 h-4 border-2 border-gray-400 rounded-full peer-checked:border-[#004d3d] peer-checked:border-[6px] transition-all" />
    </div>
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <FaStar key={s} className={`text-[10px] ${s <= rating ? "text-[#f69c08]" : "text-gray-300"}`} />
      ))}
      <span className="text-[12px] text-gray-600 ml-0.5">& up</span>
    </div>
  </label>
);

const FilterSidebar = ({ activeFilters, toggleFilter, onClear }) => {
  const levels = ["Beginner", "Intermediate", "Advanced", "Executive"];
  const prices = ["Free", "Paid", "Subscription"];
  const topics = ["Business Strategy", "Data Science", "Finance", "Design", "Marketing", "Development"];
  const ratings = [4.5, 4.0, 3.5, 3.0];

  const activeCount = activeFilters.length;

  return (
    <aside className="w-full flex-shrink-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold text-gray-900">
          Filters{" "}
          {activeCount > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 bg-[#004d3d] text-white text-[10px] rounded-full font-bold">
              {activeCount}
            </span>
          )}
        </h3>
        {activeCount > 0 && (
          <button onClick={onClear} className="text-[12px] text-[#004d3d] font-semibold hover:underline underline-offset-2">
            Clear all
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200 shadow-sm">
        <div className="px-4">
          <AccordionItem title="Level" defaultOpen>
            {levels.map((l) => (
              <CheckRow key={l} label={l} checked={activeFilters.includes(l)} onChange={() => toggleFilter(l)} />
            ))}
          </AccordionItem>
        </div>

        <div className="px-4">
          <AccordionItem title="Pricing" defaultOpen>
            {prices.map((p) => (
              <CheckRow key={p} label={p} checked={activeFilters.includes(p)} onChange={() => toggleFilter(p)} />
            ))}
          </AccordionItem>
        </div>

        <div className="px-4">
          <AccordionItem title="Topic" defaultOpen={false}>
            {topics.map((t) => (
              <CheckRow key={t} label={t} checked={activeFilters.includes(t)} onChange={() => toggleFilter(t)} />
            ))}
          </AccordionItem>
        </div>

        <div className="px-4">
          <AccordionItem title="Ratings" defaultOpen={false}>
            {ratings.map((r) => (
              <StarRow key={r} rating={r} checked={activeFilters.includes(`rating-${r}`)} onChange={() => toggleFilter(`rating-${r}`)} />
            ))}
          </AccordionItem>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;


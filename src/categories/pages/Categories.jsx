import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiChevronDown, FiSliders } from "react-icons/fi";
import { HiMiniStar } from "react-icons/hi2";
import { motion } from "framer-motion";

import catImages from "../../assets/Images/categories/categories";
import { useAuth } from "../../auth";
import { getPublicSessions, getStudentSessions } from "../../courses/api/studentSessionsApi";
import useOfferCampaignClick from "../../courses/hooks/useOfferCampaignClick";

const SORT_OPTIONS = [
  "Most Popular",
  "Highest Rated",
  "Newest",
  "Price: Low to High",
  "Price: High to Low",
];

const ALL_LEVELS = "Any Level";
const PRICE_OPTIONS = ["All Prices", "Free", "Paid"];

const CATEGORY_IMAGES = [
  catImages["popular-webdev"],
  catImages["data-analytics"],
  catImages["advanced-strategy"],
  catImages["global-economic"],
  catImages["design-systems"],
  catImages["leadership-digital"],
];

function normalizeText(value) {
  return String(value || "").trim();
}

function slugify(value) {
  return normalizeText(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getPriceAmount(course) {
  const amountPaise = Number(course.amountPaise ?? course.amount_paise ?? 0);
  if (Number.isFinite(amountPaise) && amountPaise > 0) {
    return amountPaise >= 100 ? amountPaise / 100 : amountPaise;
  }
  if (Number.isFinite(Number(course.price))) return Number(course.price);
  const parsed = Number(String(course.price || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function hasPositivePrice(course) {
  const amountPaise = Number(course.amountPaise ?? course.amount_paise ?? 0);
  if (Number.isFinite(amountPaise) && amountPaise > 0) return true;
  const numericPrice = Number(course.price);
  if (Number.isFinite(numericPrice) && numericPrice > 0) return true;
  const parsed = Number(String(course.price || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) && parsed > 0;
}

function formatPrice(course) {
  const amountPaise = Number(course.amountPaise || 0);
  if (amountPaise > 0) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: amountPaise % 100 === 0 ? 0 : 2,
    }).format(amountPaise / 100);
  }
  if (typeof course.price === "string" && course.price.trim()) {
    return course.price.replace(/â‚¹/g, "Rs.");
  }
  const amount = getPriceAmount(course);
  return amount > 0 ? `Rs.${amount.toLocaleString("en-IN")}` : "Free";
}

function normalizeCourse(course, index) {
  const category = normalizeText(course.category || course.topic || course.tab || "Popular Courses");
  const title = normalizeText(course.title || course.courseTitle || course.classTitle || "Learning session");
  const instructor = normalizeText(
    course.instructorName || course.instructor || course.trainerName || "LurnStack Faculty"
  );
  const level = normalizeText(course.level || "All Levels");
  const priceAmount = getPriceAmount(course);
  const explicitPriceType = normalizeText(course.priceType);
  const priceLabel = formatPrice(course);
  const hasPaidAmount = hasPositivePrice(course);
  const backendIsFree =
    course.isFree === true ||
    course.is_free === true ||
    String(course.pricingState || course.pricing_state || "").trim().toUpperCase() === "FREE";
  const isFree =
    backendIsFree ||
    (!hasPaidAmount &&
      (explicitPriceType.toLowerCase() === "free" || priceLabel.toLowerCase() === "free"));

  return {
    ...course,
    id: course.id || course.sessionId || `${slugify(title)}-${index}`,
    category,
    title,
    instructor,
    level,
    rating: Number(course.rating || 4.7),
    ratingCount: course.ratingCount || "Live session",
    priceLabel,
    priceAmount,
    isFree,
    priceType: isFree ? "Free" : "Paid",
    popularity: Number(course.popularity || course.ratingCount || 1000) || 1000,
    dateAdded: course.dateAdded || course.updated || course.scheduledAt || new Date().toISOString(),
    thumbnail: course.thumbnail || "",
    fallbackImage: categoryImage(index),
    thumbnailBg: course.thumbnailBg || "from-emerald-950 via-teal-800 to-cyan-600",
  };
}

function buildCategories(courses) {
  return [...new Set(courses.map((course) => course.category).filter(Boolean))];
}

function categoryImage(index) {
  return CATEGORY_IMAGES[index % CATEGORY_IMAGES.length];
}

function CategoryTile({ category, image, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group w-[150px] sm:w-[180px] shrink-0 text-left",
        active ? "opacity-100" : "opacity-80 hover:opacity-100",
      ].join(" ")}
    >
      <div
        className={[
          "relative h-[118px] overflow-hidden bg-gray-100 transition-all",
          active ? "ring-2 ring-gray-950" : "ring-1 ring-gray-100 group-hover:ring-gray-300",
        ].join(" ")}
      >
        <img src={image} alt={category} className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/90 to-transparent" />
      </div>
      <div className="mt-3 text-sm font-extrabold text-gray-950 line-clamp-1">
        {category}
      </div>
    </button>
  );
}

function StarRating({ rating }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <HiMiniStar
          key={star}
          className={star <= Math.round(rating) ? "text-[#f69c08]" : "text-gray-300"}
        />
      ))}
    </span>
  );
}

function CourseShelfCard({ course }) {
  const navigate = useNavigate();
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = !imageFailed && course.thumbnail ? course.thumbnail : course.fallbackImage;
  const liveClass = course.liveClass || null;
  const duration = liveClass?.durationMinutes || course.totalHours || "";

  return (
    <motion.button
      type="button"
      onClick={() => navigate(`/courses/${encodeURIComponent(String(course.id))}`, { state: { course } })}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.25 }}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-md border border-gray-200 bg-white text-left transition-all duration-200 hover:border-emerald-200 hover:shadow-md"
    >
      <div className="relative aspect-[16/7] w-full overflow-hidden bg-gray-100">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={course.title}
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className={[
              "flex h-full w-full items-center justify-center bg-gradient-to-br p-4 text-center",
              course.thumbnailBg,
            ].join(" ")}
          >
            <span className="text-xl font-black text-white/25">LurnStack</span>
          </div>
        )}
        <div className="absolute right-2 top-2 overflow-hidden rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-[11px] font-black text-[#00342b] shadow-[0_14px_34px_rgba(3,52,43,0.20)] ring-1 ring-emerald-900/5">
          <span className="relative inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
            {course.priceLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-2.5">
        <h3 className="text-[13px] font-extrabold leading-snug text-gray-900 line-clamp-2">
          {course.title}
        </h3>
        <p className="mt-0.5 truncate text-[11px] text-gray-500">
          {course.instructor}
        </p>

        {liveClass ? (
          <div className="mt-2 rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1.5">
            <div className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-800">
              Live class
            </div>
            <div className="mt-1 truncate text-[11px] font-bold text-gray-800">
              {liveClass.title || course.title}
            </div>
            <div className="mt-1 truncate text-[10px] text-gray-500">
              {duration ? `${duration} min live class` : course.category}
            </div>
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[12px] font-bold text-[#b4690e]">
              {course.rating.toFixed(1)}
            </span>
            <StarRating rating={course.rating} />
            <span className="truncate text-[10px] text-gray-500">
              ({course.ratingCount})
            </span>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-[14px] font-extrabold text-gray-900">
              {course.priceLabel}
            </span>
          </div>
          {course.badge ? (
            <span className="rounded-sm bg-[#eceb98] px-2 py-0.5 text-[10px] font-bold text-[#3d3c0a]">
              {course.badge}
            </span>
          ) : null}
        </div>

        <div className="mt-auto pt-2.5">
          <span className="flex h-8 w-full items-center justify-center rounded-md border border-gray-300 text-[11px] font-extrabold text-gray-900 transition-colors group-hover:bg-gray-50">
            See more
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export default function Categories() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const { categoryId } = useParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [sortBy, setSortBy] = useState("Most Popular");
  const [level, setLevel] = useState(ALL_LEVELS);
  const [priceType, setPriceType] = useState("All Prices");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categories = useMemo(() => buildCategories(courses), [courses]);
  const levelOptions = useMemo(() => {
    const levels = courses
      .map((course) => course.level)
      .filter(Boolean)
      .filter((value) => value !== ALL_LEVELS);
    return [ALL_LEVELS, ...new Set(levels)];
  }, [courses]);

  const requestedCategoryIds = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const ids = String(params.get("ids") || "")
      .split(",")
      .map((id) => decodeURIComponent(id).trim())
      .filter(Boolean);
    if (ids.length) return ids;
    if (categoryId) return [decodeURIComponent(categoryId)];
    const hash = decodeURIComponent((location.hash || "").replace("#", "")).trim();
    return hash ? [hash] : [];
  }, [categoryId, location.hash, location.search]);

  const requestedCategoryKey = requestedCategoryIds.join(",");
  useOfferCampaignClick("category", requestedCategoryKey);

  const requestedCategories = useMemo(() => {
    if (!requestedCategoryIds.length) return [];
    return requestedCategoryIds
      .map((id) =>
        categories.find(
          (category) => slugify(category) === slugify(id) || category === id
        )
      )
      .filter(Boolean);
  }, [categories, requestedCategoryIds]);

  const initialCategory = useMemo(() => {
    if (requestedCategories.length === 1) return requestedCategories[0];
    return "";
  }, [requestedCategories]);
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");

    const loader = isAuthenticated ? getStudentSessions() : getPublicSessions();
    loader
      .then((items) => {
        if (cancelled) return;
        setCourses((items || []).map(normalizeCourse));
      })
      .catch((err) => {
        if (cancelled) return;
        setCourses([]);
        setLoadError(isAuthenticated ? err?.message || "Unable to load sessions." : "");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!categories.length) return;
    setActiveCategory((current) => {
      if (requestedCategoryIds.length && !requestedCategories.length) return "";
      if (requestedCategories.length > 1) return "";
      if (requestedCategories.length === 1) return requestedCategories[0];
      if (current && categories.includes(current)) return current;
      return initialCategory || categories[0];
    });
  }, [categories, initialCategory, requestedCategoryIds.length, requestedCategories]);

  const visibleCourses = useMemo(() => {
    let result = courses.filter((course) => {
      if (requestedCategoryIds.length && !requestedCategories.length) return false;
      const matchesOfferCategories =
        requestedCategories.length > 1
          ? requestedCategories.includes(course.category) || requestedCategories.includes(course.tab)
          : true;
      const matchesCategory =
        requestedCategories.length > 1 ||
        !activeCategory ||
        course.category === activeCategory ||
        course.tab === activeCategory;
      const matchesLevel = level === ALL_LEVELS || course.level === level;
      const matchesPrice = priceType === "All Prices" || course.priceType === priceType;
      return matchesOfferCategories && matchesCategory && matchesLevel && matchesPrice;
    });

    result = [...result];
    if (sortBy === "Most Popular") result.sort((a, b) => b.popularity - a.popularity);
    if (sortBy === "Highest Rated") result.sort((a, b) => b.rating - a.rating);
    if (sortBy === "Newest") result.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    if (sortBy === "Price: Low to High") result.sort((a, b) => a.priceAmount - b.priceAmount);
    if (sortBy === "Price: High to Low") result.sort((a, b) => b.priceAmount - a.priceAmount);
    return result;
  }, [activeCategory, courses, level, priceType, requestedCategoryIds.length, requestedCategories, sortBy]);

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(420px,480px)_minmax(0,1fr)] lg:items-end">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-gray-400">
              Categories
            </p>
            <h1 className="mt-4 max-w-full break-normal text-5xl font-black leading-[0.95] tracking-normal text-gray-950 sm:text-6xl lg:text-6xl">
              {requestedCategories.length > 1 ? "Selected Categories" : activeCategory || "Courses"}
            </h1>
          </div>

          <div className="min-w-0 overflow-hidden">
            <div className="flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((category, index) => (
                <CategoryTile
                  key={category}
                  category={category}
                  image={categoryImage(index)}
                  active={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-5">
          <div className="flex items-center justify-between gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setFiltersOpen((value) => !value)}
                className="inline-flex items-center gap-2 border-b-2 border-gray-950 pb-1 text-sm font-extrabold text-gray-950"
              >
                <FiSliders className="text-base" />
                Filter & Sort
                <FiChevronDown className={filtersOpen ? "rotate-180 transition-transform" : "transition-transform"} />
              </button>

              {filtersOpen ? (
                <div className="absolute left-0 top-full z-30 mt-3 w-[280px] rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
                  <label className="block">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-gray-500">
                      Sort by
                    </span>
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                      className="mt-2 h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm font-bold text-gray-950 outline-none focus:border-gray-950"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="mt-4 block">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-gray-500">
                      Level
                    </span>
                    <select
                      value={level}
                      onChange={(event) => setLevel(event.target.value)}
                      className="mt-2 h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm font-bold text-gray-950 outline-none focus:border-gray-950"
                    >
                      {levelOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="mt-4 block">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-gray-500">
                      Pricing
                    </span>
                    <select
                      value={priceType}
                      onChange={(event) => setPriceType(event.target.value)}
                      className="mt-2 h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm font-bold text-gray-950 outline-none focus:border-gray-950"
                    >
                      {PRICE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : null}
            </div>

            <span className="text-sm font-medium text-gray-500">
              {loading ? "Loading..." : `${visibleCourses.length} Items`}
            </span>
          </div>
        </div>

        {loadError ? (
          <div className="mt-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {loadError}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-x-2 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="animate-pulse">
                <div className="aspect-[4/3] bg-gray-100" />
                <div className="mt-4 h-4 w-3/4 rounded bg-gray-100" />
                <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : visibleCourses.length ? (
          <div className="mt-8 grid grid-cols-1 gap-x-2 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {visibleCourses.map((course) => (
              <CourseShelfCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="mt-8 flex min-h-[280px] flex-col items-center justify-center border border-dashed border-gray-300 bg-gray-50 text-center">
            <h2 className="text-xl font-extrabold text-gray-950">No courses found</h2>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              Try another category or adjust the filter and sort options.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

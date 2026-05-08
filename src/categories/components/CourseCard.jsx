import React, { useMemo } from "react";
import { FaStar } from "react-icons/fa";

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
        className={`text-[10px] ${s <= Math.round(rating) ? "text-[#f69c08]" : "text-gray-300"}`}
      />
    ))}
  </div>
);

export default function CourseCard({
  thumbnail,
  category,
  title,
  rating,
  ratingCount,
  instructorName,
  price,
  originalPrice,
  badge,
}) {
  const priceLabel = useMemo(() => {
    if (price === 0) return "Free";
    if (typeof price === "number") return `$${price.toFixed(2)}`;
    return String(price ?? "");
  }, [price]);

  const originalLabel = useMemo(() => {
    if (!originalPrice) return null;
    if (typeof originalPrice === "number") return `$${originalPrice.toFixed(2)}`;
    return String(originalPrice);
  }, [originalPrice]);

  return (
    <div className="h-full bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200">
      <div className="aspect-video bg-gray-100 overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 via-emerald-800 to-teal-500" />
        )}
      </div>
      <div className="p-3.5 space-y-1.5">
        <div className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">
          {category}
        </div>
        <h3 className="text-[14px] font-extrabold text-gray-900 leading-snug line-clamp-2">
          {title}
        </h3>
        <p className="text-[12px] text-gray-500 line-clamp-1">{instructorName}</p>

        <div className="flex items-center gap-1.5">
          <span className="text-[#b4690e] text-[12px] font-bold">{rating}</span>
          <StarRow rating={rating} />
          <span className="text-[11px] text-gray-400">({ratingCount})</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-extrabold text-gray-900">
              {priceLabel}
            </span>
            {originalLabel && (
              <span className="text-[12px] text-gray-400 line-through font-medium">
                {originalLabel}
              </span>
            )}
          </div>
          {badge && (
            <span className="bg-[#eceb98] text-[#3d3c0a] text-[10px] font-bold px-2 py-0.5 rounded-sm">
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}


import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { HiMiniStar } from "react-icons/hi2";
import { useCart, emitCartFlyFromElement, parseINRPriceToPaise } from "../../cart";
import { TABS, COURSES_BY_TAB } from "../data/courseCatalog";

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <HiMiniStar
          key={s}
          className={`text-sm ${s <= Math.round(rating) ? "text-[#f69c08]" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

function CourseGridCard({ course, onAddToCart, onViewDetails }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col">
      <div className="w-full aspect-[16/9] overflow-hidden bg-gray-100">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${course.thumbnailBg}`} />
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-extrabold text-[15px] text-gray-900 leading-snug line-clamp-2">
          {course.title}
        </h3>
        <p className="mt-1 text-[12px] text-gray-500">{course.instructor}</p>

        <div className="mt-2 flex items-center gap-1.5">
          <span className="font-bold text-[13px] text-[#b4690e]">{course.rating}</span>
          <StarRating rating={course.rating} />
          <span className="text-[11px] text-gray-500">({course.ratingCount})</span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[16px] text-gray-900">{course.price}</span>
            {course.oldPrice && (
              <span className="text-[12px] text-gray-400 line-through">{course.oldPrice}</span>
            )}
          </div>
          {course.badge && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm ${course.badgeColor}`}>
              {course.badge}
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onAddToCart}
            className="h-10 bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-[13px] rounded-md transition-colors"
          >
            Add to cart
          </button>
          <button
            type="button"
            onClick={onViewDetails}
            className="h-10 border border-gray-300 hover:bg-gray-50 text-gray-900 font-extrabold text-[13px] rounded-md transition-colors"
          >
            View details
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const courses = useMemo(() => COURSES_BY_TAB[activeTab] ?? [], [activeTab]);
  const { addItem } = useCart();
  const navigate = useNavigate();

  const addCourseToCart = useCallback(
    (course, fromEl) => {
      addItem({
        id: String(course.id),
        title: course.title,
        instructor: course.instructor,
        thumbnail: course.thumbnail,
        thumbnailBg: course.thumbnailBg,
        unitPricePaise: parseINRPriceToPaise(course.price),
        displayPrice: course.price,
        oldPrice: course.oldPrice || null,
        qty: 1,
      });
      emitCartFlyFromElement(fromEl);
    },
    [addItem]
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-14">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-[32px] sm:text-[38px] font-extrabold text-gray-900">
            Courses
          </h1>
          <p className="mt-2 text-[15px] text-gray-500 max-w-2xl">
            Browse curated courses and open a detailed view for each course.
          </p>
        </div>
      </div>

      <div className="mt-8 border-b border-gray-200 overflow-x-auto no-scrollbar">
        <div className="flex gap-0 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-3 text-[14px] font-medium whitespace-nowrap border-b-2 transition-colors
                ${activeTab === tab
                  ? "border-gray-900 text-gray-900 font-bold"
                  : "border-transparent text-gray-600 hover:text-gray-900"
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course) => (
          <CourseGridCard
            key={course.id}
            course={course}
            onAddToCart={(e) => addCourseToCart(course, e?.currentTarget)}
            onViewDetails={() => navigate(`/courses/${course.id}`, { state: { course } })}
          />
        ))}
      </div>
    </main>
  );
}


import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiClock, FiFilter, FiSearch, FiUsers } from "react-icons/fi";
import { HiMiniStar } from "react-icons/hi2";
import { useCart, emitCartFlyFromElement, parseINRPriceToPaise } from "../../cart";
import { getCourseLiveClasses, getCourseTabs, getCoursesByTab } from "../data/courseCatalog";

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

function formatLiveWhen(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function CourseGridCard({ course, liveClass, onAddToCart, onViewDetails, onJoinClass }) {
  const isTrainerCourse = !!course.createdByTrainer;

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

        {isTrainerCourse && liveClass ? (
          <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800">
              Live class
            </div>
            <div className="mt-1 text-[12px] font-semibold text-gray-700 line-clamp-1">
              {liveClass.title}
            </div>
            <div className="mt-1 text-[11px] text-gray-500">
              {formatLiveWhen(liveClass.scheduledAt)} IST • {liveClass.durationMinutes} min
            </div>
          </div>
        ) : null}

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

        <div className={["mt-4 grid gap-2", isTrainerCourse ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"].join(" ")}>
          <button
            type="button"
            onClick={onAddToCart}
            className="h-10 bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-[13px] rounded-md transition-colors"
          >
            Add card
          </button>
          {isTrainerCourse ? (
            <button
              type="button"
              onClick={onJoinClass}
              className="h-10 bg-[#00342b] hover:bg-[#004d40] text-white font-extrabold text-[13px] rounded-md transition-colors"
            >
              Join
            </button>
          ) : null}
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
  const tabs = useMemo(() => getCourseTabs(), []);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("All");
  const courses = useMemo(() => getCoursesByTab(activeTab), [activeTab]);
  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const now = Date.now();
    return courses.filter((course) => {
      const liveClass = getCourseLiveClasses(course.id)[0];
      const startsAt = new Date(liveClass?.scheduledAt || "").getTime();
      const matchesSearch =
        !q ||
        course.title.toLowerCase().includes(q) ||
        course.instructor.toLowerCase().includes(q) ||
        String(course.description || "").toLowerCase().includes(q);
      const matchesTime =
        timeFilter === "All" ||
        (timeFilter === "Upcoming" && Number.isFinite(startsAt) && startsAt >= now) ||
        (timeFilter === "Today" &&
          Number.isFinite(startsAt) &&
          new Date(startsAt).toDateString() === new Date().toDateString());
      return matchesSearch && matchesTime;
    });
  }, [courses, searchQuery, timeFilter]);
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

  const joinTrainerClass = useCallback((course) => {
    const liveClass = getCourseLiveClasses(course.id)[0];
    if (liveClass?.meetUrl) window.open(liveClass.meetUrl, "_blank", "noopener,noreferrer");
    else navigate(`/courses/${course.id}`, { state: { course } });
  }, [navigate]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
      <section className="rounded-3xl bg-[#00342b] text-white overflow-hidden">
        <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest">
              <FiUsers />
              Flexible learning marketplace
            </div>
            <h1 className="mt-4 text-[32px] sm:text-[44px] font-extrabold leading-tight">
              Upcoming learning sessions
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/70 max-w-2xl">
              Discover scheduled expert-led classes, reserve a card, view the session details, and join when it works for you.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <FiCalendar className="text-xl" />
              <div className="mt-3 text-2xl font-extrabold">{courses.length}</div>
              <div className="text-xs text-white/60 font-semibold">Sessions</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <FiClock className="text-xl" />
              <div className="mt-3 text-2xl font-extrabold">IST</div>
              <div className="text-xs text-white/60 font-semibold">Timezone</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white border border-gray-200 p-4 sm:p-5 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions, skills, or experts..."
              className="w-full h-12 rounded-xl border border-gray-200 pl-11 pr-4 text-sm outline-none focus:border-[#006b58] focus:ring-4 focus:ring-emerald-900/5"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", "Upcoming", "Today"].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setTimeFilter(filter)}
                className={[
                  "h-12 px-4 rounded-xl text-sm font-extrabold inline-flex items-center gap-2 transition-colors",
                  timeFilter === filter
                    ? "bg-[#00342b] text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100",
                ].join(" ")}
              >
                <FiFilter className="text-[15px]" />
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 border-b border-gray-200 overflow-x-auto no-scrollbar">
          <div className="flex gap-0 min-w-max">
            {tabs.map((tab) => (
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
      </section>

      {filteredCourses.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <h2 className="text-xl font-extrabold text-gray-900">No sessions available yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            New expert-led sessions will appear here once they are published.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => (
            <CourseGridCard
              key={course.id}
              course={course}
              liveClass={getCourseLiveClasses(course.id)[0]}
              onAddToCart={(e) => addCourseToCart(course, e?.currentTarget)}
              onViewDetails={() => navigate(`/courses/${course.id}`, { state: { course } })}
              onJoinClass={() => joinTrainerClass(course)}
            />
          ))}
        </div>
      )}
    </main>
  );
}


import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { PATHS } from "../../../app/router/paths";
import { getPublicSessions, getStudentSessions } from "../../../courses/api/studentSessionsApi";

const FALLBACK_CATEGORIES = [
  "Trainer Courses",
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "Web Development",
  "Mobile App Development",
  "Programming",
  "Database",
  "DevOps",
  "Cloud Computing",
  "UI/UX Design",
];

function getSuggestionText(session) {
  return [
    session?.title,
    session?.category,
    session?.instructorName || session?.instructor,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function NavbarSearch({
  value,
  onChange,
  onSubmit,
  placeholder,
  className = "",
  isAuthenticated = false,
  onSuggestionSelect,
}) {
  const navigate = useNavigate();
  const [focused, setFocused] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const closeTimerRef = useRef(null);
  const query = String(value || "").trim().toLowerCase();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const loader = isAuthenticated ? getStudentSessions : getPublicSessions;
    loader()
      .then((items) => {
        if (!cancelled) setSessions(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        if (!cancelled) setSessions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    return sessions
      .filter((session) => session?.id != null && String(session.id).trim() && getSuggestionText(session).includes(query))
      .slice(0, 6);
  }, [query, sessions]);

  const categorySuggestions = useMemo(() => {
    if (query.length < 2) return [];
    const names = new Set(FALLBACK_CATEGORIES);
    sessions.forEach((session) => {
      if (session?.category) names.add(session.category);
    });
    return Array.from(names)
      .filter((category) => category.toLowerCase().includes(query))
      .slice(0, 4);
  }, [query, sessions]);

  const showSuggestions = focused && query.length >= 2;

  const handleBlur = () => {
    closeTimerRef.current = window.setTimeout(() => setFocused(false), 140);
  };

  const handleFocus = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    setFocused(true);
  };

  const openSuggestion = (path, state) => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    setFocused(false);
    onSuggestionSelect?.();
    navigate(path, state ? { state } : undefined);
  };

  return (
    <form onSubmit={onSubmit} className={`${className} relative`} role="search">
      <div className="relative w-full">
        <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        <input
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full h-11 rounded-full bg-gray-50 border border-gray-200 pl-11 pr-4 text-sm text-gray-950 outline-none placeholder:text-gray-400 focus:border-[#004d3d] focus:bg-white focus:ring-4 focus:ring-emerald-900/10 transition-all"
        />
      </div>
      {showSuggestions ? (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[70] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_20px_54px_rgba(15,23,42,0.16)]">
          <div className="max-h-[360px] overflow-y-auto p-2">
            {loading ? (
              <div className="px-4 py-3 text-sm font-semibold text-gray-500">
                Searching sessions...
              </div>
            ) : suggestions.length || categorySuggestions.length ? (
              <>
                {categorySuggestions.length ? (
                  <div className="px-2 pb-1 pt-1">
                    <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Categories
                    </div>
                    {categorySuggestions.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          openSuggestion(`${PATHS.COURSES}?category=${encodeURIComponent(category)}`);
                        }}
                        className="block w-full rounded-xl px-4 py-3 text-left transition-colors hover:bg-emerald-50"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="truncate text-sm font-extrabold text-gray-950">
                            {category}
                          </div>
                          <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-800">
                            Category
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : null}

                {suggestions.length ? (
                  <div className="px-2 pb-1 pt-1">
                    <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Sessions
                    </div>
                    {suggestions.map((session) => (
                      <button
                        key={session.id}
                        type="button"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          openSuggestion(
                            PATHS.COURSE_DETAILS.replace(":courseId", encodeURIComponent(String(session.id))),
                            { course: session }
                          );
                        }}
                        className="block w-full rounded-xl px-4 py-3 text-left transition-colors hover:bg-emerald-50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-extrabold text-gray-950">
                              {session.title || "Live session"}
                            </div>
                            <div className="mt-1 truncate text-xs font-semibold text-gray-500">
                              {[session.category, session.instructorName || session.instructor]
                                .filter(Boolean)
                                .join(" - ") || "LurnStack session"}
                            </div>
                          </div>
                          <span className="shrink-0 rounded-full bg-[#004d3d] px-2.5 py-1 text-[10px] font-black text-white">
                            {session.isFree ? "Free" : session.price || session.priceLabel || "View"}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="px-4 py-3 text-sm font-semibold text-gray-500">
                No matching sessions found. Press Enter to search all courses.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </form>
  );
}

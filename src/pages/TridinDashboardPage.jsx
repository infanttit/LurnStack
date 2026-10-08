import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiCalendar, FiLogOut, FiRefreshCcw, FiSearch, FiShield } from "react-icons/fi";
import { useAuth } from "../auth";
import { axiosClient } from "../shared/api/axiosClient";
import { PATHS } from "../app/router/paths";
import { openMeetingLink, openPendingMeetingWindow } from "../shared/utils/meetingWindow";
import { formatRecurringDays, getSessionOccurrenceTiming, isClassActiveOnDate, isSessionUnavailable } from "../shared/utils/sessionTiming";
import { formatDecimalHours } from "../shared/utils/durationFormatter";
import brandLogo from "../assets/Logo/NewBrandLogo.png";

function getKolkataDateParts(ms) {
  const d = new Date(ms);
  if (isNaN(d.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  return parts.reduce((acc, part) => {
    if (part.type !== "literal") acc[part.type] = part.value;
    return acc;
  }, {});
}

function parseTimeStringToMs(timeStr, dateParts) {
  if (!timeStr || !dateParts) return null;
  const s = String(timeStr).trim().toLowerCase();
  let h = 0;
  let m = 0;

  if (s.includes("pm") || s.includes("am")) {
    const isPm = s.includes("pm");
    const cleaned = s.replace(/am|pm/g, "").trim();
    const parts = cleaned.split(":");
    h = parseInt(parts[0], 10) || 0;
    m = parseInt(parts[1], 10) || 0;
    if (isPm && h < 12) h += 12;
    if (!isPm && h === 12) h = 0;
  } else if (s.includes(":")) {
    const parts = s.split(":");
    h = parseInt(parts[0], 10) || 0;
    m = parseInt(parts[1], 10) || 0;
  } else {
    return null;
  }

  const iso = `${dateParts.year}-${dateParts.month}-${dateParts.day}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00+05:30`;
  const timeMs = new Date(iso).getTime();
  return isNaN(timeMs) ? null : timeMs;
}

function getThumbnailUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const url = rawUrl.trim();
  if (!url || url === "null" || url === "undefined") return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const cleanPath = url.replace(/^\/+/, "");
  return `https://api.lurnstack.com/${cleanPath}`;
}

function getSessionLiveState(session, nowMs = Date.now()) {
  const liveClass = session?.liveClass || session || {};
  const activeToday = isClassActiveOnDate(liveClass, new Date(nowMs));
  const occurrence = getSessionOccurrenceTiming(liveClass, nowMs, { defaultRecurring: false });
  const unavailable = isSessionUnavailable(liveClass);

  let startMs = occurrence?.startMs || 0;
  let endMs = occurrence?.endMs || 0;

  const rawStart = liveClass.startTime || liveClass.start_time || session.startTime || session.start_time || "";
  const rawEnd = liveClass.endTime || liveClass.end_time || session.endTime || session.end_time || "";
  const dateParts = getKolkataDateParts(nowMs);
  const parsedStart = parseTimeStringToMs(rawStart, dateParts);
  let parsedEnd = parseTimeStringToMs(rawEnd, dateParts);

  if (parsedStart) {
    startMs = parsedStart;
    if (!parsedEnd) {
      const duration = Number(liveClass.durationMinutes || session.durationMinutes || 60) * 60 * 1000;
      parsedEnd = startMs + duration;
    }
    endMs = parsedEnd;
  }

  const rawStatus = String(liveClass.status || session.status || "").toLowerCase();
  const isExplicitLive = rawStatus === "live" || rawStatus === "in_progress";

  const isCurrentlyLive = isExplicitLive || (activeToday && startMs > 0 && endMs > 0 && nowMs >= startMs && nowMs <= endMs);
  const isUpcoming = !isCurrentlyLive && activeToday && startMs > 0 && nowMs < startMs;
  const isCompleted = !isExplicitLive && activeToday && endMs > 0 && nowMs > endMs;

  let timerLabel = "Schedule pending";
  if (isCurrentlyLive) {
    timerLabel = "Live now";
  } else if (!activeToday) {
    if (occurrence?.scheduledAt) {
      timerLabel = `Next class scheduled on ${new Date(occurrence.scheduledAt).toLocaleDateString("en-IN", { weekday: "long" })}`;
    } else {
      timerLabel = "Schedule pending";
    }
  } else if (isUpcoming) {
    timerLabel = "Upcoming session today";
  } else if (isCompleted) {
    timerLabel = "Today's session completed";
  }

  const meetUrl =
    session?.meetUrl ||
    session?.liveClass?.meetUrl ||
    session?.meetingLink ||
    session?.meeting_url ||
    "";

  const isOpen = !unavailable && (isCurrentlyLive || (!isCompleted && activeToday && Boolean(meetUrl)));

  return {
    isOpen,
    isCurrentlyLive,
    isUpcoming,
    isCompleted,
    timerLabel,
    meetUrl,
    activeToday,
  };
}

export default function TridinDashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState("all");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const fetchTridinCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosClient.get("/api/tridin/courses");
      const data = res?.data;
      if (data?.success) {
        setCourses(data.courses || []);
      } else {
        setError(data?.message || "Failed to load candidate courses.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unable to fetch candidate portal data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTridinCourses();
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate(PATHS.LOGIN, { replace: true });
  };

  const handleJoinClass = (course) => {
    const state = getSessionLiveState(course, now);
    const meetUrl = state.meetUrl || course?.meetUrl || course?.meetingLink || "";

    if (!meetUrl) {
      alert("Meeting link is not available yet. Please check back closer to session time.");
      return;
    }

    const win = openPendingMeetingWindow();
    const success = openMeetingLink(win, meetUrl);
    if (!success) {
      window.open(meetUrl, "_blank", "noopener,noreferrer");
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const title = String(c.title || c.topic || "").toLowerCase();
      const cat = String(c.category || "").toLowerCase();
      const trainer = String(c.instructorName || c.instructor || "").toLowerCase();
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || title.includes(q) || cat.includes(q) || trainer.includes(q);

      if (!matchesSearch) return false;

      const state = getSessionLiveState(c, now);

      if (filterTab === "live") return state.isOpen || state.isCurrentlyLive;
      if (filterTab === "upcoming") return state.isUpcoming;
      return true;
    });
  }, [courses, search, filterTab, now]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* ── Top Header Navigation ──────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-[#004d3d]">
              <FiShield className="h-4 w-4" />
              <span>Tridin Software</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-medium">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#004d3d] text-white font-bold">
                {user?.fullName ? user.fullName[0].toUpperCase() : "T"}
              </div>
              <span className="font-semibold text-gray-900">{user?.fullName || "Tridin Candidate"}</span>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-all active:scale-95"
            >
              <FiLogOut className="h-4 w-4 text-gray-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ─────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Search & Tabs Toolbar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterTab("all")}
              className={`rounded-lg px-4 py-2 text-xs font-extrabold transition-all whitespace-nowrap ${
                filterTab === "all"
                  ? "bg-[#004d3d] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              All Courses ({courses.length})
            </button>
            <button
              onClick={() => setFilterTab("live")}
              className={`rounded-lg px-4 py-2 text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                filterTab === "live"
                  ? "bg-[#004d3d] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Live Now
            </button>
            <button
              onClick={() => setFilterTab("upcoming")}
              className={`rounded-lg px-4 py-2 text-xs font-extrabold transition-all whitespace-nowrap ${
                filterTab === "upcoming"
                  ? "bg-[#004d3d] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Upcoming
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="What would you like to learn?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-[#004d3d] focus:outline-none focus:ring-1 focus:ring-[#004d3d]"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-80 rounded-md border border-gray-200 bg-white p-4 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-32 w-full rounded bg-gray-200" />
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                </div>
                <div className="h-9 w-full rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center max-w-lg mx-auto my-12">
            <p className="text-sm font-semibold text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchTridinCourses}
              className="inline-flex items-center gap-2 rounded-xl bg-[#004d3d] px-4 py-2 text-xs font-bold text-white hover:bg-[#00392d] transition-all"
            >
              <FiRefreshCcw className="h-4 w-4" /> Retry Loading
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center max-w-md mx-auto my-12 shadow-sm">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-base font-bold text-gray-900 mb-1">No Courses Found</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              {search
                ? "No classes matched your search filter. Try clearing your search query."
                : "No trainer sessions published yet. Check back soon!"}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          /* Courses Grid - Matching LurnStack Courses Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredCourses.map((course) => {
              const liveClass = course.liveClass || course;
              const state = getSessionLiveState(course, now);
              const { isOpen, timerLabel } = state;
              const unavailable = isSessionUnavailable(liveClass);
              const recurringDays = liveClass.recurringDays || liveClass.recurring_days || course.recurringDays;

              const rawThumbnail =
                course.thumbnail ||
                course.thumbnailUrl ||
                course.thumbnail_url ||
                course.coverImage ||
                course.banner ||
                liveClass?.thumbnail ||
                liveClass?.thumbnailUrl ||
                liveClass?.thumbnail_url ||
                "";
              const thumbnailUrl = getThumbnailUrl(rawThumbnail);

              return (
                <article
                  key={course.id}
                  className="bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col"
                >
                  {/* Thumbnail Banner */}
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={course.title || "Course thumbnail"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full bg-gradient-to-br from-[#004d3d] via-teal-800 to-cyan-900 flex items-center justify-center p-3 text-center ${
                        thumbnailUrl ? "hidden" : "flex"
                      }`}
                    >
                      <span className="text-sm font-black text-white/40 uppercase tracking-widest">
                        {course.category || "Tridin Course"}
                      </span>
                    </div>
                    <div className="absolute right-2 top-2 rounded-full border border-white/80 bg-white/95 px-2.5 py-0.5 text-[10px] font-black text-[#004d3d] shadow-sm">
                      <span className="inline-flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Free
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Course Title */}
                      <h3 className="font-extrabold text-[14px] text-gray-900 leading-snug line-clamp-2">
                        {course.title || course.topic || "Untitled Training Session"}
                      </h3>
                      {/* Trainer Name */}
                      <p className="mt-0.5 truncate text-[11px] font-semibold text-gray-500">
                        {course.instructorName || course.instructor || "LurnStack Trainer"}
                      </p>

                      {/* Mint Green Live Class Box (Identical to LurnStack Courses UI) */}
                      <div className="mt-2 rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1.5">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <div className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-800">
                            LIVE CLASS
                          </div>
                          {course.totalHours || course.totalDays ? (
                            <div className="flex items-center gap-1 text-[9px] text-[#006b58] font-extrabold">
                              {course.totalHours !== null && course.totalHours !== undefined && (
                                <span>{formatDecimalHours(course.totalHours)} hr</span>
                              )}
                              {course.totalHours && course.totalDays ? <span>•</span> : null}
                              {course.totalDays !== null && course.totalDays !== undefined && (
                                <span>{course.completedDays || 0}/{course.totalDays} Total Days</span>
                              )}
                            </div>
                          ) : null}
                        </div>

                        <div className="mt-0.5 truncate text-[11px] font-bold text-gray-800">
                          {liveClass.topic || liveClass.title || course.title}
                        </div>

                        <div className="mt-0.5 truncate text-[10px] text-gray-600 flex items-center gap-1 flex-wrap font-medium">
                          <span>IST</span>
                          <span>•</span>
                          <span>{liveClass.durationMinutes || 60} min</span>
                          {recurringDays && (
                            <>
                              <span>•</span>
                              <span className="rounded-full bg-white px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-emerald-800 ring-1 ring-emerald-200">
                                {formatRecurringDays(recurringDays)}
                              </span>
                            </>
                          )}
                          {(liveClass?.recurrenceEndDate || course.recurrenceEndDate) && (
                            <span className="text-[9.5px] text-gray-500">
                              Until: {new Date(liveClass?.recurrenceEndDate || course.recurrenceEndDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </div>

                        <div className="mt-0.5 truncate text-[10px] font-bold text-emerald-800">
                          {timerLabel}
                        </div>

                        <div className="mt-1 flex items-center justify-between pt-1 border-t border-emerald-100">
                          <span className="text-[11px] font-extrabold text-[#004d3d]">Free</span>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                            active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Container */}
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        disabled={unavailable || !isOpen}
                        onClick={() => handleJoinClass(course)}
                        className={`flex-1 inline-flex h-8 items-center justify-center rounded text-[11px] font-extrabold transition-all duration-200 ${
                          isOpen
                            ? "bg-[#004d3d] text-white hover:bg-[#00392d] active:scale-[0.98]"
                            : "bg-slate-200 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        {isOpen ? "Join Class" : "Locked"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleJoinClass(course)}
                        className="inline-flex h-8 items-center justify-center rounded border border-gray-300 bg-white px-3 text-[11px] font-extrabold text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        See more
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

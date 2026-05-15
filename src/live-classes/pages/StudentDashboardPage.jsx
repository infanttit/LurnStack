import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiArrowRight, FiBell, FiClock, FiRefreshCcw } from "react-icons/fi";
import { PATHS } from "../../app/router/paths";
import SmartImage from "../../shared/components/SmartImage";
import LiveClassCard from "../components/LiveClassCard";
import SkeletonCard from "../components/SkeletonCard";
import { fetchDashboardData, joinLiveClass } from "../model/liveClassesSlice";

function EmptyState({ title, body }) {
  return (
    <div className="rounded-2xl bg-surface p-6 text-sm text-on-surface-variant shadow-sm">
      <div className="font-extrabold text-on-surface">{title}</div>
      <div className="mt-1">{body}</div>
    </div>
  );
}

function SectionCard({ title, right, children }) {
  return (
    <div className="rounded-2xl bg-surface overflow-hidden shadow-sm">
      <div className="px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
        <h2 className="text-base sm:text-lg font-extrabold text-on-surface">
          {title}
        </h2>
        {right ? (
          <div className="text-xs font-semibold text-on-surface-variant">{right}</div>
        ) : null}
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

export default function StudentDashboardPage() {
  const dispatch = useDispatch();
  const {
    enrolledCourses,
    upcomingClasses,
    completedClasses,
    joinedByClassId,
    loading,
    error,
    lastUpdatedAt,
  } =
    useSelector((s) => s.liveClasses);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const nextLive = upcomingClasses?.[0] || null;
  const nextWhen = useMemo(() => {
    const start = new Date(nextLive?.scheduledAt || "");
    if (Number.isNaN(start.getTime())) return "";
    return start.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }, [nextLive?.scheduledAt]);

  const notifications = useMemo(() => {
    const items = [];
    if (upcomingClasses?.length) {
      const next = upcomingClasses[0];
      const start = new Date(next?.scheduledAt || "");
      const when = Number.isNaN(start.getTime())
        ? ""
        : start.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            weekday: "short",
            day: "2-digit",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
          });
      items.push({
        id: `next-${next.id}`,
        title: "Next live class",
        body: [next.courseName, next.title, when].filter(Boolean).join(" • "),
      });
    }
    return items;
  }, [upcomingClasses]);

  const handleJoin = async (liveClass) => {
    const classId = liveClass?.id;
    if (!classId) return;
    try {
      const result = await dispatch(joinLiveClass({ classId })).unwrap();
      const meetUrl = result?.meetUrl || liveClass?.meetUrl;
      if (meetUrl) window.open(meetUrl, "_blank", "noopener,noreferrer");
    } catch {
      // Error is displayed via slice state.
    }
  };

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile sm:px-margin-desktop py-10 sm:py-14">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="font-h2 text-h2 text-on-surface">Live classes</h1>
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
            Times shown in IST (Asia/Kolkata). You can join only from 5 minutes before start.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-on-surface-variant">
            Last updated:{" "}
            <span className="text-on-surface">
              {lastUpdatedAt
                ? new Date(lastUpdatedAt).toLocaleTimeString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "—"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => dispatch(fetchDashboardData())}
            disabled={loading}
            className={[
              "h-10 px-5 rounded-xl text-sm font-extrabold transition-colors inline-flex items-center gap-2",
              loading
                ? "bg-surface-variant text-on-surface-variant cursor-not-allowed"
                : "bg-primary text-on-primary hover:bg-primary/90",
            ].join(" ")}
          >
            <FiRefreshCcw className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-8 xl:col-span-9 space-y-8">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          <SectionCard
            title="Upcoming live classes"
            right={loading ? "Loading..." : `${upcomingClasses.length} scheduled`}
          >
            <div className="space-y-4">
              {loading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : upcomingClasses.length === 0 ? (
                <EmptyState
                  title="No upcoming live classes"
                  body="When a class is scheduled, it will appear here."
                />
              ) : (
                upcomingClasses.map((lc) => (
                  <LiveClassCard
                    key={lc.id}
                    liveClass={lc}
                    joined={joinedByClassId[String(lc.id)]}
                    onJoin={handleJoin}
                  />
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="My enrolled courses"
            right={loading ? "Loading..." : `${enrolledCourses.length} courses`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {(loading ? Array.from({ length: 3 }) : enrolledCourses).map((c, idx) => (
                <div
                  key={c?.id || idx}
                  className="rounded-2xl border border-outline-variant bg-surface overflow-hidden hover:shadow-sm transition-shadow"
                >
                  <div className="h-24 bg-surface-variant">
                    <div
                      className={[
                        "w-full h-full bg-gradient-to-br",
                        c?.thumbnailBg || "from-slate-800 to-slate-600",
                      ].join(" ")}
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-extrabold text-on-surface line-clamp-1">
                      {c?.name || "Loading…"}
                    </div>
                    <div className="mt-1 text-xs text-on-surface-variant line-clamp-1">
                      {c?.instructor ? `Instructor: ${c.instructor}` : " "}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {!loading && enrolledCourses.length === 0 ? (
              <div className="mt-4">
                <EmptyState title="No enrolled courses" body="Enroll in a course to see it here." />
              </div>
            ) : null}
          </SectionCard>

          <SectionCard
            title="Completed classes"
            right={loading ? "Loading..." : `${completedClasses.length} classes`}
          >
            <div className="space-y-4">
              {loading ? (
                <SkeletonCard />
              ) : completedClasses.length === 0 ? (
                <EmptyState
                  title="No completed classes"
                  body="Completed classes will show here with recordings/materials."
                />
              ) : (
                completedClasses.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-outline-variant bg-surface p-5">
                    <div className="text-sm font-extrabold text-on-surface line-clamp-1">
                      {c.courseName} • {c.title}
                    </div>
                    <div className="mt-1 text-xs text-on-surface-variant">
                      Instructor: {c.instructorName} • Attendance:{" "}
                      <span className="font-semibold text-on-surface">
                        {c.attendanceStatus || "—"}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-3 flex-wrap text-sm">
                      {c.recordingUrl ? (
                        <a
                          href={c.recordingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-95 transition-opacity"
                        >
                          Recording
                        </a>
                      ) : null}
                      {(c.materials || []).map((m) => (
                        <a
                          key={m.url}
                          href={m.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface text-sm font-semibold hover:bg-surface-container-low transition-colors"
                        >
                          {m.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </section>

        <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
          <div className="rounded-2xl bg-surface p-5 sticky top-24 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-on-surface font-semibold">
                <FiBell className="w-4 h-4 text-primary" />
                Updates
              </div>
              <div className="text-xs font-semibold text-on-surface-variant">
                {loading ? "Loading..." : `${notifications.length} items`}
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {nextLive ? (
                <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-3 hover:bg-surface-container transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-variant flex-shrink-0">
                      <SmartImage
                        src={nextLive?.thumbnail}
                        alt={nextLive?.title || "Next live class"}
                        className="w-full h-full object-cover"
                        fallbackClassName="w-full h-full bg-gradient-to-br from-slate-900 via-emerald-800 to-teal-500"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold text-on-surface-variant truncate">
                        Next live class
                      </div>
                      <div className="mt-1 text-[12px] font-semibold text-on-surface-variant truncate">
                        {nextLive?.courseName || "—"}
                      </div>
                      <div className="mt-0.5 text-[13px] font-extrabold text-on-surface leading-snug line-clamp-2">
                        {nextLive?.title || "—"}
                      </div>
                      {nextWhen ? (
                        <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-on-surface-variant whitespace-nowrap">
                          <FiClock className="text-[13px]" />
                          {nextWhen}
                        </div>
                      ) : null}
                    </div>

                    {nextLive?.id != null ? (
                      <Link
                        to={PATHS.LIVE_CLASS_DETAILS.replace(
                          ":classId",
                          encodeURIComponent(String(nextLive.id))
                        )}
                        className="h-9 px-3 rounded-xl bg-primary text-on-primary text-xs font-extrabold inline-flex items-center gap-1.5 flex-shrink-0 hover:bg-primary/90 transition-colors self-center"
                      >
                        View <FiArrowRight />
                      </Link>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-on-surface-variant">No updates right now.</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

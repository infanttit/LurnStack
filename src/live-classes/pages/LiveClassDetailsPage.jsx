import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiClock, FiVideo } from "react-icons/fi";
import { PATHS } from "../../app/router/paths";
import SmartImage from "../../shared/components/SmartImage";
import useNow from "../hooks/useNow";
import { formatDuration, getLiveTiming } from "../lib/time";
import { fetchLiveClassDetails, joinLiveClass } from "../model/liveClassesSlice";

function formatISTDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "-", time: "-" };
  const date = d.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
  });
  return { date, time };
}

function Card({ children }) {
  return (
    <div className="rounded-2xl bg-surface shadow-sm overflow-hidden">
      {children}
    </div>
  );
}

export default function LiveClassDetailsPage() {
  const { classId = "" } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const now = useNow(1000);

  const {
    detailsById,
    allClasses,
    joinedByClassId,
    detailsLoading,
    detailsError,
    error,
  } = useSelector((s) => s.liveClasses);

  const liveClass = useMemo(() => {
    const key = String(classId || "");
    return detailsById?.[key] || allClasses?.find((x) => String(x?.id) === key) || null;
  }, [allClasses, classId, detailsById]);

  useEffect(() => {
    if (!classId) return;
    dispatch(fetchLiveClassDetails({ classId }));
  }, [classId, dispatch]);

  const joined = joinedByClassId?.[String(classId)];
  const { startMs, endMs } = getLiveTiming(liveClass?.scheduledAt, liveClass?.durationMinutes);
  const joinOpensMs = startMs - 5 * 60 * 1000;
  const isLiveNow = now >= startMs && now <= endMs;
  const isEnded = now > endMs;
  const canJoin = now >= joinOpensMs && now <= endMs;

  const { date, time } = formatISTDateTime(liveClass?.scheduledAt);
  const endsAt = formatISTDateTime(new Date(endMs).toISOString())?.time;

  const handleJoin = async () => {
    if (!classId) return;
    try {
      const result = await dispatch(joinLiveClass({ classId })).unwrap();
      const meetUrl = result?.meetUrl || liveClass?.meetUrl;
      if (meetUrl) window.open(meetUrl, "_blank", "noopener,noreferrer");
    } catch {
      // Error is already stored in redux slice (detailsError/error).
    }
  };

  return (
    <main className="max-w-container-max mx-auto px-margin-desktop py-12">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link
          to={PATHS.LIVE_CLASSES}
          className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface"
        >
          <FiArrowLeft /> Back to live classes
        </Link>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-on-surface-variant hover:text-on-surface"
        >
          Go back
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-8 xl:col-span-9 space-y-6">
          {detailsError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {detailsError}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          <Card>
            <div className="p-6 flex gap-6 flex-col sm:flex-row">
              <div className="w-full sm:w-64 aspect-[16/10] rounded-2xl overflow-hidden bg-surface-variant flex-shrink-0">
                <SmartImage
                  src={liveClass?.thumbnail}
                  alt={liveClass?.title || "Live class"}
                  className="w-full h-full object-cover"
                  fallbackClassName="w-full h-full bg-gradient-to-br from-slate-900 via-emerald-800 to-teal-500"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-on-surface-variant truncate">
                  {detailsLoading && !liveClass ? "Loading..." : liveClass?.courseName || "—"}
                </div>
                <h1 className="mt-1 text-xl sm:text-2xl font-extrabold text-on-surface leading-snug">
                  {detailsLoading && !liveClass ? "Loading..." : liveClass?.title || "Live class"}
                </h1>
                <div className="mt-2 text-sm text-on-surface-variant">
                  Instructor:{" "}
                  <span className="font-semibold text-on-surface">
                    {liveClass?.instructorName || "—"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-on-surface-variant">
                  <span className="inline-flex items-center gap-1.5">
                    <FiCalendar className="text-[16px]" /> {date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <FiClock className="text-[16px]" /> {time}
                    {endsAt ? `–${endsAt}` : ""} IST
                  </span>
                </div>

                <div className="mt-2 text-sm text-on-surface-variant">
                  Duration:{" "}
                  <span className="font-semibold text-on-surface">
                    {liveClass?.durationMinutes ? `${liveClass.durationMinutes} min` : "—"}
                  </span>
                </div>

                {liveClass?.description ? (
                  <p className="mt-4 text-sm text-on-surface-variant leading-relaxed">
                    {liveClass.description}
                  </p>
                ) : null}

                {!isEnded ? (
                  <div className="mt-5 text-sm text-on-surface-variant">
                    {isLiveNow ? (
                      <>
                        Live now{" "}
                        <span className="font-semibold text-on-surface">
                          {endsAt ? `until ${endsAt}` : ""}
                        </span>
                      </>
                    ) : now < joinOpensMs ? (
                      <>
                        Join opens in{" "}
                        <span className="font-extrabold text-on-surface tabular-nums">
                          {formatDuration(Math.max(0, joinOpensMs - now))}
                        </span>{" "}
                        <span className="text-on-surface-variant">(5 min before start)</span>
                      </>
                    ) : (
                      <>
                        Starts in{" "}
                        <span className="font-extrabold text-on-surface tabular-nums">
                          {formatDuration(Math.max(0, startMs - now))}
                        </span>
                      </>
                    )}
                  </div>
                ) : null}

                <div className="mt-5 flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    disabled={!canJoin || !liveClass?.meetUrl}
                    onClick={handleJoin}
                    className={[
                      "h-11 px-6 rounded-xl font-extrabold text-sm inline-flex items-center gap-2 transition-colors",
                      !canJoin || !liveClass?.meetUrl
                        ? "bg-surface-variant text-on-surface-variant cursor-not-allowed"
                        : "bg-primary text-on-primary hover:bg-primary/90",
                    ].join(" ")}
                  >
                    <FiVideo className="text-[18px]" />
                    {isLiveNow ? "Join live" : "Join class"}
                  </button>

                  {joined?.joinedAt ? (
                    <div className="text-sm text-on-surface-variant">
                      Attendance:{" "}
                      <span className="font-semibold text-on-surface">
                        {joined.attendanceStatus || "present"}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </Card>
        </section>

        <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
          <Card>
            <div className="p-5">
              <div className="text-sm font-extrabold text-on-surface">Notes</div>
              <ul className="mt-3 space-y-2 text-sm text-on-surface-variant">
                <li>Times are shown in IST (Asia/Kolkata).</li>
                <li>You can join only from 5 minutes before start.</li>
                <li>Keep your audio/video permissions ready before joining.</li>
              </ul>
            </div>
          </Card>
        </aside>
      </div>
    </main>
  );
}

import { FiCalendar, FiClock, FiVideo } from "react-icons/fi";
import { formatDuration, getLiveTiming } from "../lib/time";
import useNow from "../hooks/useNow";

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

export default function LiveClassCard({ liveClass, joined, onJoin }) {
  const now = useNow(1000);
  const { startMs, endMs } = getLiveTiming(
    liveClass?.scheduledAt,
    liveClass?.durationMinutes
  );

  const joinOpensMs = startMs - 5 * 60 * 1000;
  const isLiveNow = now >= startMs && now <= endMs;
  const isEnded = now > endMs;
  const canJoin = now >= joinOpensMs && now <= endMs;

  const { date, time } = formatISTDateTime(liveClass?.scheduledAt);
  const endsAt = formatISTDateTime(new Date(endMs).toISOString())?.time;
  const countdownMs = Math.max(0, startMs - now);
  const joinCountdownMs = Math.max(0, joinOpensMs - now);

  return (
    <div className="rounded-2xl bg-surface overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5 flex gap-4">
        <div className="w-20 h-16 rounded-lg overflow-hidden bg-surface-variant flex-shrink-0">
          <div
            className={[
              "w-full h-full bg-gradient-to-br",
              liveClass?.courseThumbnailBg ||
                "from-slate-900 via-emerald-800 to-teal-500",
            ].join(" ")}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-on-surface-variant truncate">
                {liveClass?.courseName}
              </div>
              <div className="mt-0.5 text-sm font-extrabold text-on-surface leading-snug line-clamp-1">
                {liveClass?.title}
              </div>
              <div className="mt-1 text-[12px] text-on-surface-variant truncate">
                Instructor: {liveClass?.instructorName}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {isLiveNow ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
                  Live now
                </span>
              ) : isEnded ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-surface-variant text-on-surface-variant">
                  Completed
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-primary/10 text-primary">
                  Upcoming
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-on-surface-variant">
            <span className="inline-flex items-center gap-1.5">
              <FiCalendar className="text-[14px]" /> {date || "-"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FiClock className="text-[14px]" /> {time || "-"}
              {endsAt ? `–${endsAt}` : ""} IST • {liveClass?.durationMinutes || 0} min
            </span>
          </div>

          {!isEnded ? (
            <div className="mt-3 text-[12px] text-on-surface-variant">
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
                    {formatDuration(joinCountdownMs)}
                  </span>
                  <span className="text-on-surface-variant"> (5 min before start)</span>
                </>
              ) : (
                <>
                  Starts in{" "}
                  <span className="font-extrabold text-on-surface tabular-nums">
                    {formatDuration(countdownMs)}
                  </span>
                </>
              )}
            </div>
          ) : null}

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              disabled={!canJoin || !liveClass?.meetUrl}
              onClick={() => onJoin?.(liveClass)}
              className={[
                "h-10 px-5 rounded-xl font-extrabold text-sm inline-flex items-center gap-2 transition-colors",
                !canJoin || !liveClass?.meetUrl
                  ? "bg-surface-variant text-on-surface-variant cursor-not-allowed"
                  : "bg-primary text-on-primary hover:bg-primary/90",
              ].join(" ")}
            >
              <FiVideo className="text-[16px]" />
              {isLiveNow ? "Join live" : "Join"}
            </button>

            {joined?.joinedAt ? (
              <div className="text-[12px] text-on-surface-variant">
                Attendance:{" "}
                <span className="font-semibold text-on-surface">
                  {joined.attendanceStatus || "present"}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

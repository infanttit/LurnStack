import { FiCalendar, FiClock, FiTag, FiVideo } from "react-icons/fi";
import { Link } from "react-router-dom";
import { PATHS } from "../../app/router/paths";
import SmartImage from "../../shared/components/SmartImage";
import { formatDuration } from "../lib/time";
import useNow from "../hooks/useNow";
import { formatAttendanceStatus } from "../../courses/api/studentAttendanceApi";
import { getSessionOccurrenceTiming, isClassActiveOnDate, formatRecurringDays } from "../../shared/utils/sessionTiming";

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
  const occurrence = getSessionOccurrenceTiming(liveClass, now, { defaultRecurring: false });
  const { startMs, endMs } = occurrence;

  const joinOpensMs = startMs - 5 * 60 * 1000;
  const isLiveNow = now >= startMs && now <= endMs;
  const isEnded = now > endMs;
  const pricePending = liveClass?.pricePending || liveClass?.priceInPaise == null;
  const activeToday = isClassActiveOnDate(liveClass, new Date(now));
  const canJoin = !pricePending && now >= joinOpensMs && now <= endMs && activeToday;

  const { date, time } = formatISTDateTime(occurrence.scheduledAt || liveClass?.scheduledAt);
  const endsAt = formatISTDateTime(new Date(endMs).toISOString())?.time;
  const countdownMs = Math.max(0, startMs - now);
  const joinCountdownMs = Math.max(0, joinOpensMs - now);
  const joinedStatus = joined?.attendanceStatus || joined?.status || "";
  const statusClass =
    joinedStatus === "late"
      ? "bg-amber-100 text-amber-800"
      : joinedStatus === "absent"
        ? "bg-red-100 text-red-700"
        : "bg-emerald-100 text-emerald-800";

  return (
    <div className="rounded-2xl bg-surface overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-outline-variant/60">
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
        <div className="w-full h-36 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-surface-variant flex-shrink-0">
          <SmartImage
            src={liveClass?.thumbnail}
            alt={liveClass?.title || "Live class"}
            className="w-full h-full object-cover"
            fallbackClassName={[
              "w-full h-full bg-gradient-to-br",
              liveClass?.courseThumbnailBg || "from-slate-900 via-emerald-800 to-teal-500",
            ].join(" ")}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-on-surface-variant line-clamp-1">
                {liveClass?.courseName}
              </div>
              <div className="mt-0.5 text-base sm:text-[15px] font-extrabold text-on-surface leading-snug line-clamp-2 sm:line-clamp-1">
                {liveClass?.title}
              </div>
              {liveClass?.description ? (
                <div className="mt-1 text-[12px] text-on-surface-variant line-clamp-2 sm:line-clamp-1">
                  {liveClass.description}
                </div>
              ) : null}
              <div className="mt-1 text-[12px] text-on-surface-variant line-clamp-1">
                Instructor: {liveClass?.instructorName}
              </div>
              {occurrence.isRecurring && (liveClass?.recurrenceEndDate || liveClass?.recurrence_end_date || liveClass?.raw?.recurrenceEndDate || liveClass?.raw?.recurrence_end_date) && (
                <div className="mt-1 text-[11px] font-medium text-slate-500 line-clamp-1">
                  Recurring until: {new Date(liveClass?.recurrenceEndDate || liveClass?.recurrence_end_date || liveClass?.raw?.recurrenceEndDate || liveClass?.raw?.recurrence_end_date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
              {pricePending ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800">
                  Price Pending
                </span>
              ) : liveClass?.priceLabel ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-primary/10 text-primary inline-flex items-center gap-1.5">
                  <FiTag className="text-[12px]" />
                  {liveClass.priceLabel}
                </span>
              ) : null}

              {occurrence.isRecurring && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-100">
                  {formatRecurringDays(liveClass?.recurringDays || liveClass?.recurring_days || liveClass?.raw?.recurringDays || liveClass?.raw?.recurring_days)}
                </span>
              )}

              {isLiveNow ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
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

          <div className="mt-3 grid grid-cols-1 sm:flex sm:flex-wrap sm:items-center gap-x-4 gap-y-2 text-[12px] text-on-surface-variant">
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <FiCalendar className="text-[14px]" /> {date || "-"}
            </span>
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <FiClock className="text-[14px]" /> {time || "-"}
              {endsAt ? `-${endsAt}` : ""} IST - {liveClass?.durationMinutes || 0} min
            </span>
            <span
              className={[
                "inline-flex items-center gap-1.5 min-w-0 font-extrabold",
                pricePending ? "text-amber-700" : "text-on-surface",
              ].join(" ")}
            >
              <FiTag className="text-[14px]" />
              {pricePending ? "Coming soon" : liveClass?.priceLabel || "Free"}
            </span>
          </div>

          {pricePending ? (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-semibold text-amber-800">
              Enrollment is not open yet. The admin has not set the price for this class.
            </div>
          ) : !isEnded ? (
            <div className="mt-3 text-[12px] text-on-surface-variant">
              {!activeToday ? (
                <span className="font-bold text-amber-700">
                  Next class scheduled on {new Date(occurrence.scheduledAt).toLocaleDateString("en-IN", { weekday: "long" })}
                </span>
              ) : isLiveNow ? (
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

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="button"
              disabled={!canJoin}
              onClick={() => onJoin?.(liveClass)}
              className={[
                "h-10 w-full sm:w-auto justify-center px-5 rounded-xl font-extrabold text-sm inline-flex items-center gap-2 transition-colors",
                !canJoin
                  ? "bg-surface-variant text-on-surface-variant cursor-not-allowed"
                  : "bg-primary text-on-primary hover:bg-primary/90",
              ].join(" ")}
            >
              <FiVideo className="text-[16px]" />
              {pricePending ? "Price pending" : isLiveNow ? "Join live" : "Join"}
            </button>

            <Link
              to={
                liveClass?.id != null
                  ? PATHS.LIVE_CLASS_DETAILS.replace(
                      ":classId",
                      encodeURIComponent(String(liveClass.id))
                    )
                  : PATHS.LIVE_CLASSES
              }
              className="h-10 w-full sm:w-auto justify-center px-4 rounded-xl border border-outline-variant text-on-surface text-sm font-semibold hover:bg-surface-container-low transition-colors inline-flex items-center"
            >
              Details
            </Link>

            {joined?.joinedAt ? (
              <div className="text-[12px] text-on-surface-variant sm:ml-1">
                Attendance{" "}
                <span className={["ml-1 rounded-full px-2 py-1 text-[11px] font-extrabold", statusClass].join(" ")}>
                  {formatAttendanceStatus(joinedStatus || "present")}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

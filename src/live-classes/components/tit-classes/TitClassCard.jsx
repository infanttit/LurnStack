import React from "react";
import { FiCalendar, FiClock, FiTag, FiVideo } from "react-icons/fi";
import { Info } from "lucide-react";
import SmartImage from "../../../shared/components/SmartImage";
import { getSessionOccurrenceTiming, isClassActiveOnDate, formatRecurringDays } from "../../../shared/utils/sessionTiming";
import { formatDate, formatTime, formatDurationLabel } from "../../utils/formatters";

export function titClassStatusLabel(titClass, now = Date.now()) {
  const backendStatus = String(titClass?.status || "").trim();
  if (backendStatus) return backendStatus.charAt(0).toUpperCase() + backendStatus.slice(1);
  const occurrence = getSessionOccurrenceTiming(titClass, now, { defaultRecurring: false });
  const start = occurrence.startMs;
  const end = occurrence.endMs;
  if (!Number.isFinite(start)) return "Schedule pending";
  if (Number.isFinite(end) && now > end) return "Completed";
  if (Number.isFinite(end) && now >= start && now <= end) return "Live now";
  return "Upcoming";
}

export default function TitClassCard({ titClass, now, onOpenMeeting }) {
  const occurrence = getSessionOccurrenceTiming(titClass, now, { defaultRecurring: false, rollForwardAfterEnd: true });
  const activeToday = isClassActiveOnDate(titClass, new Date(now));
  const status = titClassStatusLabel(titClass, now);
  const meetingLink = titClass?.meetingLink || "";
  const startMs = occurrence.startMs;
  const endMs = occurrence.endMs;
  const joinOpensMs = startMs - 5 * 60 * 1000;
  const canJoin =
    !!meetingLink &&
    Number.isFinite(startMs) &&
    Number.isFinite(endMs) &&
    now >= joinOpensMs &&
    now <= endMs &&
    activeToday;
  const actionLabel = canJoin ? "Join Class" : !activeToday ? "Runs on specific weekdays" : now < joinOpensMs ? "Waiting..." : "Session Ended";

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-md border border-gray-200 bg-white transition-all duration-200 hover:border-emerald-200 hover:shadow-md">
      <div className="relative aspect-[16/6] overflow-hidden bg-gray-100">
        <SmartImage
          src={titClass?.thumbnail}
          alt={titClass?.title || "TIT class"}
          className="h-full w-full object-cover"
          fallbackClassName="h-full w-full bg-gradient-to-br from-slate-900 via-emerald-800 to-teal-500"
        />
        <div className="absolute right-2 top-2 overflow-hidden rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-[11px] font-black text-[#00342b] shadow-[0_14px_34px_rgba(3,52,43,0.20)] ring-1 ring-emerald-900/5 animate-priceFloat">
          <span className="absolute inset-y-0 -left-6 w-5 rotate-12 bg-white/80 blur-[2px] animate-priceShine" />
          <span className="relative inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
            {titClass?.priceLabel || "Free"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-2.5">
        <h3 className="line-clamp-2 text-[13px] font-extrabold leading-snug text-gray-900">
          {titClass?.title || "TIT class"}
        </h3>
        <p className="mt-0.5 truncate text-[11px] text-gray-500">
          {titClass?.instructorName || "LurnStack Trainer"}
        </p>

        <div className="mt-2 rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-800">
              TIT class
            </div>
            {occurrence.isRecurring && (
              <span className="rounded-full bg-white px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-emerald-800 ring-1 ring-emerald-100 animate-fadeIn">
                {formatRecurringDays(titClass?.recurringDays || titClass?.recurring_days || titClass?.raw?.recurringDays || titClass?.raw?.recurring_days)}
              </span>
            )}
          </div>
          <div className="mt-1 truncate text-[11px] font-bold text-gray-800">
            {titClass?.courseName || "Course pending"}
          </div>
          {titClass?.description ? (
            <p className="mt-1 line-clamp-1 text-[10px] leading-4 text-gray-600">
              {titClass.description}
            </p>
          ) : null}
          <div className="mt-2 grid gap-1 text-[10px] font-semibold text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <FiCalendar className="shrink-0" />
              {formatDate(occurrence.scheduledAt || titClass?.scheduledAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FiClock className="shrink-0" />
              {formatTime(occurrence.scheduledAt || titClass?.scheduledAt)} - {formatTime(occurrence.endsAt || titClass?.endsAt)} IST
            </span>
            <span>{formatDurationLabel(titClass?.durationMinutes)}</span>
            {occurrence.isRecurring && (titClass?.recurrenceEndDate || titClass?.recurrence_end_date || titClass?.raw?.recurrenceEndDate || titClass?.raw?.recurrence_end_date) && (
              <span className="text-slate-500 font-medium">
                Recurring until: {new Date(titClass?.recurrenceEndDate || titClass?.recurrence_end_date || titClass?.raw?.recurrenceEndDate || titClass?.raw?.recurrence_end_date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
            {occurrence.isRecurring && !activeToday && (
              <span className="text-amber-700 font-bold block mt-1">
                Next class scheduled on {new Date(occurrence.scheduledAt).toLocaleDateString("en-IN", { weekday: "long" })}
              </span>
            )}
          </div>
          <div className="mt-2 truncate text-[10px] font-bold text-emerald-800">
            {status}
          </div>
        </div>

        {titClass?.trainerInstructions && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50/50 p-2.5 text-xs text-blue-800">
            <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
            <p className="leading-normal">{titClass.trainerInstructions}</p>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-[14px] font-extrabold text-gray-900">
            <FiTag className="text-[13px]" />
            {titClass?.priceLabel || "Free"}
          </span>
          <span className="rounded-sm bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
            {status}
          </span>
        </div>

        <div className="mt-auto pt-2.5">
          <button
            type="button"
            disabled={!canJoin}
            onClick={() => onOpenMeeting?.(meetingLink)}
            className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-[#00342b] px-3 text-[11px] font-extrabold text-white transition-colors hover:bg-[#004d40] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiVideo className="text-[13px]" />
            {actionLabel}
          </button>
        </div>
      </div>
    </article>
  );
}

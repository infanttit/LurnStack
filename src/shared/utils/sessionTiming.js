import { getLiveTiming, toMs } from "../../live-classes/lib/time";

function getKolkataParts(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  return parts.reduce((acc, part) => {
    if (part.type !== "literal") acc[part.type] = part.value;
    return acc;
  }, {});
}

function kolkataIsoFromParts(dateParts, timeParts) {
  if (!dateParts || !timeParts) return "";
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}T${timeParts.hour}:${timeParts.minute}:${timeParts.second || "00"}+05:30`;
}

function flagValue(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return null;
  if (["false", "0", "no", "none"].includes(raw)) return false;
  if (["true", "1", "yes", "daily", "recurring"].includes(raw)) return true;
  return null;
}

export function isSessionUnavailable(liveClass) {
  const raw = liveClass?.raw || {};
  const status = String(liveClass?.status || raw?.status || "").trim().toLowerCase();
  return ["cancelled", "canceled", "paused", "ended", "inactive", "archived"].includes(status);
}

export function isDailyRecurringSession(liveClass, { defaultRecurring = false } = {}) {
  const raw = liveClass?.raw || {};
  if (isSessionUnavailable(liveClass)) return false;

  const explicitRecurring = flagValue(
    liveClass?.isRecurring ??
      liveClass?.recurring ??
      liveClass?.is_recurring ??
      raw?.isRecurring ??
      raw?.recurring ??
      raw?.is_recurring
  );
  if (explicitRecurring !== null) return explicitRecurring;

  const recurrenceType = String(
    liveClass?.recurrenceType ||
      liveClass?.recurrence_type ||
      liveClass?.repeatType ||
      raw?.recurrenceType ||
      raw?.recurrence_type ||
      raw?.repeatType ||
      ""
  ).trim().toLowerCase();

  if (recurrenceType) {
    return ["daily", "everyday", "every_day"].includes(recurrenceType);
  }

  return defaultRecurring;
}

export function getSessionOccurrenceTiming(liveClass, now = Date.now(), options = {}) {
  const scheduledAt = liveClass?.scheduledAt;
  const durationMinutes = liveClass?.durationMinutes || 60;
  const endsAt = liveClass?.endsAt || "";
  const base = getLiveTiming(scheduledAt, durationMinutes, endsAt);

  if (!isDailyRecurringSession(liveClass, options)) {
    return {
      ...base,
      scheduledAt,
      endsAt,
      isRecurring: false,
    };
  }

  const todayParts = getKolkataParts(now);
  const startTimeParts = getKolkataParts(scheduledAt);
  if (!todayParts || !startTimeParts) {
    return {
      ...base,
      scheduledAt,
      endsAt,
      isRecurring: true,
    };
  }

  const occurrenceScheduledAt = kolkataIsoFromParts(todayParts, startTimeParts);
  const occurrenceStartMs = toMs(occurrenceScheduledAt);
  const endTimeParts = endsAt ? getKolkataParts(endsAt) : null;
  const occurrenceEndsAt = endTimeParts ? kolkataIsoFromParts(todayParts, endTimeParts) : "";
  const explicitOccurrenceEndMs = toMs(occurrenceEndsAt);
  const durationEndMs = occurrenceStartMs + Number(durationMinutes || 0) * 60 * 1000;
  const occurrenceEndMs =
    explicitOccurrenceEndMs > occurrenceStartMs ? explicitOccurrenceEndMs : durationEndMs;

  return {
    startMs: occurrenceStartMs,
    endMs: occurrenceEndMs,
    scheduledAt: occurrenceScheduledAt,
    endsAt: new Date(occurrenceEndMs).toISOString(),
    isRecurring: true,
  };
}

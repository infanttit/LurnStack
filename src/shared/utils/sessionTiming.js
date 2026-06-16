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

const WEEKDAY_MAP = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6
};

export function parseRecurringDays(value) {
  if (value === null || value === undefined) return null;

  const toDayNum = (val) => {
    const s = String(val).trim().toLowerCase();
    if (s in WEEKDAY_MAP) return WEEKDAY_MAP[s];
    const n = Number(s);
    return isNaN(n) ? null : n;
  };

  const clean = (arr) => {
    const res = arr.map(toDayNum).filter(x => x !== null);
    return res.length > 0 ? res : null;
  };

  if (Array.isArray(value)) {
    return clean(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return clean(parsed);
      }
      const dayVal = toDayNum(parsed);
      if (dayVal !== null) return [dayVal];
    } catch {
      if (trimmed.includes(",")) {
        return clean(trimmed.split(","));
      }
      const dayVal = toDayNum(trimmed);
      if (dayVal !== null) return [dayVal];
    }
  }
  if (typeof value === "number") {
    return [value];
  }
  return null;
}

export function getWeekdayIndex(date) {
  return new Date(date).getDay();
}

function getKolkataWeekdayIndex(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return -1;
  const weekdayStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long"
  }).format(d);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days.indexOf(weekdayStr);
}

export function isSameDay(dateA, dateB) {
  if (!dateA || !dateB) return false;
  const d1 = new Date(dateA);
  const d2 = new Date(dateB);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isAfterDayKolkata(dateA, dateB) {
  const a = getKolkataParts(dateA);
  const b = getKolkataParts(dateB);
  if (!a || !b) return false;
  
  const yA = Number(a.year), yB = Number(b.year);
  if (yA !== yB) return yA > yB;
  
  const mA = Number(a.month), mB = Number(b.month);
  if (mA !== mB) return mA > mB;
  
  return Number(a.day) > Number(b.day);
}

export function isRecurringSession(liveClass, { defaultRecurring = false } = {}) {
  if (isSessionUnavailable(liveClass)) return false;

  const recurringDaysRaw =
    liveClass?.recurringDays ||
    liveClass?.recurring_days ||
    liveClass?.raw?.recurringDays ||
    liveClass?.raw?.recurring_days ||
    null;
  const recurringDays = parseRecurringDays(recurringDaysRaw);

  if (Array.isArray(recurringDays) && recurringDays.length > 0) return true;

  const explicitRecurring = flagValue(
    liveClass?.isRecurring ??
      liveClass?.recurring ??
      liveClass?.is_recurring ??
      liveClass?.raw?.isRecurring ??
      liveClass?.raw?.recurring ??
      liveClass?.raw?.is_recurring
  );
  if (explicitRecurring !== null) return explicitRecurring;

  const recurrenceType = String(
    liveClass?.recurrenceType ||
      liveClass?.recurrence_type ||
      liveClass?.repeatType ||
      liveClass?.raw?.recurrenceType ||
      liveClass?.raw?.recurrence_type ||
      liveClass?.raw?.repeatType ||
      ""
  ).trim().toLowerCase();

  if (recurrenceType) {
    return ["daily", "everyday", "every_day", "recurring"].includes(recurrenceType);
  }

  return defaultRecurring;
}

export function isClassActiveOnDate(session, targetDate) {
  if (!session) return false;
  const live = session.liveClass || session;
  const recurrenceEndDate = live?.recurrenceEndDate || live?.recurrence_end_date || live?.raw?.recurrenceEndDate || live?.raw?.recurrence_end_date || null;
  if (recurrenceEndDate && isAfterDayKolkata(targetDate, recurrenceEndDate)) {
    return false;
  }
  const recurringDays = parseRecurringDays(
    live?.recurringDays ||
    live?.recurring_days ||
    live?.raw?.recurringDays ||
    live?.raw?.recurring_days ||
    null
  );

  const isRecurring = isRecurringSession(live);

  if (!isRecurring) {
    const scheduledDate = live?.scheduledDate || live?.scheduledAt || session?.scheduledDate || session?.scheduledAt;
    return isSameDay(scheduledDate, targetDate);
  }

  const targetWeekday = getWeekdayIndex(targetDate);
  if (!Array.isArray(recurringDays)) {
    return true;
  }
  return recurringDays.includes(targetWeekday);
}

export function isSessionUnavailable(liveClass) {
  const raw = liveClass?.raw || {};
  const status = String(liveClass?.status || raw?.status || "").trim().toLowerCase();
  return ["cancelled", "canceled", "paused", "ended", "inactive", "archived"].includes(status);
}

export function isDailyRecurringSession(liveClass, { defaultRecurring = false } = {}) {
  return isRecurringSession(liveClass, { defaultRecurring });
}

export function formatRecurringDays(recurringDays, { useFullNames = false } = {}) {
  const parsed = parseRecurringDays(recurringDays);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return "Daily";
  }
  if (parsed.length === 7) {
    return "Daily";
  }

  const sorted = [...parsed].sort((a, b) => a - b);
  const shortNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const fullNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const names = useFullNames ? fullNames : shortNames;

  let isContiguous = true;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1] + 1) {
      isContiguous = false;
      break;
    }
  }

  if (isContiguous && sorted.length >= 3) {
    return `${names[sorted[0]]} - ${names[sorted[sorted.length - 1]]}`;
  }

  return sorted.map((d) => names[d]).join(", ");
}

export function getSessionOccurrenceTiming(liveClass, now = Date.now(), options = {}) {
  const scheduledAt = liveClass?.scheduledAt;
  const durationMinutes = liveClass?.durationMinutes || 60;
  const endsAt = liveClass?.endsAt || "";
  const base = getLiveTiming(scheduledAt, durationMinutes, endsAt);

  const isRecurring = isRecurringSession(liveClass, options);

  if (!isRecurring) {
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

  const endTimeParts = endsAt ? getKolkataParts(endsAt) : null;

  const buildOccurrence = (dateParts) => {
    const occurrenceScheduledAt = kolkataIsoFromParts(dateParts, startTimeParts);
    const occurrenceStartMs = toMs(occurrenceScheduledAt);
    const occurrenceEndsAt = endTimeParts ? kolkataIsoFromParts(dateParts, endTimeParts) : "";
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
  };

  const recurringDays = parseRecurringDays(
    liveClass?.recurringDays ||
    liveClass?.recurring_days ||
    liveClass?.raw?.recurringDays ||
    liveClass?.raw?.recurring_days ||
    null
  );

  const recurrenceEndDate = liveClass?.recurrenceEndDate || liveClass?.recurrence_end_date || liveClass?.raw?.recurrenceEndDate || liveClass?.raw?.recurrence_end_date || null;

  const todayOccurrence = buildOccurrence(todayParts);
  const todayWeekday = getKolkataWeekdayIndex(now);
  const isTodayActive = (Array.isArray(recurringDays) ? recurringDays.includes(todayWeekday) : true) &&
    (!recurrenceEndDate || !isAfterDayKolkata(now, recurrenceEndDate));

  if (isTodayActive && !(options.rollForwardAfterEnd && now > todayOccurrence.endMs)) {
    return todayOccurrence;
  }

  let currentMs = now + 24 * 60 * 60 * 1000;
  for (let i = 0; i < 7; i++) {
    const weekday = getKolkataWeekdayIndex(currentMs);
    const isActive = Array.isArray(recurringDays) ? recurringDays.includes(weekday) : true;
    if (isActive) {
      if (recurrenceEndDate && isAfterDayKolkata(currentMs, recurrenceEndDate)) {
        break;
      }
      const nextParts = getKolkataParts(currentMs);
      if (nextParts) return buildOccurrence(nextParts);
    }
    currentMs += 24 * 60 * 60 * 1000;
  }

  return todayOccurrence;
}

export function isClassActiveToday(liveClass, now = Date.now()) {
  return isClassActiveOnDate(liveClass, new Date(now));
}

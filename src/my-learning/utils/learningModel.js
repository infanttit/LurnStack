import { getCourseAccessId, hasPaidAccessForSession } from "../../courses/api/studentSessionsApi";
import { getSessionOccurrenceTiming } from "../../shared/utils/sessionTiming";

const RECENT_JOINED_KEY = "lurnstack:my-learning:recent-joined:v1";

function readRecentJoinedStore() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_JOINED_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecentJoinedStore(items) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RECENT_JOINED_KEY, JSON.stringify(items.slice(0, 30)));
}

export function rememberRecentlyJoinedSession(session, details = {}) {
  const id = String(session?.id || session?.sessionId || "").trim();
  if (!id) return;
  const joinedAt = details.joinedAt || details.firstJoinedAt || new Date().toISOString();
  const record = {
    ...session,
    id,
    isJoined: true,
    joinedAt,
    lastJoinedAt: joinedAt,
    attendanceStatus: details.attendanceStatus || session?.attendanceStatus || "joined",
    attendance: {
      ...(session?.attendance || {}),
      attendanceStatus: details.attendanceStatus || session?.attendance?.attendanceStatus || "joined",
      firstJoinedAt: session?.attendance?.firstJoinedAt || joinedAt,
      lastJoinedAt: joinedAt,
      joinCount: Number(session?.attendance?.joinCount || 0) + 1,
    },
  };
  const current = readRecentJoinedStore().filter((item) => String(item.id) !== id);
  writeRecentJoinedStore([record, ...current]);
}

export function applyRecentJoinedFallback(sessions = []) {
  const recent = readRecentJoinedStore();
  if (!recent.length) return sessions;
  const byId = new Map(sessions.map((session) => [String(session.id), session]));
  recent.forEach((record) => {
    const id = String(record.id);
    const existing = byId.get(id);
    byId.set(id, existing ? { ...existing, ...record, raw: existing.raw } : record);
  });
  return Array.from(byId.values());
}

export function formatIST(iso) {
  const date = new Date(iso || "");
  if (Number.isNaN(date.getTime())) return "Schedule pending";
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getStartMs(session) {
  return getLearningOccurrence(session).startMs;
}

export function getEndMs(session) {
  return getLearningOccurrence(session).endMs;
}

export function getLearningOccurrence(session, now = Date.now(), options = {}) {
  const live = session?.liveClass || session || {};
  const source = {
    ...live,
    scheduledAt: live?.scheduledAt || session?.scheduledAt || session?.startsAt || "",
    endsAt: live?.endsAt || session?.endsAt || "",
    durationMinutes: live?.durationMinutes || session?.durationMinutes || 60,
  };
  return getSessionOccurrenceTiming(source, now, {
    defaultRecurring: false,
    rollForwardAfterEnd: options.rollForwardAfterEnd !== false,
  });
}

export function getAttendanceStatus(session) {
  return (
    session?.attendance?.attendanceStatus ||
    session?.attendance?.status ||
    session?.attendanceStatus ||
    ""
  );
}

export function getLastJoinedMs(session) {
  const attendance = session?.attendance || {};
  const value =
    attendance.lastJoinedAt ||
    attendance.firstJoinedAt ||
    session?.lastJoinedAt ||
    session?.joinedAt ||
    "";
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

export function isPaidLearningSession(session) {
  return (
    session?.isPaid === true ||
    session?.hasCourseAccess === true ||
    session?.bookingStatus === "paid" ||
    hasPaidAccessForSession(session)
  );
}

export function isUnavailableSession(session) {
  const status = String(session?.liveClass?.status || session?.status || "").trim().toLowerCase();
  return status === "cancelled" || status === "ended" || status === "completed";
}

function getCourseTitle(session) {
  return (
    session?.courseTitle ||
    session?.liveClass?.courseName ||
    session?.raw?.courseTitle ||
    session?.raw?.course?.title ||
    session?.title ||
    "Learning course"
  );
}

function getCourseKey(session) {
  return getCourseAccessId(session) || session?.courseId || session?.liveClass?.courseId || session?.id || "";
}

export function buildLearningSummary(learningSessions = [], now = Date.now()) {
  const sessions = learningSessions.filter((session) => !isUnavailableSession(session));
  const paidSessions = sessions.filter(isPaidLearningSession);
  const upcomingSessions = sessions
    .filter((session) => {
      const start = getStartMs(session);
      return start > 0 && start >= now;
    })
    .sort((a, b) => getStartMs(a) - getStartMs(b));
  const completedSessions = sessions
    .filter((session) => {
      const end = getEndMs(session);
      return end > 0 && end < now;
    })
    .sort((a, b) => getEndMs(b) - getEndMs(a));
  const recentlyJoined = sessions
    .filter((session) => session?.isJoined || getLastJoinedMs(session) > 0 || getAttendanceStatus(session))
    .sort((a, b) => getLastJoinedMs(b) - getLastJoinedMs(a));

  const courseMap = new Map();
  paidSessions.forEach((session) => {
    const key = getCourseKey(session);
    if (!key) return;
    const current =
      courseMap.get(key) ||
      {
        id: key,
        title: getCourseTitle(session),
        instructor: session?.instructorName || session?.instructor || "LurnStack Trainer",
        thumbnail: session?.thumbnail,
        total: 0,
        upcoming: 0,
        completed: 0,
        hasPaidAccess: true,
        nextSession: null,
      };
    const start = getStartMs(session);
    const end = getEndMs(session);
    current.total += 1;
    current.upcoming += start > 0 && start >= now ? 1 : 0;
    current.completed += end > 0 && end < now ? 1 : 0;
    if (start >= now && (!current.nextSession || start < getStartMs(current.nextSession))) {
      current.nextSession = session;
    }
    courseMap.set(key, current);
  });

  const paidCourses = Array.from(courseMap.values()).sort((a, b) => {
    const aTime = a.nextSession ? getStartMs(a.nextSession) : Number.MAX_SAFE_INTEGER;
    const bTime = b.nextSession ? getStartMs(b.nextSession) : Number.MAX_SAFE_INTEGER;
    return aTime - bTime || a.title.localeCompare(b.title);
  });

  const attended = sessions.filter((session) => {
    const status = String(getAttendanceStatus(session)).toLowerCase();
    return status === "present" || status === "late" || status === "joined";
  }).length;
  const markedAttendance = sessions.filter((session) => !!getAttendanceStatus(session)).length;

  return {
    total: sessions.length,
    paidSessions,
    paidCourses,
    upcomingSessions,
    recentlyJoined,
    completedSessions,
    nextSession: upcomingSessions[0] || null,
    attendancePercentage: markedAttendance ? Math.round((attended / markedAttendance) * 100) : 0,
  };
}

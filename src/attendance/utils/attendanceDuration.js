export const PRESENT_THRESHOLD_MINUTES = 10;

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function toTimestamp(value) {
  const date = new Date(value || "");
  const time = date.getTime();
  return Number.isNaN(time) ? 0 : time;
}

function firstValue(source = {}, keys = []) {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== "") return source[key];
  }
  return "";
}

function readDirectMinutes(source = {}) {
  const minuteKeys = [
    "totalMinutes",
    "total_minutes",
    "totalDurationMinutes",
    "total_duration_minutes",
    "attendedMinutes",
    "attended_minutes",
    "durationMinutes",
    "duration_minutes",
    "spentMinutes",
    "spent_minutes",
    "timeSpentMinutes",
    "time_spent_minutes",
    "attendanceMinutes",
    "attendance_minutes",
    "minutesAttended",
    "minutes_attended",
  ];
  const secondKeys = [
    "totalSeconds",
    "total_seconds",
    "totalDurationSeconds",
    "total_duration_seconds",
    "attendedSeconds",
    "attended_seconds",
    "durationSeconds",
    "duration_seconds",
    "spentSeconds",
    "spent_seconds",
    "timeSpentSeconds",
    "time_spent_seconds",
    "attendanceSeconds",
    "attendance_seconds",
    "secondsAttended",
    "seconds_attended",
  ];
  const millisecondKeys = [
    "totalMilliseconds",
    "total_milliseconds",
    "totalDurationMs",
    "total_duration_ms",
    "attendedMs",
    "attended_ms",
    "durationMs",
    "duration_ms",
    "timeSpentMs",
    "time_spent_ms",
  ];

  for (const key of minuteKeys) {
    const value = toNumber(source[key]);
    if (value !== null) return value;
  }
  for (const key of secondKeys) {
    const value = toNumber(source[key]);
    if (value !== null) return value / 60;
  }
  for (const key of millisecondKeys) {
    const value = toNumber(source[key]);
    if (value !== null) return value / 60000;
  }
  return null;
}

function segmentDurationMinutes(segment = {}) {
  const direct = readDirectMinutes(segment);
  if (direct !== null) return direct;

  const joinedAt = firstValue(segment, [
    "joinTime",
    "join_time",
    "joinedAt",
    "joined_at",
    "clientJoinedAt",
    "client_joined_at",
    "enteredAt",
    "entered_at",
    "startAt",
    "start_at",
    "startedAt",
    "started_at",
  ]);
  const leftAt = firstValue(segment, [
    "leaveTime",
    "leave_time",
    "leftAt",
    "left_at",
    "clientLeftAt",
    "client_left_at",
    "exitedAt",
    "exited_at",
    "endAt",
    "end_at",
    "endedAt",
    "ended_at",
  ]);
  const start = toTimestamp(joinedAt);
  const end = toTimestamp(leftAt);
  return start && end > start ? (end - start) / 60000 : 0;
}

function readSegments(source = {}) {
  const keys = [
    "joinSessions",
    "join_sessions",
    "attendanceSessions",
    "attendance_sessions",
    "joinLogs",
    "join_logs",
    "attendanceLogs",
    "attendance_logs",
    "intervals",
    "visits",
    "entries",
  ];

  for (const key of keys) {
    if (Array.isArray(source[key])) return source[key];
  }
  return [];
}

export function getAttendanceDurationMinutes(source = {}) {
  const direct = readDirectMinutes(source);
  if (direct !== null) return { minutes: direct, hasEvidence: true };

  const segments = readSegments(source);
  if (segments.length) {
    return {
      minutes: segments.reduce((total, segment) => total + segmentDurationMinutes(segment), 0),
      hasEvidence: true,
    };
  }

  const joinedAt = firstValue(source, ["joinTime", "join_time", "firstJoinedAt", "first_joined_at", "joinedAt", "joined_at"]);
  const leftAt = firstValue(source, [
    "leaveTime",
    "leave_time",
    "lastLeftAt",
    "last_left_at",
    "leftAt",
    "left_at",
    "clientLeftAt",
    "client_left_at",
    "lastJoinedAt",
    "last_joined_at",
  ]);
  const start = toTimestamp(joinedAt);
  const end = toTimestamp(leftAt);
  if (start && end > start) return { minutes: (end - start) / 60000, hasEvidence: true };

  return { minutes: 0, hasEvidence: false };
}

export function statusFromAttendanceDuration(source = {}, fallbackStatus = "") {
  const { minutes, hasEvidence } = getAttendanceDurationMinutes(source);
  if (!hasEvidence) return fallbackStatus;
  return minutes >= PRESENT_THRESHOLD_MINUTES ? "present" : "absent";
}

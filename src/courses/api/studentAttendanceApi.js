import { axiosClient } from "../../shared/api/axiosClient";
import { getAxiosErrorMessage, getAxiosErrorStatus } from "../../shared/api/axiosError";

function unwrap(res) {
  const data = res?.data;
  if (data?.success === false) throw new Error(data?.message || "Request failed");
  if (data?.success === true) return data;
  if (data && typeof data === "object" && "data" in data) return data;
  return { data };
}

function normalizeStatus(value) {
  const status = String(value || "").trim().toLowerCase();
  if (status === "late") return "late";
  if (status === "absent") return "absent";
  if (status === "pending" || status === "tracking") return "pending";
  if (status === "present") return "present";
  if (status === "attended") return "present";
  if (status === "joined") return "present";
  return status || "";
}

function timestamp(value) {
  const date = new Date(value || "");
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function firstTime(a, b) {
  if (!a) return b || "";
  if (!b) return a;
  return timestamp(a) <= timestamp(b) ? a : b;
}

function lastTime(a, b) {
  if (!a) return b || "";
  if (!b) return a;
  return timestamp(a) >= timestamp(b) ? a : b;
}

function strongestStatus(a, b) {
  const priority = { present: 4, late: 3, joined: 2, absent: 1 };
  return (priority[b] || 0) > (priority[a] || 0) ? b : a;
}

export function formatAttendanceStatus(value) {
  const status = normalizeStatus(value);
  if (status === "present") return "Present";
  if (status === "late") return "Late";
  if (status === "absent") return "Absent";
  if (status === "pending") return "Tracking";
  return status ? status[0].toUpperCase() + status.slice(1) : "Not marked";
}

export function normalizeAttendance(raw = {}) {
  const source = raw?.attendance || raw?.data?.attendance || raw?.data || raw || {};
  const session =
    source.session ||
    source.liveSession ||
    source.LiveSession ||
    source.live_session ||
    source.LiveClass ||
    {};
  const course =
    source.course ||
    session.course ||
    session.Course ||
    source.Course ||
    source.CourseModel ||
    {};
  const trainer = source.trainer || source.Trainer || session.trainer || session.Trainer || {};
  const status = normalizeStatus(source.attendanceStatus || source.status);
  return {
    id: source.id || source.attendanceId || source.attendance_id || "",
    courseId: source.courseId || source.course_id || course.id || session.courseId || session.course_id || "",
    sessionId: source.sessionId || source.session_id || source.liveClassId || source.live_class_id || session.id || "",
    occurrenceId: source.occurrenceId || source.occurrence_id || "",
    occurrenceDate: source.occurrenceDate || source.occurrence_date || source.sessionDate || source.session_date || source.joinDate || source.join_date || "",
    sessionTitle:
      source.sessionTitle ||
      source.session_title ||
      source.title ||
      source.classTitle ||
      source.class_title ||
      session.sessionTitle ||
      session.session_title ||
      session.classTitle ||
      session.class_title ||
      session.title ||
      session.courseTitle ||
      session.course_title ||
      "",
    startsAt: source.startsAt || source.starts_at || source.scheduledAt || source.scheduled_at || session.scheduledAt || session.scheduled_at || "",
    endsAt: source.endsAt || source.ends_at || session.endsAt || session.ends_at || "",
    attendanceStatus: status,
    status,
    firstJoinedAt: source.firstJoinedAt || source.first_joined_at || source.joinedAt || source.joined_at || "",
    lastJoinedAt: source.lastJoinedAt || source.last_joined_at || source.joinedAt || source.joined_at || "",
    joinCount: Number(source.joinCount ?? source.join_count ?? (source.joinedAt || source.joined_at ? 1 : 0)) || 0,
    attendancePercentage: Number(source.attendancePercentage ?? source.attendance_percentage ?? 0) || 0,
    trainerName:
      source.trainerName ||
      source.trainer_name ||
      trainer.fullName ||
      trainer.full_name ||
      trainer.name ||
      "",
      courseTitle:
        source.courseTitle ||
      source.course_title ||
      session.courseTitle ||
      session.course_title ||
      course.courseTitle ||
      course.course_title ||
      course.title ||
      "Course attendance",
    raw: source,
  };
}

function isFlatAttendanceRecord(raw = {}) {
  const source = raw?.attendance || raw?.data?.attendance || raw?.data || raw || {};
  return Boolean(
    !Array.isArray(source.sessions) &&
      (source.sessionId ||
        source.session_id ||
        source.liveClassId ||
        source.live_class_id ||
        source.joinedAt ||
        source.joined_at ||
        source.joinDate ||
        source.join_date)
  );
}

function normalizeSummary(raw = {}) {
  const source = raw?.data || raw || {};
  const sessions = Array.isArray(source.sessions)
    ? source.sessions
    : Array.isArray(source.history)
      ? source.history
      : Array.isArray(source.attendance)
        ? source.attendance
        : [];
  const totalSessions =
    Number(source.totalSessions ?? source.total_sessions ?? sessions.length) || sessions.length;
  const presentCount = Number(source.presentCount ?? source.present_count ?? 0) || 0;
  const lateCount = Number(source.lateCount ?? source.late_count ?? 0) || 0;
  const absentCount = Number(source.absentCount ?? source.absent_count ?? 0) || 0;
  const attendedCount =
    Number(source.attendedCount ?? source.attended_count ?? presentCount + lateCount) ||
    presentCount + lateCount;
  const attendancePercentage =
    Number(source.attendancePercentage ?? source.attendance_percentage) ||
    (totalSessions ? Math.round((attendedCount / totalSessions) * 10000) / 100 : 0);

  return {
    courseId: source.courseId || source.course_id || sessions[0]?.courseId || sessions[0]?.course_id || "",
    courseTitle:
      source.courseTitle ||
      source.course_title ||
      source.title ||
      sessions[0]?.courseTitle ||
      sessions[0]?.course_title ||
      sessions[0]?.liveSession?.courseTitle ||
      sessions[0]?.liveSession?.course_title ||
      sessions[0]?.LiveSession?.courseTitle ||
      sessions[0]?.LiveSession?.course_title ||
        sessions[0]?.LiveSession?.course?.title ||
        sessions[0]?.liveSession?.course?.title ||
        sessions[0]?.sessionTitle ||
        sessions[0]?.session_title ||
        "Course attendance",
    trainerName:
      source.trainerName ||
      source.trainer_name ||
      sessions[0]?.trainerName ||
      sessions[0]?.trainer_name ||
      sessions[0]?.liveSession?.trainer?.fullName ||
      sessions[0]?.LiveSession?.trainer?.fullName ||
      "",
    totalSessions,
    attendedCount,
    presentCount,
    lateCount,
    absentCount,
    attendancePercentage,
    sessions: sessions.map(normalizeAttendance),
    summaryKey:
      source.courseId ||
      source.course_id ||
      sessions[0]?.courseId ||
      sessions[0]?.course_id ||
      sessions[0]?.liveSession?.courseId ||
      sessions[0]?.liveSession?.course_id ||
      sessions[0]?.LiveSession?.courseId ||
      sessions[0]?.LiveSession?.course_id ||
      sessions[0]?.sessionId ||
      sessions[0]?.session_id ||
      source.title ||
      "",
    raw: source,
  };
}

function summarizeAttendanceRecords(records = []) {
  const groups = new Map();
  const uniqueRecords = new Map();

  records.map(normalizeAttendance).forEach((record) => {
    const recordKey =
      record.occurrenceId ||
      [record.sessionId || record.id, record.occurrenceDate || record.startsAt || record.firstJoinedAt].join(":");
    const existing = uniqueRecords.get(recordKey);
    if (existing) {
      uniqueRecords.set(recordKey, {
        ...existing,
        status: strongestStatus(existing.status, record.status),
        attendanceStatus: strongestStatus(existing.attendanceStatus, record.attendanceStatus),
        firstJoinedAt: firstTime(existing.firstJoinedAt, record.firstJoinedAt),
        lastJoinedAt: lastTime(existing.lastJoinedAt, record.lastJoinedAt),
        joinCount: Math.max(existing.joinCount || 0, record.joinCount || 0),
      });
      return;
    }
    uniqueRecords.set(recordKey, record);
  });

  Array.from(uniqueRecords.values()).forEach((record) => {
    const key = record.courseId || record.courseTitle || record.sessionId || "attendance";
    const current =
      groups.get(key) ||
      {
        courseId: record.courseId || "",
        courseTitle: record.courseTitle || record.sessionTitle || "Course attendance",
        trainerName: record.trainerName || "",
        summaryKey: key,
        sessions: [],
      };
    current.sessions.push(record);
    groups.set(key, current);
  });

  return Array.from(groups.values()).map((group) => {
    const presentCount = group.sessions.filter((x) => x.status === "present").length;
    const lateCount = group.sessions.filter((x) => x.status === "late").length;
    const absentCount = group.sessions.filter((x) => x.status === "absent").length;
    const totalSessions = group.sessions.length;
    const attendedCount = presentCount + lateCount;
    return {
      courseId: group.courseId,
      courseTitle: group.courseTitle,
      trainerName: group.trainerName,
      totalSessions,
      attendedCount,
      presentCount,
      lateCount,
      absentCount,
      attendancePercentage: totalSessions ? Math.round((attendedCount / totalSessions) * 10000) / 100 : 0,
      sessions: group.sessions,
      summaryKey: group.summaryKey || group.courseId || group.sessions[0]?.sessionId || group.courseTitle,
      raw: group,
    };
  });
}

function normalizeAttendanceOverviewPayload(payload = {}) {
  const list = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload.data?.courses)
      ? payload.data.courses
      : Array.isArray(payload.courses)
        ? payload.courses
        : [];

  if (!list.length) return [];
  if (list.every(isFlatAttendanceRecord)) return summarizeAttendanceRecords(list);
  return list.map(normalizeSummary);
}

export async function getStudentCourseAttendance(courseId) {
  const id = encodeURIComponent(courseId);
  const endpoints = [
    `/api/student/courses/${id}/attendance`,
    `/api/me/courses/${id}/attendance`,
  ];
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const res = await axiosClient.get(endpoint);
      return normalizeSummary(unwrap(res));
    } catch (err) {
      const status = getAxiosErrorStatus(err);
      lastError = err;
      if (status === 404 || status === 405) continue;
      throw new Error(getAxiosErrorMessage(err, "Unable to load course attendance."));
    }
  }

  throw new Error(getAxiosErrorMessage(lastError, "Course attendance endpoint is not available yet."));
}

export async function getStudentSessionAttendance(sessionId) {
  const id = encodeURIComponent(sessionId);
  const endpoints = [
    `/api/student/sessions/${id}/attendance`,
    `/api/me/sessions/${id}/attendance`,
  ];
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const res = await axiosClient.get(endpoint);
      return normalizeAttendance(unwrap(res));
    } catch (err) {
      const status = getAxiosErrorStatus(err);
      lastError = err;
      if (status === 404 || status === 405) continue;
      throw new Error(getAxiosErrorMessage(err, "Unable to load session attendance."));
    }
  }

  throw new Error(getAxiosErrorMessage(lastError, "Session attendance endpoint is not available yet."));
}

export async function getStudentAttendanceOverview() {
  try {
    const res = await axiosClient.get("/api/student/attendance");
    const payload = unwrap(res);
    return normalizeAttendanceOverviewPayload(payload);
  } catch (err) {
    const status = getAxiosErrorStatus(err);
    if (status === 404 || status === 405) return [];
    throw new Error(getAxiosErrorMessage(err, "Unable to load attendance history."));
  }
}

export async function getStudentAttendanceDashboard() {
  const courses = await getStudentAttendanceOverview();
  let totalClasses = 0;
  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;
  let classes = [];

  for (const course of courses) {
    totalClasses += course.totalSessions || 0;
    presentCount += course.presentCount || 0;
    lateCount += course.lateCount || 0;
    absentCount += course.absentCount || 0;
    
    for (const session of course.sessions || []) {
      classes.push({
        sessionId: session.id || session.sessionId,
        courseTitle: course.courseTitle,
        sessionTitle: session.sessionTitle,
        scheduledAt: session.occurrenceDate || session.startsAt,
        joinTime: session.firstJoinedAt,
        status: session.attendanceStatus || session.status,
      });
    }
  }

  classes.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  const attendedCount = presentCount + lateCount;
  const attendancePercentage = totalClasses ? Math.round((attendedCount / totalClasses) * 10000) / 100 : 0;

  return {
    totalClasses,
    presentCount,
    lateCount,
    absentCount,
    attendancePercentage,
    classes,
  };
}

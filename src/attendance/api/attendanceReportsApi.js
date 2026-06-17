import { axiosClient } from "../../shared/api/axiosClient";
import { getAxiosErrorMessage } from "../../shared/api/axiosError";
import {
  getAttendanceDurationMinutes,
  statusFromAttendanceDuration,
} from "../utils/attendanceDuration";

function unwrap(res) {
  const data = res?.data;
  if (data?.success === false) throw new Error(data?.message || "Request failed");
  if (data?.success === true) return data.data ?? data;
  return data?.data ?? data;
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeStatus(value) {
  const status = String(value || "").trim().toLowerCase();
  if (status === "joined" || status === "attended") return "present";
  if (status === "late") return "present";
  if (status === "absent") return "absent";
  if (status === "tracking") return "tracking";
  if (status === "pending") return "pending";
  if (status === "rescheduled") return "rescheduled";
  if (status === "present") return "present";
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

function hasOwn(source = {}, key) {
  return Object.prototype.hasOwnProperty.call(source, key);
}

function strongestStatus(a, b) {
  const priority = { present: 5, tracking: 4, pending: 3, joined: 2, absent: 1 };
  return (priority[b] || 0) > (priority[a] || 0) ? b : a;
}

function normalizeStudentAttendance(row = {}) {
  const source = row.attendance || row.data?.attendance || row.data || row;
  const student = source.student || source.Student || source.user || source.User || {};
  const duration = getAttendanceDurationMinutes(source);
  const rawStatus = normalizeStatus(
    source.status ||
      source.attendanceStatus ||
      source.attendance_status ||
      source.sessionStatus ||
      source.session_status
  );
  const status =
    rawStatus === "tracking" || rawStatus === "pending" || rawStatus === "rescheduled"
      ? rawStatus
      : normalizeStatus(statusFromAttendanceDuration(source, rawStatus));
  const hasNewLeaveTime = hasOwn(source, "leaveTime") || hasOwn(source, "leave_time");
  return {
    attendanceId: source.id || source.attendanceId || "",
    studentId: source.studentId || source.student_id || student.id || "",
    fullName:
      source.fullName ||
      source.studentName ||
      source.name ||
      student.fullName ||
      student.name ||
      student.email ||
      "Student",
    email: source.email || student.email || "",
    status,
    joinTime: source.joinTime || source.join_time || source.firstJoinedAt || source.first_joined_at || source.joinedAt || source.joined_at || "",
    leaveTime:
      hasNewLeaveTime
        ? source.leaveTime || source.leave_time || ""
        : source.lastJoinedAt ||
          source.last_joined_at ||
          source.leftAt ||
          source.left_at ||
          source.clientLeftAt ||
          source.client_left_at ||
          "",
    joinCount: Number(source.joinCount ?? source.join_count ?? (source.joinTime || source.join_time || source.joinedAt || source.joined_at ? 1 : 0)) || 0,
    attendedMinutes: duration.minutes,
    hasDurationEvidence: duration.hasEvidence,
    raw: source,
  };
}

function dedupeStudents(rows = []) {
  const map = new Map();
  rows.map(normalizeStudentAttendance).forEach((student) => {
    const key = student.studentId || student.email || student.attendanceId;
    if (!key) {
      map.set(`row-${map.size}`, student);
      return;
    }
    const existing = map.get(key);
    if (!existing) {
      map.set(key, student);
      return;
    }
    const attendedMinutes = (existing.attendedMinutes || 0) + (student.attendedMinutes || 0);
    const hasDurationEvidence = existing.hasDurationEvidence || student.hasDurationEvidence;
    map.set(key, {
      ...existing,
      attendanceId: existing.attendanceId || student.attendanceId,
      fullName: existing.fullName !== "Student" ? existing.fullName : student.fullName,
      email: existing.email || student.email,
      status:
        existing.status === "tracking" || student.status === "tracking"
          ? "tracking"
          : existing.status === "pending" || student.status === "pending"
            ? "pending"
            : existing.status === "rescheduled" || student.status === "rescheduled"
              ? "rescheduled"
              : hasDurationEvidence
                ? statusFromAttendanceDuration({ totalMinutes: attendedMinutes }, strongestStatus(existing.status, student.status))
                : strongestStatus(existing.status, student.status),
      joinTime: firstTime(existing.joinTime, student.joinTime),
      leaveTime: lastTime(existing.leaveTime, student.leaveTime),
      joinCount: (existing.joinCount || 0) + (student.joinCount || 0),
      attendedMinutes,
      hasDurationEvidence,
    });
  });
  return Array.from(map.values());
}

function normalizeSessionReport(raw = {}) {
  const source = Array.isArray(raw) ? { students: raw } : raw?.data || raw || {};
  const session = source.session || source.liveSession || source.LiveSession || source.live_session || {};
  const students = dedupeStudents(
    toArray(
      source.students ||
        source.attendance ||
        source.records ||
        source.rows ||
        source.history ||
        source.classes ||
        source.sessions
    )
  );
  const presentCount =
    Number(source.presentCount ?? source.present_count) ||
    students.filter((student) => student.status === "present").length ||
    0;
  const trackingCount =
    Number(source.trackingCount ?? source.tracking_count) ||
    students.filter((student) => student.status === "tracking" || student.status === "pending").length ||
    0;
  const rescheduledCount =
    Number(source.rescheduledCount ?? source.rescheduled_count) ||
    students.filter((student) => student.status === "rescheduled").length ||
    0;
  const lateCount = 0;
  const normalizedAbsentCount =
    Number(source.absentCount ?? source.absent_count) ||
    students.filter((student) => student.status === "absent").length ||
    0;
  const attendedCount = students.length
    ? presentCount
    : Number(source.attendedCount ?? source.attended_count) || presentCount;
  const totalStudents = Number(source.totalStudents ?? source.total_students) || students.length;

  return {
    sessionId: source.sessionId || source.session_id || session.id || "",
    sessionTitle:
      source.sessionTitle ||
      source.session_title ||
      source.title ||
      session.sessionTitle ||
      session.session_title ||
      session.classTitle ||
      session.class_title ||
      session.title ||
      session.courseTitle ||
      session.course_title ||
      "Live session",
    courseTitle: source.courseTitle || source.course_title || session.courseTitle || session.course_title || "",
    totalStudents,
    presentCount,
    lateCount,
    absentCount: normalizedAbsentCount,
    trackingCount,
    rescheduledCount,
    attendedCount,
    attendancePercentage:
      Number(source.attendancePercentage ?? source.attendance_percentage) ||
      (totalStudents ? Math.round((attendedCount / totalStudents) * 10000) / 100 : 0),
    students,
    raw: source,
  };
}

export function attendanceRate({ attendedCount = 0, totalStudents = 0, totalSessions = 0 } = {}) {
  const denominator = Number(totalStudents || 0) * Number(totalSessions || 0);
  if (!denominator) return 0;
  return Math.round((Number(attendedCount || 0) / denominator) * 10000) / 100;
}

export async function getAdminAttendanceOverview() {
  try {
    const res = await axiosClient.get("/api/admin/attendance/overview");
    const data = unwrap(res) || {};
    const overview = {
      totalCourses: Number(data.totalCourses || 0),
      totalTrainers: Number(data.totalTrainers || 0),
      totalStudents: Number(data.totalStudents || 0),
      totalSessions: Number(data.totalSessions || 0),
      completedSessions: Number(data.completedSessions || 0),
      presentCount: Number(data.presentCount || 0),
      lateCount: 0,
      absentCount: Number(data.absentCount || 0),
      attendedCount: Number(data.attendedCount || Number(data.presentCount || 0)),
      averageAttendancePercentage: Number(data.averageAttendancePercentage || data.attendancePercentage || 0),
      courses: toArray(data.courses),
      raw: data,
    };
    return overview;
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to load admin attendance overview."));
  }
}

export async function getAdminSessionAttendance(sessionId) {
  try {
    const res = await axiosClient.get(`/api/admin/sessions/${encodeURIComponent(sessionId)}/attendance`);
    const report = normalizeSessionReport(unwrap(res));
    return report;
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to load session attendance."));
  }
}

export async function getTrainerSessionAttendance(sessionId) {
  try {
    const res = await axiosClient.get(`/api/trainer/sessions/${encodeURIComponent(sessionId)}/attendance`);
    const report = normalizeSessionReport(unwrap(res));
    return report;
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to load trainer session attendance."));
  }
}

export async function getTrainerSessionsForAttendance() {
  try {
    const res = await axiosClient.get("/api/trainer/sessions");
    const data = unwrap(res);
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.sessions)
        ? data.sessions
        : Array.isArray(data?.liveSessions)
          ? data.liveSessions
          : Array.isArray(data?.data)
            ? data.data
            : [];
    const sessions = list.map((session) => ({
      id: session.id || session.sessionId || session.session_id || "",
      title:
        session.classTitle ||
        session.class_title ||
        session.sessionTitle ||
        session.session_title ||
        session.courseTitle ||
        session.course_title ||
        session.title ||
        "Live session",
      courseTitle: session.courseTitle || session.course_title || session.course?.title || session.Course?.title || "",
      scheduledAt: session.scheduledAt || session.scheduled_at || "",
      startsAt: session.startsAt || session.starts_at || session.scheduledAt || session.scheduled_at || "",
      endsAt: session.endsAt || session.ends_at || "",
      status: session.status || "",
    })).filter((session) => session.id);
    return sessions;
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to load trainer sessions."));
  }
}

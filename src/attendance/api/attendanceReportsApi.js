import { axiosClient } from "../../shared/api/axiosClient";
import { getAxiosErrorMessage } from "../../shared/api/axiosError";

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
  if (status === "late") return "late";
  if (status === "absent") return "absent";
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

function strongestStatus(a, b) {
  const priority = { present: 4, late: 3, joined: 2, absent: 1 };
  return (priority[b] || 0) > (priority[a] || 0) ? b : a;
}

function normalizeStudentAttendance(row = {}) {
  const source = row.attendance || row.data?.attendance || row.data || row;
  const student = source.student || source.Student || source.user || source.User || {};
  const status = normalizeStatus(source.status || source.attendanceStatus);
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
    firstJoinedAt: source.firstJoinedAt || source.first_joined_at || source.joinedAt || source.joined_at || "",
    lastJoinedAt: source.lastJoinedAt || source.last_joined_at || source.joinedAt || source.joined_at || "",
    joinCount: Number(source.joinCount ?? source.join_count ?? (source.joinedAt || source.joined_at ? 1 : 0)) || 0,
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
    map.set(key, {
      ...existing,
      attendanceId: existing.attendanceId || student.attendanceId,
      fullName: existing.fullName !== "Student" ? existing.fullName : student.fullName,
      email: existing.email || student.email,
      status: strongestStatus(existing.status, student.status),
      firstJoinedAt: firstTime(existing.firstJoinedAt, student.firstJoinedAt),
      lastJoinedAt: lastTime(existing.lastJoinedAt, student.lastJoinedAt),
      joinCount: Math.max(existing.joinCount || 0, student.joinCount || 0),
    });
  });
  return Array.from(map.values());
}

function normalizeSessionReport(raw = {}) {
  const source = Array.isArray(raw) ? { students: raw } : raw?.data || raw || {};
  const session = source.session || source.liveSession || source.LiveSession || source.live_session || {};
  const students = dedupeStudents(toArray(source.students || source.attendance || source.records || source.rows));
  const presentCount =
    students.filter((student) => student.status === "present").length ||
    Number(source.presentCount ?? source.present_count) ||
    0;
  const lateCount =
    students.filter((student) => student.status === "late").length ||
    Number(source.lateCount ?? source.late_count) ||
    0;
  const absentCount =
    students.filter((student) => student.status === "absent").length ||
    Number(source.absentCount ?? source.absent_count) ||
    0;
  const attendedCount = Number(source.attendedCount ?? source.attended_count) || presentCount + lateCount;
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
    absentCount,
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
    return {
      totalCourses: Number(data.totalCourses || 0),
      totalTrainers: Number(data.totalTrainers || 0),
      totalStudents: Number(data.totalStudents || 0),
      totalSessions: Number(data.totalSessions || 0),
      completedSessions: Number(data.completedSessions || 0),
      presentCount: Number(data.presentCount || 0),
      lateCount: Number(data.lateCount || 0),
      absentCount: Number(data.absentCount || 0),
      attendedCount: Number(data.attendedCount || Number(data.presentCount || 0) + Number(data.lateCount || 0)),
      averageAttendancePercentage: Number(data.averageAttendancePercentage || data.attendancePercentage || 0),
      courses: toArray(data.courses),
      raw: data,
    };
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to load admin attendance overview."));
  }
}

export async function getAdminSessionAttendance(sessionId) {
  try {
    const res = await axiosClient.get(`/api/admin/sessions/${encodeURIComponent(sessionId)}/attendance`);
    return normalizeSessionReport(unwrap(res));
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to load session attendance."));
  }
}

export async function getTrainerSessionAttendance(sessionId) {
  try {
    const res = await axiosClient.get(`/api/trainer/sessions/${encodeURIComponent(sessionId)}/attendance`);
    return normalizeSessionReport(unwrap(res));
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
    return list.map((session) => ({
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
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to load trainer sessions."));
  }
}

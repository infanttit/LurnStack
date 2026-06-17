import { useEffect, useMemo, useState } from "react";
import {
  HiOutlineArrowPath,
  HiOutlineCalendarDays,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineUserGroup,
  HiOutlineXCircle,
} from "react-icons/hi2";
import {
  getAdminAttendanceOverview,
  getAdminSessionAttendance,
  getTrainerSessionAttendance,
  getTrainerSessionsForAttendance,
} from "../api/attendanceReportsApi";
import { formatAttendanceStatus } from "../../courses/api/studentAttendanceApi";

function formatDateTime(value) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatCard({ icon: Icon, label, value, tone = "slate" }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-800",
    amber: "bg-amber-50 text-amber-800",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-50 text-slate-800",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={["flex h-10 w-10 items-center justify-center rounded-xl", tones[tone]].join(" ")}>
        <Icon className="text-xl" />
      </div>
      <div className="mt-4 text-2xl font-black text-slate-950">{value}</div>
      <div className="mt-1 text-xs font-extrabold uppercase tracking-widest text-slate-400">
        {label}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const value = String(status || "").toLowerCase();
  const className =
    value === "absent"
        ? "bg-red-100 text-red-700"
        : value === "tracking" || value === "pending"
          ? "bg-sky-100 text-sky-800"
          : value === "rescheduled"
            ? "bg-orange-100 text-orange-800"
        : "bg-emerald-100 text-emerald-800";
  return (
    <span className={["rounded-full px-2.5 py-1 text-[11px] font-extrabold", className].join(" ")}>
      {formatAttendanceStatus(value)}
    </span>
  );
}

function SessionLookup({ mode }) {
  const [sessionId, setSessionId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(mode === "trainer");
  const [sessionsError, setSessionsError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  const [autoLoadedSessionId, setAutoLoadedSessionId] = useState("");

  useEffect(() => {
    if (mode !== "trainer") return undefined;
    let cancelled = false;
    setSessionsLoading(true);
    setSessionsError("");
    getTrainerSessionsForAttendance()
      .then((items) => {
        if (cancelled) return;
        setSessions(items);
        setSessionId((current) => current || items[0]?.id || "");
      })
      .catch((err) => {
        if (!cancelled) setSessionsError(err?.message || "Unable to load trainer sessions.");
      })
      .finally(() => {
        if (!cancelled) setSessionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== "trainer" || !sessionId || autoLoadedSessionId === sessionId || report || loading) return undefined;
    let cancelled = false;
    const id = sessionId.trim();
    setAutoLoadedSessionId(sessionId);
    setLoading(true);
    setError("");
    getTrainerSessionAttendance(id)
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Unable to load attendance.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [autoLoadedSessionId, loading, mode, report, sessionId]);

  const loadSession = async () => {
    const id = sessionId.trim();
    if (!id) {
      setError("Enter a session ID to load attendance.");
      return;
    }
    setLoading(true);
    setError("");
    setAutoLoadedSessionId(id);
    try {
      const data =
        mode === "admin"
          ? await getAdminSessionAttendance(id)
          : await getTrainerSessionAttendance(id);
      setReport(data);
    } catch (err) {
      setReport(null);
      setError(err?.message || "Unable to load attendance.");
    } finally {
      setLoading(false);
    }
  };

  const students = Array.isArray(report?.students) ? report.students : [];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-950">Session attendance</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {mode === "trainer"
              ? "Select one of your sessions to view present and absent records."
              : "Load a live session to view present and absent records."}
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          {mode === "trainer" && sessions.length ? (
            <select
              value={sessionId}
              onChange={(e) => {
                setSessionId(e.target.value);
                setReport(null);
                setError("");
              }}
              className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-emerald-700 sm:w-96"
            >
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.title} {session.scheduledAt ? `- ${formatDateTime(session.scheduledAt)}` : ""}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={sessionId}
              onChange={(e) => {
                setSessionId(e.target.value);
                setReport(null);
                setError("");
              }}
              placeholder="Session ID"
              className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-emerald-700 sm:w-80"
            />
          )}
          <button
            type="button"
            onClick={loadSession}
            disabled={loading}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#00342b] px-4 text-sm font-extrabold text-white disabled:opacity-60"
          >
            <HiOutlineArrowPath className={loading ? "animate-spin" : ""} />
            Load
          </button>
        </div>
      </div>

      {mode === "trainer" && sessionsLoading ? (
        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
          Loading your sessions...
        </div>
      ) : null}

      {mode === "trainer" && sessionsError ? (
        <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {sessionsError}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      {report ? (
        <div className="mt-5">
          <div className="mb-4 rounded-2xl bg-slate-50 px-4 py-3">
            <div className="text-sm font-black text-slate-950">{report.sessionTitle || "Live session"}</div>
            {report.courseTitle ? (
              <div className="mt-0.5 text-xs font-semibold text-slate-500">{report.courseTitle}</div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatCard icon={HiOutlineUserGroup} label="Students" value={report.totalStudents || students.length || 0} />
            <StatCard icon={HiOutlineCheckCircle} label="Present" value={report.presentCount || 0} tone="emerald" />
            <StatCard icon={HiOutlineXCircle} label="Absent" value={report.absentCount || 0} tone="red" />
            <StatCard icon={HiOutlineArrowPath} label="Active" value={report.trackingCount || 0} tone="slate" />
            <StatCard icon={HiOutlineChartBar} label="Attendance" value={`${report.attendancePercentage || 0}%`} />
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[1.2fr_1fr_.7fr_.8fr_.8fr_.6fr] gap-3 bg-slate-50 px-4 py-3 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
              <div>Student</div>
              <div>Email</div>
              <div>Status</div>
              <div>Join</div>
              <div>Leave</div>
              <div>Count</div>
            </div>
            {students.length ? (
              students.map((student, index) => (
                <div
                  key={student.attendanceId || student.studentId || student.email || index}
                  className="grid grid-cols-[1.2fr_1fr_.7fr_.8fr_.8fr_.6fr] gap-3 border-t border-slate-100 px-4 py-3 text-sm"
                >
                  <div className="font-bold text-slate-900">{student.fullName || student.name || "-"}</div>
                  <div className="truncate text-slate-500">{student.email || "-"}</div>
                  <div><StatusPill status={student.status} /></div>
                  <div className="text-slate-500">{formatDateTime(student.joinTime)}</div>
                  <div className="text-slate-500">
                    {student.leaveTime ? formatDateTime(student.leaveTime) : (
                      student.status === "tracking" || student.status === "pending" ? "Active" : "-"
                    )}
                  </div>
                  <div className="font-bold text-slate-900">{student.joinCount || 0}</div>
                </div>
              ))
            ) : (
              <div className="border-t border-slate-100 px-4 py-8 text-center text-sm font-semibold text-slate-500">
                No student attendance records returned yet.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default function AttendanceReportPage({ mode = "admin" }) {
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(mode === "admin");
  const [overviewError, setOverviewError] = useState("");

  useEffect(() => {
    if (mode !== "admin") return undefined;
    let cancelled = false;
    setOverviewLoading(true);
    setOverviewError("");
    getAdminAttendanceOverview()
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch((err) => {
        if (!cancelled) setOverviewError(err?.message || "Unable to load admin overview.");
      })
      .finally(() => {
        if (!cancelled) setOverviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const title = mode === "admin" ? "Admin attendance" : "Trainer attendance";
  const subtitle =
    mode === "admin"
      ? "Review attendance across courses, trainers, sessions, and students."
      : "Review attendance for your live sessions.";
  const courses = useMemo(() => (Array.isArray(overview?.courses) ? overview.courses : []), [overview]);

  return (
    <main className="min-h-screen bg-[#f4f7f6]">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="rounded-3xl bg-[#00342b] p-6 text-white shadow-sm sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest">
            <HiOutlineCalendarDays />
            Attendance reports
          </div>
          <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium text-white/70">{subtitle}</p>
        </div>

        {mode === "admin" ? (
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950">Overview</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Present records update after join. Absent counts finalize after session end.
                </p>
              </div>
              {overviewLoading ? (
                <HiOutlineArrowPath className="text-xl text-slate-400 animate-spin" />
              ) : null}
            </div>

            {overviewError ? (
              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {overviewError}
              </div>
            ) : null}

            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
              <StatCard icon={HiOutlineCalendarDays} label="Courses" value={overview?.totalCourses || 0} />
              <StatCard icon={HiOutlineUserGroup} label="Students" value={overview?.totalStudents || 0} />
              <StatCard icon={HiOutlineCheckCircle} label="Present" value={overview?.presentCount || 0} tone="emerald" />
              <StatCard icon={HiOutlineXCircle} label="Absent" value={overview?.absentCount || 0} tone="red" />
              <StatCard icon={HiOutlineChartBar} label="Average" value={`${overview?.averageAttendancePercentage || 0}%`} />
            </div>

            {courses.length ? (
              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                {courses.map((course) => (
                  <div key={course.courseId} className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 first:border-t-0">
                    <div>
                      <div className="font-black text-slate-950">{course.courseTitle || "Course"}</div>
                      <div className="text-xs font-semibold text-slate-500">
                        Trainer: {course.trainerName || "-"} | Sessions: {course.completedSessions || 0}/{course.totalSessions || 0}
                      </div>
                    </div>
                    <div className="text-sm font-black text-slate-900">{course.attendancePercentage || 0}%</div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        <div className="mt-6">
          <SessionLookup mode={mode} />
        </div>
      </section>
    </main>
  );
}

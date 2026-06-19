import { useEffect, useMemo, useState } from "react";
import {
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineInformationCircle,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
} from "react-icons/hi2";
import {
  formatAttendanceStatus,
  getStudentAttendanceDashboard,
} from "../../courses/api/studentAttendanceApi";
import "./StudentAttendanceDashboardPage.css";

const EMPTY_DASHBOARD = {
  totalClasses: 0,
  presentCount: 0,
  lateCount: 0,
  absentCount: 0,
  attendancePercentage: 0,
  classes: [],
  courses: [],
};

function formatDateTime(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value || "").trim())) {
    const [, year, month, day] = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/) || [];
    if (year && month && day) {
      return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "Schedule unavailable";
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatCard({ icon: Icon, label, value, tone = "neutral" }) {
  return (
    <div className={`student-attendance-stat student-attendance-stat--${tone}`}>
      <div className="student-attendance-stat__icon">
        <Icon />
      </div>
      <div>
        <div className="student-attendance-stat__value">{value}</div>
        <div className="student-attendance-stat__label">{label}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  return (
    <span className={`student-attendance-status student-attendance-status--${normalized || "absent"}`}>
      <span aria-hidden="true" />
      {formatAttendanceStatus(normalized)}
    </span>
  );
}

function CourseAccordion({ course }) {
  const [isOpen, setIsOpen] = useState(false);
  const classes = [...(course.sessions || [])].sort((a, b) => {
    const timeA = new Date(a.occurrenceDate || a.startsAt || 0).getTime();
    const timeB = new Date(b.occurrenceDate || b.startsAt || 0).getTime();
    return timeB - timeA;
  });

  return (
    <div className="student-attendance-course-group">
      <button 
        className="student-attendance-course-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="student-attendance-course-info">
          <h3>{course.courseTitle}</h3>
          <p>{course.attendedCount} / {course.totalSessions} sessions attended ({course.attendancePercentage}%)</p>
        </div>
        <div className="student-attendance-course-toggle">
          {isOpen ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
        </div>
      </button>

      {isOpen && (
        <div className="student-attendance-course-content">
          {classes.length ? (
            <div className="student-attendance-timeline">
              <div className="student-attendance-history-table-head" aria-hidden="true">
                <div>Class</div>
                <div>Date / Time</div>
                <div>Join</div>
                <div>Duration</div>
                <div>Status</div>
              </div>
              {classes.map((session, index) => {
                const status = String(session.attendanceStatus || session.status || "absent").trim().toLowerCase();
                const scheduledAt = session.startsAt || session.occurrenceDate;
                const joinTime = session.firstJoinedAt;
                const attendedMinutes = session.attendedMinutes || 0;
                const sessionDurationMinutes = session.sessionDurationMinutes || 0;
                
                return (
                  <article
                    key={session.id || session.sessionId || `${course.courseTitle}-${scheduledAt}-${index}`}
                    className={`student-attendance-class-card student-attendance-class-card--${status}`}
                  >
                    <div className="student-attendance-class-card__content">
                      <div className="student-attendance-class-card__details">
                        <div className="student-attendance-class-card__title-group">
                          <h3 title={course.courseTitle}>{course.courseTitle}</h3>
                          {session.sessionTitle ? <p title={session.sessionTitle}>{session.sessionTitle}</p> : null}
                        </div>
                        <div className="student-attendance-class-card__time">
                          {formatDateTime(scheduledAt)}
                        </div>
                        <div className="student-attendance-class-card__meta" title={joinTime ? formatDateTime(joinTime) : "-"}>
                          <span>{joinTime ? `Join: ${formatDateTime(joinTime)}` : "Join: -"}</span>
                        </div>
                        <div className="student-attendance-class-card__duration" title={`Attended ${attendedMinutes}m out of ${sessionDurationMinutes}m`}>
                          <span className="student-attendance-class-card__duration-text">
                            {attendedMinutes}m / {sessionDurationMinutes}m ATTENDED
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={status} />
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="student-attendance-course-empty">No sessions recorded for this course yet.</div>
          )}
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="student-attendance-loading" aria-label="Loading attendance dashboard">
      <div className="student-attendance-loading__hero" />
      <div className="student-attendance-loading__grid">
        {[0, 1, 2].map((item) => (
          <div key={item} />
        ))}
      </div>
      <div className="student-attendance-loading__row" />
      <div className="student-attendance-loading__row" />
    </div>
  );
}

export default function StudentAttendanceDashboardPage() {
  const [attendance, setAttendance] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getStudentAttendanceDashboard()
      .then((data) => {
        if (!cancelled) setAttendance(data || EMPTY_DASHBOARD);
      })
      .catch((err) => {
        if (!cancelled) {
          setAttendance(EMPTY_DASHBOARD);
          setError(err?.message || "Unable to load attendance dashboard.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const courses = useMemo(
    () => (Array.isArray(attendance.courses) ? attendance.courses : []),
    [attendance.courses]
  );

  return (
    <main className="student-attendance-page">
      <section className="student-attendance-shell">
        <header className="student-attendance-hero">
          <div>
            <div className="student-attendance-eyebrow">
              <HiOutlineCalendarDays />
              Student attendance
            </div>
            <h1>Attendance Dashboard</h1>
            <p>
              Review your attended classes, missed sessions, and recent class history.
            </p>
          </div>
        </header>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <section className="student-attendance-state student-attendance-state--error">
            <HiOutlineXCircle />
            <h2>Unable to load attendance</h2>
            <p>{error}</p>
          </section>
        ) : (
          <>
            <section className="student-attendance-overview" aria-labelledby="attendance-overview-title">
              <div className="student-attendance-overview__header">
                <div>
                  <h2 id="attendance-overview-title">Attendance Overview</h2>
                  <p>Quickly check your total, attended, and missed classes.</p>
                </div>
              </div>

              <div className="student-attendance-stats">
                <StatCard icon={HiOutlineCalendarDays} label="Total Classes" value={attendance.totalClasses} />
                <StatCard icon={HiOutlineCheckCircle} label="Present Classes" value={attendance.presentCount} tone="present" />
                <StatCard icon={HiOutlineXCircle} label="Missed Classes" value={attendance.absentCount} tone="absent" />
              </div>
            </section>

            <div className="student-attendance-rule-banner">
              <HiOutlineInformationCircle className="student-attendance-rule-banner__icon" />
              <div className="student-attendance-rule-banner__content">
                <h3>30% Session Duration Rule</h3>
                <p>To be marked as Present, you must stay in the live session for at least 30% of its duration. Dropping out early may result in an Absent mark.</p>
              </div>
            </div>

            <section className="student-attendance-history" aria-labelledby="attendance-history-title">
              <div className="student-attendance-section-title">
                <div>
                  <h2 id="attendance-history-title">Course Attendance</h2>
                  <p>Expand a course to view detailed session-by-session history.</p>
                </div>
              </div>

              {courses.length ? (
                <div className="student-attendance-courses-list">
                  {courses.map((course, index) => (
                    <CourseAccordion key={course.courseId || course.summaryKey || `course-${index}`} course={course} />
                  ))}
                </div>
              ) : (
                <div className="student-attendance-state">
                  <HiOutlineCalendarDays />
                  <h2>No attendance records found.</h2>
                  <p>Your class history will appear after completed sessions are recorded.</p>
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
}

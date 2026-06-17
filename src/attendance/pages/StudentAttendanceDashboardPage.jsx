import { useEffect, useMemo, useState } from "react";
import {
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
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

  const classes = useMemo(
    () => (Array.isArray(attendance.classes) ? attendance.classes : []),
    [attendance.classes]
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

            <section className="student-attendance-history" aria-labelledby="attendance-history-title">
              <div className="student-attendance-section-title">
                <div>
                  <h2 id="attendance-history-title">Class History</h2>
                  <p>Newest days appear first. Sessions on the same day are shown in chronological order.</p>
                </div>
              </div>

              {classes.length ? (
                <div className="student-attendance-timeline">
                  <div className="student-attendance-history-table-head" aria-hidden="true">
                    <div>Class</div>
                    <div>Date / Time</div>
                    <div>Join</div>
                    <div>Status</div>
                  </div>
                  {classes.map((item, index) => {
                    const status = String(item.status || "absent").trim().toLowerCase();
                    return (
                    <article
                      key={item.sessionId || `${item.courseTitle}-${item.scheduledAt}-${index}`}
                      className={`student-attendance-class-card student-attendance-class-card--${status}`}
                    >
                      <div className="student-attendance-class-card__content">
                        <div className="student-attendance-class-card__details">
                          <div className="student-attendance-class-card__title-group">
                            <h3 title={item.courseTitle}>{item.courseTitle}</h3>
                            {item.sessionTitle ? <p title={item.sessionTitle}>{item.sessionTitle}</p> : null}
                          </div>
                          <div className="student-attendance-class-card__time">
                            {formatDateTime(item.scheduledAt)}
                          </div>
                          <div className="student-attendance-class-card__meta" title={item.joinTime ? formatDateTime(item.joinTime) : "-"}>
                            <span>{item.joinTime ? `Join: ${formatDateTime(item.joinTime)}` : "Join: -"}</span>
                          </div>
                        </div>
                        <StatusBadge status={status} />
                      </div>
                    </article>
                    );
                  })}
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

import { getAuthToken } from "../../auth/model/authStorage";
import { env } from "../../shared/config/env";
import { heartbeatStudentSession, leaveStudentSession, joinStudentSession } from "../api/studentSessionsApi";

const HEARTBEAT_INTERVAL_MS = 60000;
const activeTrackers = new Map();

function trackerKey(sessionId, sessionDate) {
  return `${sessionId || ""}:${sessionDate || ""}`;
}

function endpoint(path) {
  const baseUrl = String(env.apiBaseUrl || "").replace(/\/+$/, "");
  return `${baseUrl}${path}`;
}

function sendLeaveKeepAlive(sessionId, details = {}) {
  if (typeof fetch === "undefined") return;
  const id = String(sessionId || "").trim();
  if (!id) return;
  const token = getAuthToken();
  const body = JSON.stringify({
    sessionId: id,
    bookingId: details.bookingId || "",
    sessionDate: details.sessionDate || "",
    occurrenceDate: details.sessionDate || "",
    scheduledAt: details.scheduledAt || details.startsAt || "",
    startsAt: details.startsAt || details.scheduledAt || "",
    endsAt: details.endsAt || "",
    joinedAt: details.joinedAt || "",
    clientLeftAt: new Date().toISOString(),
  });

  try {
    fetch(endpoint(`/api/student/sessions/${encodeURIComponent(id)}/leave`), {
      method: "POST",
      keepalive: true,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
    }).catch(() => {});
  } catch {
    // Browser is unloading; leave is best-effort.
  }
}

export function startAttendanceHeartbeat({
  sessionId,
  sessionDate = "",
  scheduledAt = "",
  startsAt = "",
  endsAt = "",
  bookingId = "",
  joinedAt = "",
  meetingWindow = null,
  onAttendance,
} = {}) {
  const id = String(sessionId || "").trim();
  if (!id || typeof window === "undefined") return () => {};

  const key = trackerKey(id, sessionDate);
  activeTrackers.get(key)?.stop?.({ sendLeave: false });

  let stopped = false;
  const details = { sessionDate, scheduledAt, startsAt, endsAt, bookingId, joinedAt };

  const stop = ({ sendLeave = true } = {}) => {
    if (stopped) return;
    stopped = true;
    window.clearInterval(intervalId);
    window.removeEventListener("pagehide", handlePageHide);
    window.removeEventListener("beforeunload", handlePageHide);
    window.removeEventListener("online", handleOnline);
    activeTrackers.delete(key);
    if (sendLeave) {
      leaveStudentSession(id, details).then((attendance) => {
        if (attendance) onAttendance?.(attendance);
      });
    }
  };

  const handlePageHide = () => {
    sendLeaveKeepAlive(id, details);
    stop({ sendLeave: false });
  };

  const beat = async () => {
    if (stopped) return;
    try {
      const attendance = await heartbeatStudentSession(id, details);
      // NOTE: Heartbeat interval must continue firing at regular intervals
      // for as long as the LurnStack tab remains open to accurately track total duration.
      // Do NOT stop interval on 'present' status.
      if (attendance) {
        onAttendance?.(attendance);
      }
    } catch {
      // Best-effort heartbeat; continue on next interval
    }
  };

  const handleOnline = async () => {
    if (stopped) return;
    try {
      // User dropped connection and came back online.
      // Re-trigger joinStudentSession to log the new slice of presence.
      const result = await joinStudentSession(id, {
        sessionDate: details.sessionDate,
        scheduledAt: details.scheduledAt,
        startsAt: details.startsAt,
        endsAt: details.endsAt,
      });
      if (result?.joinedAt) {
        details.joinedAt = result.joinedAt;
      }
      if (result?.attendance) {
        onAttendance?.(result.attendance);
      }
    } catch {
      // Re-join best effort; ignore errors if they fail temporarily
    }
  };

  const intervalId = window.setInterval(beat, HEARTBEAT_INTERVAL_MS);
  window.addEventListener("pagehide", handlePageHide);
  window.addEventListener("beforeunload", handlePageHide);
  window.addEventListener("online", handleOnline);
  activeTrackers.set(key, { stop });

  beat();
  return stop;
}

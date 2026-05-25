import { getAuthToken } from "../../auth/model/authStorage";
import { env } from "../../shared/config/env";
import { heartbeatStudentSession, leaveStudentSession } from "../api/studentSessionsApi";

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
    sessionDate: details.sessionDate || "",
    occurrenceDate: details.sessionDate || "",
    scheduledAt: details.scheduledAt || details.startsAt || "",
    startsAt: details.startsAt || details.scheduledAt || "",
    endsAt: details.endsAt || "",
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
  meetingWindow = null,
  onAttendance,
} = {}) {
  const id = String(sessionId || "").trim();
  if (!id || typeof window === "undefined") return () => {};

  const key = trackerKey(id, sessionDate);
  activeTrackers.get(key)?.stop?.({ sendLeave: false });

  let stopped = false;
  const details = { sessionDate, scheduledAt, startsAt, endsAt };

  const stop = ({ sendLeave = true } = {}) => {
    if (stopped) return;
    stopped = true;
    window.clearInterval(intervalId);
    window.removeEventListener("pagehide", handlePageHide);
    window.removeEventListener("beforeunload", handlePageHide);
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
    if (meetingWindow && meetingWindow.closed) {
      stop();
      return;
    }
    const attendance = await heartbeatStudentSession(id, details);
    if (attendance) onAttendance?.(attendance);
  };

  const intervalId = window.setInterval(beat, HEARTBEAT_INTERVAL_MS);
  window.addEventListener("pagehide", handlePageHide);
  window.addEventListener("beforeunload", handlePageHide);
  activeTrackers.set(key, { stop });

  beat();
  return stop;
}

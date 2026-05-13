import { axiosClient } from "../../shared/api/axiosClient";
import { getAxiosErrorMessage } from "../../shared/api/axiosError";

function unwrap(res) {
  const data = res?.data;
  // Backend responses sometimes vary in shape across versions/environments.
  // Accept the common `{ success: true, data: ... }` shape, but also tolerate
  // responses that omit `success` while still providing `data`.
  if (data?.success === false) throw new Error(data?.message || "Request failed");
  if (data?.success === true) return data;
  if (data && typeof data === "object" && "data" in data) return data;
  throw new Error(data?.message || "Request failed");
  return data;
}

function parseDurationMinutes(duration) {
  const raw = String(duration || "").trim().toLowerCase();
  if (!raw) return 60;

  const m = raw.match(/(\d+(?:\.\d+)?)\s*(hour|hours|hr|hrs|minute|minutes|min|mins)\b/);
  if (!m) return 60;

  const value = Number(m[1]);
  const unit = m[2];
  if (!Number.isFinite(value) || value <= 0) return 60;

  if (unit.startsWith("hour") || unit === "hr" || unit === "hrs") return Math.round(value * 60);
  return Math.round(value);
}

function parseTimeTo24h(time) {
  const raw = String(time || "").trim().toUpperCase();
  const match = raw.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(AM|PM)?$/);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2] || "0");
  const meridiem = match[3] || "";

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (minutes < 0 || minutes > 59) return null;

  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    if (meridiem === "AM") {
      if (hours === 12) hours = 0;
    } else if (meridiem === "PM") {
      if (hours !== 12) hours += 12;
    }
  } else {
    if (hours < 0 || hours > 23) return null;
  }

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return `${hh}:${mm}:00`;
}

function toKolkataIso(date, time) {
  const d = String(date || "").trim();
  // If backend already provides a full ISO timestamp, pass it through.
  if (d.includes("T")) return d;
  const t24 = parseTimeTo24h(time);
  if (!d || !t24) return "";
  return `${d}T${t24}+05:30`;
}

function normalizeLiveClass(dto) {
  const raw = dto || {};
  const id = raw?.id ?? raw?._id ?? raw?.classId ?? raw?.class_id ?? null;
  const scheduledAt =
    raw?.scheduledAt ||
    raw?.scheduled_at ||
    raw?.scheduleAt ||
    raw?.schedule_at ||
    toKolkataIso(raw?.date, raw?.time);
  const durationMinutes =
    Number(raw?.durationMinutes) ||
    Number(raw?.duration_minutes) ||
    parseDurationMinutes(raw?.duration);
  return {
    id,
    courseName: raw?.courseName || raw?.course || raw?.course_name || "",
    title: raw?.classTitle || raw?.class_title || raw?.title || "",
    instructorName: raw?.instructor || raw?.instructorName || raw?.instructor_name || "",
    description: raw?.description || "",
    scheduledAt,
    durationMinutes,
    meetUrl: raw?.meetLink || raw?.meetUrl || raw?.meetingLink || raw?.meeting_url || "",
    thumbnail: raw?.thumbnail || "",
    raw,
  };
}

function sortByScheduleAsc(a, b) {
  return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
}

export async function getLiveClasses() {
  try {
    const res = await axiosClient.get("/api/student/live-classes");
    const payload = unwrap(res);
    const list = Array.isArray(payload.data) ? payload.data : [];
    return list.map(normalizeLiveClass).filter((x) => x?.id != null).sort(sortByScheduleAsc);
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to load live classes. Please try again."));
  }
}

export async function getLiveClassById(classId) {
  const id = String(classId || "").trim();
  if (!id) throw new Error("Missing class id");

  try {
    const res = await axiosClient.get(`/api/student/live-class/${encodeURIComponent(id)}`);
    const payload = unwrap(res);
    return normalizeLiveClass(payload.data || null);
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to load class details. Please try again."));
  }
}

export async function joinClass(classId) {
  const id = String(classId || "").trim();
  if (!id) throw new Error("Missing class id");

  try {
    const res = await axiosClient.post(`/api/student/join-class/${encodeURIComponent(id)}`);
    const payload = unwrap(res);
    return {
      message: payload.message || "",
      meetUrl: payload.meetLink || payload.meetUrl || "",
    };
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to join class. Please try again."));
  }
}

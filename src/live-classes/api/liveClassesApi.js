import { axiosClient } from "../../shared/api/axiosClient";
import { getAxiosErrorMessage } from "../../shared/api/axiosError";
import { getDurationMinutes, toKolkataIso, toMs } from "../lib/time";
import { normalizeAttendance } from "../../courses/api/studentAttendanceApi";

function unwrap(res) {
  const data = res?.data;
  // Backend responses sometimes vary in shape across versions/environments.
  // Accept the common `{ success: true, data: ... }` shape, but also tolerate
  // responses that omit `success` while still providing `data`.
  if (data?.success === false) throw new Error(data?.message || "Request failed");
  if (data?.success === true) return data;
  if (data && typeof data === "object" && "data" in data) return data;
  throw new Error(data?.message || "Request failed");
}

function getMeetingLink(payload) {
  const data = payload?.data || {};
  const session = data?.session || data?.liveClass || data?.class || {};
  if (typeof data === "string") return data;
  return (
    payload?.meetLink ||
    payload?.meetUrl ||
    payload?.meetingLink ||
    payload?.meeting_link ||
    payload?.meeting_url ||
    payload?.meet_url ||
    payload?.joinLink ||
    payload?.joinUrl ||
    payload?.liveClassLink ||
    payload?.classLink ||
    payload?.googleMeetLink ||
    payload?.zoomLink ||
    data?.meetLink ||
    data?.meetUrl ||
    data?.meetingLink ||
    data?.meeting_link ||
    data?.meeting_url ||
    data?.meet_url ||
    data?.joinLink ||
    data?.joinUrl ||
    data?.liveClassLink ||
    data?.classLink ||
    data?.googleMeetLink ||
    data?.zoomLink ||
    session?.meetLink ||
    session?.meetUrl ||
    session?.meetingLink ||
    session?.meeting_link ||
    session?.meeting_url ||
    session?.meet_url ||
    session?.joinLink ||
    session?.joinUrl ||
    session?.liveClassLink ||
    session?.classLink ||
    session?.googleMeetLink ||
    session?.zoomLink ||
    ""
  );
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

function normalizePriceInPaise(raw = {}) {
  const value =
    raw?.priceInPaise ??
    raw?.price_in_paise ??
    raw?.amountPaise ??
    raw?.amount_paise ??
    raw?.pricePaise ??
    raw?.price_paise ??
    raw?.price;
  if (value == null || value === "") return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount);
}

function formatINRFromPaise(amountPaise) {
  if (amountPaise == null) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: amountPaise % 100 === 0 ? 0 : 2,
  }).format(amountPaise / 100);
}

function normalizeLiveClass(dto) {
  const raw = dto || {};
  const id = raw?.id ?? raw?._id ?? raw?.classId ?? raw?.class_id ?? null;
  const priceInPaise = normalizePriceInPaise(raw);
  const scheduledAt =
    toKolkataIso(raw?.scheduledDate || raw?.scheduled_date || raw?.date, raw?.startTime || raw?.start_time || raw?.time) ||
    raw?.scheduledAt ||
    raw?.scheduled_at ||
    raw?.scheduleAt ||
    raw?.schedule_at ||
    "";
  const endsAt =
    toKolkataIso(raw?.scheduledDate || raw?.scheduled_date || raw?.date, raw?.endTime || raw?.end_time) ||
    raw?.endsAt ||
    raw?.ends_at ||
    "";
  const timeDuration = getDurationMinutes(raw?.startTime || raw?.start_time, raw?.endTime || raw?.end_time);
  const isoDuration =
    toMs(endsAt) > toMs(scheduledAt)
      ? Math.round((toMs(endsAt) - toMs(scheduledAt)) / 60000)
      : 0;
  const durationMinutes =
    timeDuration ||
    isoDuration ||
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
    endsAt,
    durationMinutes,
    meetUrl: getMeetingLink(raw),
    thumbnail: raw?.thumbnail || "",
    status: raw?.status || "",
    priceInPaise,
    priceLabel: formatINRFromPaise(priceInPaise),
    pricePending: priceInPaise == null,
    trainerInstructions: raw?.trainerInstructions || raw?.trainer_instructions || "",
    raw,
  };
}

function normalizeTitClass(dto) {
  const raw = dto || {};
  const id = raw?.id ?? raw?._id ?? raw?.classId ?? raw?.class_id ?? raw?.titClassId ?? raw?.tit_class_id ?? null;
  const priceInPaise = normalizePriceInPaise(raw);
  const scheduledAt =
    toKolkataIso(raw?.scheduledDate || raw?.scheduled_date || raw?.date, raw?.startTime || raw?.start_time || raw?.time) ||
    raw?.scheduledAt ||
    raw?.scheduled_at ||
    raw?.startsAt ||
    raw?.starts_at ||
    "";
  const endsAt =
    toKolkataIso(raw?.scheduledDate || raw?.scheduled_date || raw?.date, raw?.endTime || raw?.end_time) ||
    raw?.endsAt ||
    raw?.ends_at ||
    "";
  const durationMinutes =
    getDurationMinutes(raw?.startTime || raw?.start_time, raw?.endTime || raw?.end_time) ||
    (toMs(endsAt) > toMs(scheduledAt) ? Math.round((toMs(endsAt) - toMs(scheduledAt)) / 60000) : 0) ||
    Number(raw?.durationMinutes) ||
    Number(raw?.duration_minutes) ||
    parseDurationMinutes(raw?.duration);
  const course = raw?.course && typeof raw.course === "object" ? raw.course : {};
  const instructor = raw?.instructor && typeof raw.instructor === "object" ? raw.instructor : {};
  const isFree =
    raw?.isFree === true ||
    raw?.is_free === true ||
    String(raw?.pricingState || raw?.pricing_state || "").toUpperCase() === "FREE" ||
    Number(priceInPaise || 0) <= 0;

  return {
    id,
    title: raw?.title || raw?.classTitle || raw?.class_title || "TIT class",
    courseName:
      raw?.courseName ||
      raw?.course_name ||
      course?.name ||
      course?.title ||
      (typeof raw?.course === "string" ? raw.course : "") ||
      "",
    instructorName:
      raw?.instructorName ||
      raw?.instructor_name ||
      raw?.trainerName ||
      raw?.trainer_name ||
      (typeof raw?.instructor === "string" ? raw.instructor : "") ||
      instructor?.name ||
      instructor?.fullName ||
      "LurnStack Trainer",
    description: raw?.description || "",
    scheduledAt,
    endsAt,
    durationMinutes,
    meetingLink: getMeetingLink(raw),
    thumbnail: raw?.thumbnail || raw?.thumbnailUrl || raw?.thumbnail_url || raw?.image || raw?.imageUrl || "",
    status: raw?.status || "",
    priceInPaise,
    priceLabel: isFree ? "Free" : formatINRFromPaise(priceInPaise),
    isFree,
    hasAccess:
      raw?.hasAccess === true ||
      raw?.has_access === true ||
      raw?.isEnrolled === true ||
      raw?.is_enrolled === true ||
      raw?.isPaid === true ||
      raw?.is_paid === true,
    trainerInstructions: raw?.trainerInstructions || raw?.trainer_instructions || "",
    raw,
  };
}

function isTrainerSessionRecord(raw = {}) {
  const source = String(raw?.source || raw?.type || raw?.sessionType || "").trim().toLowerCase();
  return (
    raw?.createdByTrainer === true ||
    raw?.isTrainerSession === true ||
    source === "trainer" ||
    source === "trainer_session" ||
    raw?.trainerId != null ||
    raw?.trainer_id != null ||
    raw?.trainerName != null ||
    raw?.trainer_name != null ||
    raw?.trainerEmail != null ||
    raw?.trainer_email != null ||
    raw?.trainer != null
  );
}

function sortByScheduleAsc(a, b) {
  return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
}

export async function getLiveClasses() {
  try {
    const res = await axiosClient.get("/api/student/live-classes");
    const payload = unwrap(res);
    const list = Array.isArray(payload.data) ? payload.data : [];
    return list
      .filter((item) => !isTrainerSessionRecord(item))
      .map(normalizeLiveClass)
      .filter((x) => x?.id != null)
      .sort(sortByScheduleAsc);
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to load live classes. Please try again."));
  }
}

export async function getTitClasses() {
  try {
    const res = await axiosClient.get("/api/student/tit-classes");
    const payload = unwrap(res);
    const list = Array.isArray(payload.data) ? payload.data : [];
    return list
      .filter((item) => {
        const status = String(item?.status || "").trim().toLowerCase();
        return !status || status === "published" || status === "upcoming" || status === "live" || status === "completed";
      })
      .map(normalizeTitClass)
      .filter((x) => x?.id != null)
      .sort(sortByScheduleAsc);
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to load TIT classes. Please try again."));
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
      meetUrl: getMeetingLink(payload),
      joinedAt: payload.data?.joinedAt || "",
      bookingId: payload.data?.bookingId || "",
      attendance: normalizeAttendance(payload.data?.attendance || payload.attendance || payload.data || {}),
    };
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to join class. Please try again."));
  }
}

import { axiosClient } from "../../shared/api/axiosClient";
import { getAxiosErrorMessage, getAxiosErrorStatus } from "../../shared/api/axiosError";
import { env } from "../../shared/config/env";
import { getDurationMinutes, toKolkataIso, toMs } from "../../live-classes/lib/time";

function unwrap(res) {
  const data = res?.data;
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
    payload?.meetingLink ||
    payload?.meetUrl ||
    payload?.meetLink ||
    payload?.meeting_link ||
    payload?.meeting_url ||
    payload?.meet_url ||
    payload?.joinLink ||
    payload?.joinUrl ||
    payload?.liveClassLink ||
    payload?.classLink ||
    payload?.googleMeetLink ||
    payload?.zoomLink ||
    data?.meetingLink ||
    data?.meetUrl ||
    data?.meetLink ||
    data?.meeting_link ||
    data?.meeting_url ||
    data?.meet_url ||
    data?.joinLink ||
    data?.joinUrl ||
    data?.liveClassLink ||
    data?.classLink ||
    data?.googleMeetLink ||
    data?.zoomLink ||
    session?.meetingLink ||
    session?.meetUrl ||
    session?.meetLink ||
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

function toAbsoluteAssetUrl(path) {
  const value = String(path || "").trim();
  if (!value) return "";
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  const baseUrl = String(env.apiBaseUrl || "").replace(/\/+$/, "");
  return `${baseUrl}/${value.replace(/^\/+/, "")}`;
}

function normalizeSession(raw = {}) {
  const category =
    raw.category ||
    raw.courseCategory ||
    raw.course_category ||
    raw.categoryName ||
    raw.category_name ||
    raw.course?.category ||
    raw.course?.categoryName ||
    "Trainer Courses";
  const cancellationReason =
    raw.cancellationReason ||
    raw.cancelReason ||
    raw.cancelledReason ||
    raw.cancelled_reason ||
    raw.reason ||
    "";
  const scheduledAt =
    toKolkataIso(raw.scheduledDate || raw.scheduled_date || raw.date, raw.startTime || raw.start_time) ||
    raw.scheduledAt ||
    raw.scheduled_at ||
    "";
  const endsAt =
    toKolkataIso(raw.scheduledDate || raw.scheduled_date || raw.date, raw.endTime || raw.end_time) ||
    raw.endsAt ||
    raw.ends_at ||
    "";
  const timeDuration = getDurationMinutes(raw.startTime || raw.start_time, raw.endTime || raw.end_time);
  const isoDuration =
    toMs(endsAt) > toMs(scheduledAt)
      ? Math.round((toMs(endsAt) - toMs(scheduledAt)) / 60000)
      : 0;
  const durationMinutes = timeDuration || isoDuration || Number(raw.durationMinutes) || 60;
  const meetingLink = getMeetingLink(raw);

  return {
    id: raw.id,
    thumbnail: toAbsoluteAssetUrl(raw.thumbnail || ""),
    thumbnailBg: "from-emerald-950 via-teal-800 to-cyan-600",
    category,
    tab: category,
    title: raw.courseTitle || raw.course?.title || raw.classTitle || raw.title || "Live session",
    classTitle: raw.classTitle || "",
    instructor: raw.trainerName || raw.trainer?.name || "Trainer",
    instructorName: raw.trainerName || raw.trainer?.name || "Trainer",
    description: raw.description || "",
    badge: raw.status === "published" ? "Live" : raw.status || "Session",
    badgeColor: "bg-emerald-100 text-emerald-900",
    rating: 4.8,
    ratingCount: "Live session",
    price: "₹0.00",
    oldPrice: null,
    hours: `${durationMinutes} min live class`,
    totalHours: durationMinutes,
    level: "All Levels",
    priceType: "Free",
    topic: category,
    popularity: 999999,
    dateAdded: scheduledAt || new Date().toISOString(),
    updated: raw.scheduledDate || "Published",
    createdByTrainer: true,
    isAddedToCard: !!raw.isAddedToCard,
    isJoined: !!raw.isJoined,
    isRecurring: raw.isRecurring ?? raw.is_recurring ?? raw.recurring ?? true,
    recurrenceType: raw.recurrenceType || raw.recurrence_type || raw.repeatType || "daily",
    cancellationReason,
    liveClass: {
      id: raw.id,
      courseId: raw.id,
      courseName: raw.courseTitle || raw.course?.title || "",
      title: raw.classTitle || raw.title || "",
      instructorName: raw.trainerName || raw.trainer?.name || "Trainer",
      description: raw.description || "",
      scheduledAt,
      endsAt,
      durationMinutes,
      meetUrl: meetingLink,
      thumbnail: toAbsoluteAssetUrl(raw.thumbnail || ""),
      status: raw.status || "",
      isRecurring: raw.isRecurring ?? raw.is_recurring ?? raw.recurring ?? true,
      recurrenceType: raw.recurrenceType || raw.recurrence_type || raw.repeatType || "daily",
      cancellationReason,
      isAddedToCard: !!raw.isAddedToCard,
      isJoined: !!raw.isJoined,
    },
    raw,
  };
}

export async function getStudentSessions() {
  try {
    const res = await axiosClient.get("/api/student/sessions");
    const payload = unwrap(res);
    const sessions = Array.isArray(payload.data) ? payload.data : [];
    return sessions.map(normalizeSession);
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to load learning sessions."));
  }
}

export async function getStudentSessionById(sessionId) {
  try {
    const res = await axiosClient.get(`/api/student/sessions/${encodeURIComponent(sessionId)}`);
    const payload = unwrap(res);
    return normalizeSession(payload.data || {});
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to load session details."));
  }
}

export async function getStudentSessionCards() {
  try {
    const res = await axiosClient.get("/api/student/me/session-cards");
    const payload = unwrap(res);
    const cards = Array.isArray(payload.data) ? payload.data : [];
    return cards.map((card) =>
      normalizeSession({
        id: card.sessionId,
        courseTitle: card.courseTitle,
        classTitle: card.classTitle,
        category: card.category,
        trainerName: card.trainerName,
        thumbnail: card.thumbnail,
        scheduledDate: card.scheduledDate,
        startTime: card.startTime,
        endTime: card.endTime,
        scheduledAt: card.scheduledAt,
        endsAt: card.endsAt,
        durationMinutes: card.durationMinutes,
        meetingLink: card.meetingLink || card.meetUrl || card.meetLink,
        status: card.status,
        cancellationReason: card.cancellationReason || card.cancelReason || card.reason || "",
        isAddedToCard: true,
      })
    );
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to load session cards."));
  }
}

export async function addStudentSessionCard(sessionId) {
  try {
    const path = `/api/student/sessions/${encodeURIComponent(sessionId)}/add-card`;
    let res;
    try {
      res = await axiosClient.post(path);
    } catch (firstErr) {
      if (firstErr?.response) throw firstErr;
      await new Promise((resolve) => setTimeout(resolve, 600));
      res = await axiosClient.post(path);
    }
    return unwrap(res);
  } catch (err) {
    const status = err?.response?.status;
    const message = String(err?.response?.data?.message || "").toLowerCase();
    if (status === 400 && /(already|exist|added|card)/i.test(message)) {
      return {
        success: true,
        message: err?.response?.data?.message || "Session is already in your card.",
        alreadyAdded: true,
      };
    }
    throw new Error(getAxiosErrorMessage(err, "Unable to add session card."));
  }
}

export async function joinStudentSession(sessionId) {
  const loadMeetingLinkFromDetails = async () => {
    try {
      const detailRes = await axiosClient.get(`/api/student/sessions/${encodeURIComponent(sessionId)}`);
      const detailPayload = unwrap(detailRes);
      const detail = normalizeSession(detailPayload.data || {});
      return detail?.liveClass?.meetUrl || getMeetingLink(detailPayload);
    } catch {
      return "";
    }
  };

  try {
    const res = await axiosClient.post(
      `/api/student/sessions/${encodeURIComponent(sessionId)}/join`
    );
    const payload = unwrap(res);
    const meetingLink = getMeetingLink(payload) || (await loadMeetingLinkFromDetails());
    return {
      message: payload.message || "",
      meetingLink,
      joinedAt: payload.data?.joinedAt || "",
    };
  } catch (err) {
    const status = getAxiosErrorStatus(err);
    const message = getAxiosErrorMessage(err, "Unable to join session.");
    if (status === 400 && /(already|joined|registered|booked)/i.test(message)) {
      const meetingLink = getMeetingLink(err?.response?.data) || (await loadMeetingLinkFromDetails());
      return {
        message,
        meetingLink,
        joinedAt: err?.response?.data?.data?.joinedAt || "",
        alreadyJoined: true,
      };
    }
    throw new Error(getAxiosErrorMessage(err, "Unable to join session."));
  }
}

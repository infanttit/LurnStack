import { axiosClient } from "../../shared/api/axiosClient";
import { getAxiosErrorMessage } from "../../shared/api/axiosError";
import { env } from "../../shared/config/env";

function unwrap(res) {
  const data = res?.data;
  if (data?.success === false) throw new Error(data?.message || "Request failed");
  if (data?.success === true) return data;
  if (data && typeof data === "object" && "data" in data) return data;
  throw new Error(data?.message || "Request failed");
}

function toAbsoluteAssetUrl(path) {
  const value = String(path || "").trim();
  if (!value) return "";
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  const baseUrl = String(env.apiBaseUrl || "").replace(/\/+$/, "");
  return `${baseUrl}/${value.replace(/^\/+/, "")}`;
}

function normalizeSession(raw = {}) {
  const cancellationReason =
    raw.cancellationReason ||
    raw.cancelReason ||
    raw.cancelledReason ||
    raw.cancelled_reason ||
    raw.reason ||
    "";
  return {
    id: raw.id,
    thumbnail: toAbsoluteAssetUrl(raw.thumbnail || ""),
    thumbnailBg: "from-emerald-950 via-teal-800 to-cyan-600",
    category: raw.category || "Trainer Courses",
    tab: raw.category || "Trainer Courses",
    title: raw.courseTitle || raw.classTitle || "Live session",
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
    hours: `${Number(raw.durationMinutes) || 60} min live class`,
    totalHours: Number(raw.durationMinutes) || 60,
    level: "All Levels",
    priceType: "Free",
    topic: raw.category || "Trainer Courses",
    popularity: 999999,
    dateAdded: raw.scheduledAt || new Date().toISOString(),
    updated: raw.scheduledDate || "Published",
    createdByTrainer: true,
    isAddedToCard: !!raw.isAddedToCard,
    isJoined: !!raw.isJoined,
    cancellationReason,
    liveClass: {
      id: raw.id,
      courseId: raw.id,
      courseName: raw.courseTitle || "",
      title: raw.classTitle || "",
      instructorName: raw.trainerName || raw.trainer?.name || "Trainer",
      description: raw.description || "",
      scheduledAt: raw.scheduledAt || "",
      endsAt: raw.endsAt || "",
      durationMinutes: Number(raw.durationMinutes) || 60,
      meetUrl: raw.meetingLink || "",
      thumbnail: toAbsoluteAssetUrl(raw.thumbnail || ""),
      status: raw.status || "",
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
        scheduledAt: card.scheduledAt,
        endsAt: card.endsAt,
        durationMinutes: card.durationMinutes,
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
  try {
    const res = await axiosClient.post(
      `/api/student/sessions/${encodeURIComponent(sessionId)}/join`
    );
    const payload = unwrap(res);
    return {
      message: payload.message || "",
      meetingLink: payload.data?.meetingLink || "",
      joinedAt: payload.data?.joinedAt || "",
    };
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to join session."));
  }
}

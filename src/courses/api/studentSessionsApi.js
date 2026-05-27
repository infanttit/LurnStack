import { axiosClient } from "../../shared/api/axiosClient";
import { getAxiosErrorMessage, getAxiosErrorStatus } from "../../shared/api/axiosError";
import { env } from "../../shared/config/env";
import { getDurationMinutes, toKolkataIso, toMs } from "../../live-classes/lib/time";
import { normalizeAttendance } from "./studentAttendanceApi";

const PAID_SESSION_ACCESS_KEY = "lurnstack:paid-session-access:v1";

function isBrowserOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

function unwrap(res) {
  const data = res?.data;
  if (data?.success === false) throw new Error(data?.message || "Request failed");
  if (data?.success === true) return data;
  if (data && typeof data === "object" && "data" in data) return data;
  throw new Error(data?.message || "Request failed");
}

function readPaidSessionAccess() {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PAID_SESSION_ACCESS_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function hasPaidSessionAccess(sessionId) {
  const id = String(sessionId || "").trim();
  if (!id) return false;
  return !!readPaidSessionAccess()[id];
}

export function rememberPaidSessionAccess(sessionId) {
  const id = String(sessionId || "").trim();
  if (!id || typeof window === "undefined") return;
  try {
    const current = readPaidSessionAccess();
    window.localStorage.setItem(
      PAID_SESSION_ACCESS_KEY,
      JSON.stringify({
        ...current,
        [id]: {
          paidAt: new Date().toISOString(),
          accessScope: "session",
        },
      })
    );
  } catch {
    // Local persistence is a convenience only; backend remains the source of truth.
  }
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

function toAmountPaise(raw = {}) {
  const paise =
    raw.amountPaise ??
    raw.amount_paise ??
    raw.pricePaise ??
    raw.price_paise ??
    raw.sessionPricePaise ??
    raw.session_price_paise;
  const paiseNumber = Number(paise);
  if (Number.isFinite(paiseNumber) && paiseNumber >= 0) return Math.round(paiseNumber);

  const rupees = raw.amount ?? raw.price ?? raw.sessionPrice ?? raw.session_price;
  const rupeeNumber = Number(String(rupees ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(rupeeNumber) && rupeeNumber > 0 ? Math.round(rupeeNumber * 100) : 0;
}

function formatINRFromPaise(amountPaise) {
  const amount = Number(amountPaise || 0);
  if (!amount) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: amount % 100 === 0 ? 0 : 2,
  }).format(amount / 100);
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
  const amountPaise = toAmountPaise(raw);
  const recurringValue = raw.isRecurring ?? raw.is_recurring ?? raw.recurring;
  const recurrenceType = raw.recurrenceType || raw.recurrence_type || raw.repeatType || "";
  const bookingStatus = raw.bookingStatus || raw.booking_status || raw.booking?.status || "";
  const paymentStatus = raw.paymentStatus || raw.payment_status || raw.payment?.status || "";
  const isPaid =
    raw.isPaid === true ||
    raw.paid === true ||
    bookingStatus === "paid" ||
    paymentStatus === "captured" ||
    paymentStatus === "paid" ||
    hasPaidSessionAccess(raw.id);
  const paymentRequired = raw.paymentRequired ?? raw.payment_required ?? amountPaise > 0;
  const currency = raw.currency || "INR";

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
    oldPrice: null,
    amountPaise,
    currency,
    paymentRequired: !!paymentRequired,
    isPaid,
    bookingStatus,
    paymentStatus,
    price: formatINRFromPaise(amountPaise),
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
    isRecurring: recurringValue,
    recurrenceType,
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
      isRecurring: recurringValue,
      recurrenceType,
      cancellationReason,
      isAddedToCard: !!raw.isAddedToCard,
      isJoined: !!raw.isJoined,
      amountPaise,
      currency,
      paymentRequired: !!paymentRequired,
      isPaid,
      bookingStatus,
      paymentStatus,
    },
    raw,
  };
}

function normalizeBookingPayload(payload = {}) {
  const source = payload.data || payload || {};
  return {
    bookingId: source.bookingId || source.booking_id || source.id || "",
    razorpayOrderId: source.razorpayOrderId || source.razorpay_order_id || source.orderId || source.order_id || "",
    amountPaise: toAmountPaise(source),
    currency: source.currency || "INR",
    keyId: source.keyId || source.key_id || source.razorpayKeyId || source.razorpay_key_id || "",
    student: {
      name: source.student?.name || source.studentName || source.name || "",
      email: source.student?.email || source.studentEmail || source.email || "",
      phone: source.student?.phone || source.studentPhone || source.phone || "",
    },
    alreadyPaid:
      source.alreadyPaid === true ||
      source.isPaid === true ||
      source.paid === true ||
      source.bookingStatus === "paid" ||
      source.booking_status === "paid" ||
      source.paymentStatus === "paid" ||
      source.payment_status === "paid",
  };
}

export async function getStudentSessions() {
  if (isBrowserOffline()) return [];
  try {
    const res = await axiosClient.get("/api/student/sessions");
    const payload = unwrap(res);
    const sessions = Array.isArray(payload.data) ? payload.data : [];
    return sessions.map(normalizeSession);
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to load learning sessions."));
  }
}

export async function getPublicSessions() {
  if (isBrowserOffline()) return [];
  try {
    const res = await axiosClient.get("/api/sessions");
    const payload = unwrap(res);
    const sessions = Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.sessions)
        ? payload.sessions
        : Array.isArray(payload)
          ? payload
          : [];
    return sessions.map(normalizeSession);
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to load published sessions."));
  }
}

export async function getPublicSessionById(sessionId) {
  if (isBrowserOffline()) throw new Error("You are offline. Session details are unavailable right now.");
  try {
    const res = await axiosClient.get(`/api/sessions/${encodeURIComponent(sessionId)}`);
    const payload = unwrap(res);
    return normalizeSession(payload.data || payload.session || {});
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to load session details."));
  }
}

export async function getStudentSessionById(sessionId) {
  if (isBrowserOffline()) throw new Error("You are offline. Session details are unavailable right now.");
  try {
    const res = await axiosClient.get(`/api/student/sessions/${encodeURIComponent(sessionId)}`);
    const payload = unwrap(res);
    return normalizeSession(payload.data || {});
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to load session details."));
  }
}

export async function getStudentSessionCards() {
  if (isBrowserOffline()) return [];
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
  if (isBrowserOffline()) throw new Error("You are offline. Please reconnect and try again.");
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

export async function createStudentSessionBooking(sessionId, { sessionDate = "" } = {}) {
  if (isBrowserOffline()) throw new Error("You are offline. Payment cannot be started right now.");
  try {
    const res = await axiosClient.post(`/api/student/sessions/${encodeURIComponent(sessionId)}/bookings`, {
      sessionDate,
      accessScope: "session",
    });
    return normalizeBookingPayload(unwrap(res));
  } catch (err) {
    const status = getAxiosErrorStatus(err);
    const message = getAxiosErrorMessage(err, "");
    if ((status === 400 || status === 409) && /(already|paid|purchased|booked|active access)/i.test(message)) {
      rememberPaidSessionAccess(sessionId);
      return {
        bookingId: "",
        razorpayOrderId: "",
        amountPaise: 0,
        currency: "INR",
        keyId: "",
        student: {},
        alreadyPaid: true,
      };
    }
    throw new Error(getAxiosErrorMessage(err, "Unable to start payment. Please try again."));
  }
}

export async function verifyRazorpayPayment({
  bookingId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) {
  if (isBrowserOffline()) throw new Error("You are offline. Payment verification cannot be completed right now.");
  try {
    const res = await axiosClient.post("/api/student/payments/razorpay/verify", {
      bookingId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });
    const payload = unwrap(res);
    const sessionId = payload.data?.sessionId || payload.data?.session_id || payload.sessionId || payload.session_id || "";
    if (sessionId) rememberPaidSessionAccess(sessionId);
    return payload.data || payload;
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Payment verification failed. Please contact support if amount was deducted."));
  }
}

export async function getStudentPayments() {
  if (isBrowserOffline()) return [];
  try {
    const res = await axiosClient.get("/api/student/payments");
    const payload = unwrap(res);
    return Array.isArray(payload.data) ? payload.data : [];
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to load payment history."));
  }
}

export async function joinStudentSession(
  sessionId,
  { sessionDate = "", scheduledAt = "", startsAt = "", endsAt = "" } = {}
) {
  if (isBrowserOffline()) throw new Error("You are offline. Session join is unavailable right now.");
  const id = String(sessionId || "").trim();
  if (!id) throw new Error("Missing session id");
  const requestBody = sessionDate
    ? {
        sessionDate,
        occurrenceDate: sessionDate,
        scheduledAt: scheduledAt || startsAt || "",
        startsAt: startsAt || scheduledAt || "",
        endsAt: endsAt || "",
        clientJoinedAt: new Date().toISOString(),
      }
    : undefined;

  const loadMeetingLinkFromDetails = async () => {
    const detailEndpoints = [
      `/api/student/sessions/${encodeURIComponent(id)}`,
      `/api/sessions/${encodeURIComponent(id)}`,
    ];

    for (const endpoint of detailEndpoints) {
      try {
        const detailRes = await axiosClient.get(endpoint);
        const detailPayload = unwrap(detailRes);
        const detail = normalizeSession(detailPayload.data || {});
        return detail?.liveClass?.meetUrl || getMeetingLink(detailPayload);
      } catch {
        // Try the next supported backend route.
      }
    }
    return "";
  };

  const joinEndpoints = [
    `/api/student/sessions/${encodeURIComponent(id)}/join`,
    `/api/sessions/${encodeURIComponent(id)}/join`,
    `/api/student/join-class/${encodeURIComponent(id)}`,
  ];

  let lastErr = null;

  for (const endpoint of joinEndpoints) {
    try {
      const res = await axiosClient.post(endpoint, requestBody);
      const responsePayload = unwrap(res);
      const meetingLink = getMeetingLink(responsePayload) || (await loadMeetingLinkFromDetails());
      return {
        message: responsePayload.message || "",
        meetingLink,
        joinedAt: responsePayload.data?.joinedAt || "",
        attendance: normalizeAttendance(responsePayload.data?.attendance || responsePayload.attendance || responsePayload.data || {}),
      };
    } catch (err) {
      const status = getAxiosErrorStatus(err);
      const message = getAxiosErrorMessage(err, "Unable to join session.");
      if (status === 400 && /(already|joined|registered|booked|booking)/i.test(message)) {
        const meetingLink = getMeetingLink(err?.response?.data) || (await loadMeetingLinkFromDetails());
        return {
          message,
          meetingLink,
          joinedAt: err?.response?.data?.data?.joinedAt || "",
          attendance: normalizeAttendance(
            err?.response?.data?.data?.attendance ||
              err?.response?.data?.attendance ||
              err?.response?.data?.data ||
              {}
          ),
          alreadyJoined: true,
        };
      }
      lastErr = err;

      // Route not available in this backend version; try the next supported route.
      if (status === 404 || status === 405) continue;
      if (status === 400 && /no active session occurrence/i.test(message)) continue;

      // Network/transient issue on the newer route can still be recovered by the
      // documented legacy route below.
      if (!status && endpoint !== joinEndpoints[joinEndpoints.length - 1]) continue;

      break;
    }
  }

  throw new Error(getAxiosErrorMessage(lastErr, "Unable to join session."));
}

export async function heartbeatStudentSession(
  sessionId,
  { sessionDate = "", scheduledAt = "", startsAt = "", endsAt = "" } = {}
) {
  if (isBrowserOffline()) return null;
  const id = String(sessionId || "").trim();
  if (!id) return null;
  try {
    const res = await axiosClient.post(`/api/student/sessions/${encodeURIComponent(id)}/heartbeat`, {
      sessionDate,
      occurrenceDate: sessionDate,
      scheduledAt: scheduledAt || startsAt || "",
      startsAt: startsAt || scheduledAt || "",
      endsAt: endsAt || "",
      clientHeartbeatAt: new Date().toISOString(),
    });
    const payload = unwrap(res);
    return normalizeAttendance(payload.data?.attendance || payload.attendance || payload.data || {});
  } catch {
    return null;
  }
}

export async function leaveStudentSession(
  sessionId,
  { sessionDate = "", scheduledAt = "", startsAt = "", endsAt = "" } = {}
) {
  if (isBrowserOffline()) return null;
  const id = String(sessionId || "").trim();
  if (!id) return null;
  try {
    const res = await axiosClient.post(`/api/student/sessions/${encodeURIComponent(id)}/leave`, {
      sessionDate,
      occurrenceDate: sessionDate,
      scheduledAt: scheduledAt || startsAt || "",
      startsAt: startsAt || scheduledAt || "",
      endsAt: endsAt || "",
      clientLeftAt: new Date().toISOString(),
    });
    const payload = unwrap(res);
    return normalizeAttendance(payload.data?.attendance || payload.attendance || payload.data || {});
  } catch {
    return null;
  }
}

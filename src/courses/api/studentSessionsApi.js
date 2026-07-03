import { axiosClient } from "../../shared/api/axiosClient";
import { getAxiosErrorMessage, getAxiosErrorStatus } from "../../shared/api/axiosError";
import { env } from "../../shared/config/env";
import { getDurationMinutes, toKolkataIso, toMs } from "../../live-classes/lib/time";
import { normalizeAttendance } from "./studentAttendanceApi";
import { formatDecimalHours } from "../../shared/utils/durationFormatter";

const PAID_SESSION_ACCESS_KEY = "lurnstack:paid-session-access:v1";
const PAID_COURSE_ACCESS_KEY = "lurnstack:paid-course-access:v1";

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

function readPaidCourseAccess() {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PAID_COURSE_ACCESS_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getCourseAccessId(source = {}) {
  const raw = source?.raw || source || {};
  const course = raw.course || raw.Course || source?.course || source?.Course || {};
  const liveClass = raw.liveClass || raw.live_class || source?.liveClass || {};
  const value =
    raw.courseAccessId ||
    raw.course_access_id ||
    raw.accessCourseId ||
    raw.access_course_id ||
    raw.trainerCourseId ||
    raw.trainer_course_id ||
    raw.parentCourseId ||
    raw.parent_course_id ||
    raw.batchCourseId ||
    raw.batch_course_id ||
    raw.batchId ||
    raw.batch_id ||
    raw.courseId ||
    raw.course_id ||
    course.id ||
    course._id ||
    course.courseId ||
    course.course_id ||
    course.trainerCourseId ||
    course.trainer_course_id ||
    liveClass.courseAccessId ||
    liveClass.course_access_id ||
    liveClass.courseId ||
    liveClass.course_id ||
    source.courseAccessId ||
    source.courseId ||
    source.trainerCourseId ||
    "";
  return String(value || "").trim();
}

export function hasPaidSessionAccess(sessionId) {
  const id = String(sessionId || "").trim();
  if (!id) return false;
  return !!readPaidSessionAccess()[id];
}

export function hasPaidCourseAccess(courseId) {
  const id = String(courseId || "").trim();
  if (!id) return false;
  return !!readPaidCourseAccess()[id];
}

export function hasPaidAccessForSession(session = {}) {
  return (
    hasPaidCourseAccess(getCourseAccessId(session)) ||
    hasPaidSessionAccess(session?.id || session?.sessionId || session?.liveClass?.id)
  );
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

export function rememberPaidCourseAccess(courseId, { sessionId = "" } = {}) {
  const id = String(courseId || "").trim();
  if (!id || typeof window === "undefined") return;
  try {
    const current = readPaidCourseAccess();
    window.localStorage.setItem(
      PAID_COURSE_ACCESS_KEY,
      JSON.stringify({
        ...current,
        [id]: {
          paidAt: new Date().toISOString(),
          accessScope: "course",
          sessionId: String(sessionId || "").trim(),
        },
      })
    );
  } catch {
    // Backend access remains authoritative; this only keeps the UI in sync after payment.
  }
}

export function rememberPaidAccessForSession(session = {}) {
  const sessionId = String(session?.id || session?.sessionId || session?.liveClass?.id || "").trim();
  const courseId = getCourseAccessId(session);
  if (sessionId) rememberPaidSessionAccess(sessionId);
  if (courseId) rememberPaidCourseAccess(courseId, { sessionId });
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
  const id =
    raw.id ??
    raw._id ??
    raw.sessionId ??
    raw.session_id ??
    raw.liveClassId ??
    raw.live_class_id ??
    raw.courseId ??
    raw.course_id ??
    "";
  const courseAccessId = getCourseAccessId({ ...raw, id });
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
  const recurringDays = raw.recurringDays ?? raw.recurring_days ?? null;
  const recurrenceEndDate = raw.recurrenceEndDate ?? raw.recurrence_end_date ?? null;
  const recurrenceType = raw.recurrenceType || raw.recurrence_type || raw.repeatType || "";
  const bookingStatus = raw.bookingStatus || raw.booking_status || raw.booking?.status || "";
  const paymentStatus = raw.paymentStatus || raw.payment_status || raw.payment?.status || "";
  const pricingState = String(raw.pricingState || raw.pricing_state || "").trim().toUpperCase();
  const isFree =
    raw.isFree === true ||
    raw.is_free === true ||
    pricingState === "FREE" ||
    amountPaise <= 0;
  const isPaid =
    raw.isPaid === true ||
    raw.hasCourseAccess === true ||
    raw.has_course_access === true ||
    raw.courseAccess === true ||
    raw.course_access === true ||
    raw.paid === true ||
    bookingStatus === "paid" ||
    paymentStatus === "captured" ||
    paymentStatus === "paid" ||
    hasPaidCourseAccess(courseAccessId) ||
    hasPaidSessionAccess(id);
  const paymentRequiredRaw = raw.paymentRequired ?? raw.payment_required ?? amountPaise > 0;
  const paymentRequired = amountPaise > 0 && !isFree && !!paymentRequiredRaw && pricingState !== "FREE";
  const currency = raw.currency || "INR";
  const trainerInstructions = raw.trainerInstructions ?? raw.trainer_instructions ?? "";

  return {
    id,
    courseAccessId,
    courseId: courseAccessId,
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
    isFree,
    priceINR: raw.priceINR || raw.priceInR || raw.price_inr || "",
    currency,
    paymentRequired: !!paymentRequired,
    isPaid,
    pricingState,
    bookingStatus,
    paymentStatus,
    price: formatINRFromPaise(amountPaise),
    hours: raw.totalHours ? `${formatDecimalHours(raw.totalHours)} total` : `${durationMinutes} min live class`,
    totalHours: raw.totalHours !== undefined && raw.totalHours !== null ? Number(raw.totalHours) : null,
    totalDays: raw.totalDays !== undefined && raw.totalDays !== null ? Number(raw.totalDays) : null,
    completedHours: raw.completedHours !== undefined && raw.completedHours !== null ? Number(raw.completedHours) : null,
    completedDays: raw.completedDays !== undefined && raw.completedDays !== null ? Number(raw.completedDays) : null,
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
    recurringDays,
    recurring_days: recurringDays,
    recurrenceEndDate,
    recurrence_end_date: recurrenceEndDate,
    recurrenceType,
    cancellationReason,
    trainerInstructions,
    liveClass: {
      id,
      courseId: courseAccessId || id,
      courseAccessId,
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
      recurringDays,
      recurring_days: recurringDays,
      recurrenceEndDate,
      recurrence_end_date: recurrenceEndDate,
      recurrenceType,
      cancellationReason,
      isAddedToCard: !!raw.isAddedToCard,
      isJoined: !!raw.isJoined,
      amountPaise,
      currency,
      paymentRequired: !!paymentRequired,
      isPaid,
      pricingState,
      bookingStatus,
      paymentStatus,
      trainerInstructions,
    },
    raw,
  };
}

function normalizeBookingPayload(payload = {}) {
  const source = payload.data || payload || {};
  const sessionId = source.sessionId || source.session_id || source.liveClassId || source.live_class_id || "";
  const courseAccessId = getCourseAccessId(source);
  return {
    bookingId: source.bookingId || source.booking_id || source.id || "",
    sessionId,
    courseAccessId,
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

export async function getPublicUpcomingSessions() {
  if (isBrowserOffline()) return [];
  const endpoints = ["/api/sessions/upcoming", "/api/sessions"];
  let lastErr = null;

  for (const endpoint of endpoints) {
    try {
      const res = await axiosClient.get(endpoint);
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
      lastErr = err;
      const status = getAxiosErrorStatus(err);
      if (status === 404 || status === 405) continue;
      break;
    }
  }

  throw new Error(getAxiosErrorMessage(lastErr, "Unable to load upcoming sessions."));
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
        courseId: card.courseId || card.course_id || card.trainerCourseId || card.trainer_course_id,
        courseAccessId: card.courseAccessId || card.course_access_id,
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

export async function createStudentSessionBooking(sessionId, { sessionDate = "", courseId = "", offerId = "" } = {}) {
  if (isBrowserOffline()) throw new Error("You are offline. Payment cannot be started right now.");
  const safeCourseId = String(courseId || "").trim();
  const safeSessionDate = String(sessionDate || "").trim();
  const safeOfferId = String(offerId || "").trim();
  const createBooking = (accessScope) => {
    const payload = {
      accessScope,
    };
    if (safeSessionDate) {
      payload.sessionDate = safeSessionDate;
    }
    if (accessScope === "course" && safeCourseId) {
      payload.courseId = safeCourseId;
    }
    if (safeOfferId) {
      payload.offerId = safeOfferId;
    }
    console.log("Creating booking with payload:", payload);
    return axiosClient.post(`/api/student/sessions/${encodeURIComponent(sessionId)}/bookings`, payload);
  };


  try {
    const res = await createBooking(safeCourseId ? "course" : "session");
    const parsed = normalizeBookingPayload(unwrap(res));
    console.log("Booking response parsed:", parsed);
    return parsed;
  } catch (err) {
    let finalErr = err;
    const status = getAxiosErrorStatus(err);
    const message = getAxiosErrorMessage(err, "");
    const canFallbackToSession =
      safeCourseId &&
      (status === 400 || status === 404 || status === 405 || status === 422) &&
      /(accessScope|access scope|courseId|course id|scope|invalid|not supported|unknown)/i.test(message);

    if (canFallbackToSession) {
      try {
        const res = await createBooking("session");
        return normalizeBookingPayload(unwrap(res));
      } catch (fallbackErr) {
        finalErr = fallbackErr;
      }
    }

    const finalStatus = getAxiosErrorStatus(finalErr);
    const finalMessage = getAxiosErrorMessage(finalErr, "");
    if (
      (finalStatus === 400 || finalStatus === 409) &&
      /(already|paid|purchased|booked|active access)/i.test(finalMessage)
    ) {
      rememberPaidSessionAccess(sessionId);
      if (safeCourseId) rememberPaidCourseAccess(safeCourseId, { sessionId });
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
    throw new Error(getAxiosErrorMessage(finalErr, "Unable to start payment. Please try again."));
  }
}

export async function verifyRazorpayPayment({
  bookingId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  sessionId: requestedSessionId = "",
  courseId: requestedCourseId = "",
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
    const sessionId =
      payload.data?.sessionId ||
      payload.data?.session_id ||
      payload.sessionId ||
      payload.session_id ||
      requestedSessionId ||
      "";
    const courseId = getCourseAccessId(payload.data || payload) || requestedCourseId;
    if (sessionId) rememberPaidSessionAccess(sessionId);
    if (courseId) rememberPaidCourseAccess(courseId, { sessionId });
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
  const requestBody = {
    sessionId: id,
    liveClassId: id,
    courseId: id,
    trainerClassId: id,
    ...(sessionDate
      ? {
          sessionDate,
          occurrenceDate: sessionDate,
          scheduledAt: scheduledAt || startsAt || "",
          startsAt: startsAt || scheduledAt || "",
          endsAt: endsAt || "",
        }
      : {}),
    clientJoinedAt: new Date().toISOString(),
  };

  const loadMeetingLinkFromDetails = async () => {
    const detailEndpoints = [
      `/api/student/sessions/${encodeURIComponent(id)}`,
      `/api/student/live-classes/${encodeURIComponent(id)}`,
      `/api/sessions/${encodeURIComponent(id)}`,
      `/api/live-classes/${encodeURIComponent(id)}`,
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
    `/api/student/live-classes/${encodeURIComponent(id)}/join`,
    `/api/sessions/${encodeURIComponent(id)}/join`,
    `/api/live-classes/${encodeURIComponent(id)}/join`,
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
        bookingId: responsePayload.data?.bookingId || responsePayload.bookingId || "",
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
          bookingId: err?.response?.data?.data?.bookingId || err?.response?.data?.bookingId || "",
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
      if (status >= 500 && endpoint !== joinEndpoints[joinEndpoints.length - 1]) continue;

      break;
    }
  }

  throw new Error(getAxiosErrorMessage(lastErr, "Unable to join session."));
}

export async function heartbeatStudentSession(
  sessionId,
  { sessionDate = "", scheduledAt = "", startsAt = "", endsAt = "", bookingId = "", joinedAt = "" } = {}
) {
  if (isBrowserOffline()) return null;
  const id = String(sessionId || "").trim();
  if (!id) return null;

  const body = {
    sessionId: id,
    liveClassId: id,
    courseId: id,
    trainerClassId: id,
    bookingId,
    sessionDate,
    occurrenceDate: sessionDate,
    scheduledAt: scheduledAt || startsAt || "",
    startsAt: startsAt || scheduledAt || "",
    endsAt: endsAt || "",
    joinedAt,
    clientHeartbeatAt: new Date().toISOString(),
  };

  const endpoints = [
    `/api/student/sessions/${encodeURIComponent(id)}/heartbeat`,
    `/api/student/live-classes/${encodeURIComponent(id)}/heartbeat`,
    `/api/sessions/${encodeURIComponent(id)}/heartbeat`,
    `/api/live-classes/${encodeURIComponent(id)}/heartbeat`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await axiosClient.post(endpoint, body);
      const payload = unwrap(res);
      return normalizeAttendance(payload.data?.attendance || payload.attendance || payload.data || {});
    } catch (err) {
      const status = getAxiosErrorStatus(err);
      if (status === 404 || status === 405) continue;
      return null;
    }
  }
  return null;
}

export async function leaveStudentSession(
  sessionId,
  { sessionDate = "", scheduledAt = "", startsAt = "", endsAt = "", bookingId = "", joinedAt = "" } = {}
) {
  if (isBrowserOffline()) return null;
  const id = String(sessionId || "").trim();
  if (!id) return null;

  const body = {
    sessionId: id,
    liveClassId: id,
    courseId: id,
    trainerClassId: id,
    bookingId,
    sessionDate,
    occurrenceDate: sessionDate,
    scheduledAt: scheduledAt || startsAt || "",
    startsAt: startsAt || scheduledAt || "",
    endsAt: endsAt || "",
    joinedAt,
    clientLeftAt: new Date().toISOString(),
  };

  const endpoints = [
    `/api/student/sessions/${encodeURIComponent(id)}/leave`,
    `/api/student/live-classes/${encodeURIComponent(id)}/leave`,
    `/api/sessions/${encodeURIComponent(id)}/leave`,
    `/api/live-classes/${encodeURIComponent(id)}/leave`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await axiosClient.post(endpoint, body);
      const payload = unwrap(res);
      return normalizeAttendance(payload.data?.attendance || payload.attendance || payload.data || {});
    } catch (err) {
      const status = getAxiosErrorStatus(err);
      if (status === 404 || status === 405) continue;
      return null;
    }
  }
  return null;
}

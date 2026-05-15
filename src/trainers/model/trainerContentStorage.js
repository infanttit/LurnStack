const TRAINER_CONTENT_KEY = "lurnstack:trainer-content:v1";

const fallbackContent = {
  courses: [],
  liveClasses: [],
};

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function readContent() {
  if (typeof window === "undefined") return fallbackContent;
  const parsed = safeParse(window.localStorage.getItem(TRAINER_CONTENT_KEY));
  if (!parsed || typeof parsed !== "object") return fallbackContent;
  return {
    courses: Array.isArray(parsed.courses) ? parsed.courses : [],
    liveClasses: Array.isArray(parsed.liveClasses) ? parsed.liveClasses : [],
  };
}

function writeContent(content) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TRAINER_CONTENT_KEY, JSON.stringify(content));
}

function toKolkataIso(date, time) {
  const d = String(date || "").trim();
  const t = String(time || "").trim();
  if (!d || !t) return "";
  return `${d}T${t}:00+05:30`;
}

function addMinutesToKolkataIso(date, time, minutes) {
  const start = toKolkataIso(date, time);
  const startDate = new Date(start);
  const duration = Number(minutes) || 60;
  if (!start || Number.isNaN(startDate.getTime())) return "";
  return new Date(startDate.getTime() + duration * 60 * 1000).toISOString();
}

export function getTrainerCourses() {
  return readContent().courses;
}

export function getTrainerLiveClasses() {
  return readContent().liveClasses;
}

export function getTrainerCourseById(courseId) {
  const id = String(courseId || "");
  return getTrainerCourses().find((course) => String(course.id) === id) || null;
}

export function getTrainerLiveClassesByCourse(courseId) {
  const id = String(courseId || "");
  return getTrainerLiveClasses().filter((liveClass) => String(liveClass.courseId) === id);
}

export function saveTrainerCourseLiveClass({
  trainer,
  courseTitle,
  category,
  description,
  classTitle,
  scheduledDate,
  scheduledTime,
  durationMinutes,
  meetUrl,
  price,
  thumbnail,
}) {
  const content = readContent();
  const createdAt = new Date().toISOString();
  const uid = `${Date.now()}`;
  const courseId = `trainer-course-${uid}`;
  const liveClassId = `trainer-class-${uid}`;
  const trainerName = trainer?.fullName || "Trainer";
  const tab = category || "Trainer Courses";

  const course = {
    id: courseId,
    tab,
    thumbnail: thumbnail || null,
    thumbnailBg: "from-emerald-950 via-teal-800 to-cyan-600",
    title: String(courseTitle || "").trim(),
    instructor: trainerName,
    badge: "Live",
    badgeColor: "bg-emerald-100 text-emerald-900",
    rating: 4.8,
    ratingCount: "New trainer course",
    price: price ? `₹${Number(price).toFixed(2)}` : "₹499.00",
    oldPrice: null,
    hours: `${Number(durationMinutes) || 60} min live class`,
    level: "All Levels",
    updated: "Trainer upload",
    description: String(description || "").trim(),
    bullets: [
      "Attend a trainer-led live class",
      "Ask questions during the scheduled session",
      "Access the class from the student live classes area",
    ],
    createdByTrainer: true,
    trainerEmail: trainer?.email || "",
    createdAt,
  };

  const liveClass = {
    id: liveClassId,
    courseId,
    courseName: course.title,
    courseThumbnailBg: course.thumbnailBg,
    title: String(classTitle || "").trim(),
    instructorName: trainerName,
    description: course.description,
    scheduledAt: toKolkataIso(scheduledDate, scheduledTime),
    endsAt: addMinutesToKolkataIso(scheduledDate, scheduledTime, durationMinutes),
    durationMinutes: Number(durationMinutes) || 60,
    meetUrl: String(meetUrl || "").trim(),
    thumbnail: thumbnail || null,
    trainerEmail: trainer?.email || "",
    createdAt,
  };

  const next = {
    courses: [course, ...content.courses],
    liveClasses: [liveClass, ...content.liveClasses],
  };
  writeContent(next);
  return { course, liveClass };
}

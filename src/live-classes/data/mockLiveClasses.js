function minutesFromNow(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

export const MOCK_ENROLLED_COURSES = [
  {
    id: "course-react-2026",
    name: "React Masterclass",
    thumbnailBg: "from-indigo-900 via-violet-700 to-fuchsia-500",
    instructor: "Alex Johnson",
  },
  {
    id: "course-node-bootcamp",
    name: "Node.js + Express Bootcamp",
    thumbnailBg: "from-slate-900 via-emerald-800 to-teal-500",
    instructor: "Priya Sharma",
  },
];

export const MOCK_UPCOMING_CLASSES = [
  {
    id: "class-001",
    courseId: "course-react-2026",
    courseName: "React Masterclass",
    courseThumbnailBg: "from-indigo-900 via-violet-700 to-fuchsia-500",
    title: "Advanced React Hooks",
    instructorName: "Alex Johnson",
    scheduledAt: minutesFromNow(25),
    durationMinutes: 60,
    meetUrl: "https://meet.google.com/",
  },
  {
    id: "class-002",
    courseId: "course-node-bootcamp",
    courseName: "Node.js + Express Bootcamp",
    courseThumbnailBg: "from-slate-900 via-emerald-800 to-teal-500",
    title: "Building REST APIs",
    instructorName: "Priya Sharma",
    scheduledAt: minutesFromNow(90),
    durationMinutes: 75,
    meetUrl: "https://meet.google.com/",
  },
];

export const MOCK_COMPLETED_CLASSES = [
  {
    id: "class-900",
    courseId: "course-react-2026",
    courseName: "React Masterclass",
    courseThumbnailBg: "from-indigo-900 via-violet-700 to-fuchsia-500",
    title: "React State Patterns",
    instructorName: "Alex Johnson",
    scheduledAt: minutesFromNow(-180),
    durationMinutes: 60,
    attendanceStatus: "present",
    recordingUrl: "https://example.com/recording",
    materials: [{ label: "Slides (PDF)", url: "https://example.com/slides.pdf" }],
  },
];


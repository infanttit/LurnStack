export const PATHS = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  LIVE_CLASSES: "/live-classes",
  LIVE_CLASS_DETAILS: "/live-classes/:classId",
  COURSES: "/courses",
  COURSE_DETAILS: "/courses/:courseId",
  CHENNAI: "/software-courses-in-chennai",
  CHENNAI_LOCAL: "/:locationSlug",
  CATEGORIES: "/categories",
  CATEGORY_DETAILS: "/categories/:categoryId",
  SEARCH: "/search",
  SESSIONS: "/sessions",
  SESSION_DETAILS: "/sessions/:sessionId",
  SESSION_DETAILS_LEGACY: "/session/:sessionId",
  UPCOMING_SESSIONS: "/dashboard/upcoming",
  CART: "/cart",
  CHECKOUT: "/checkout",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  COOKIES: "/cookies",
  DATA_DELETION: "/data-deletion",
  PROFILE: "/profile",
  STUDENT_ATTENDANCE: "/attendance",
  TRAINER_ATTENDANCE: "/trainer/attendance",
  ADMIN_ATTENDANCE: "/admin/attendance",
  PLANS: "/plans",
  ABOUT: "/about",
  ABOUT_COMPANY: "/about/company",
  ABOUT_PROJECTS: "/about/projects",
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  CERTIFICATIONS: "/my-learning/certifications",
  VERIFY_CERTIFICATE: "/verify/:credentialId?",
};

export function categoryHashPath(categoryId) {
  const id = String(categoryId || "").trim();
  if (!id) return PATHS.COURSES;
  return `${PATHS.COURSES}?category=${encodeURIComponent(id)}`;
}

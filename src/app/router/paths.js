export const PATHS = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  LIVE_CLASSES: "/live-classes",
  LIVE_CLASS_DETAILS: "/live-classes/:classId",
  COURSES: "/courses",
  COURSE_DETAILS: "/courses/:courseId",
  CATEGORIES: "/categories",
  CATEGORY_DETAILS: "/categories/:categoryId",
  SEARCH: "/search",
  SESSIONS: "/sessions",
  UPCOMING_SESSIONS: "/dashboard/upcoming",
  CART: "/cart",
  CHECKOUT: "/checkout",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  PROFILE: "/profile",
  STUDENT_ATTENDANCE: "/profile#attendance",
  TRAINER_ATTENDANCE: "/trainer/attendance",
  ADMIN_ATTENDANCE: "/admin/attendance",
  PLANS: "/plans",
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
};

export function categoryHashPath(categoryId) {
  const id = String(categoryId || "").trim();
  if (!id) return PATHS.CATEGORIES;
  return `${PATHS.CATEGORIES}#${encodeURIComponent(id)}`;
}

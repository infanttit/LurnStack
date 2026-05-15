export const PATHS = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  TRAINER_DASHBOARD: "/trainer-dashboard",
  LIVE_CLASSES: "/live-classes",
  LIVE_CLASS_DETAILS: "/live-classes/:classId",
  COURSES: "/courses",
  COURSE_DETAILS: "/courses/:courseId",
  CATEGORIES: "/categories",
  CATEGORY_DETAILS: "/categories/:categoryId",
  SEARCH: "/search",
  CART: "/cart",
  CHECKOUT: "/checkout",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  PROFILE: "/profile",
  PLANS: "/plans",
  LOGIN: "/login",
  SIGNUP: "/signup",
};

export function categoryHashPath(categoryId) {
  const id = String(categoryId || "").trim();
  if (!id) return PATHS.CATEGORIES;
  return `${PATHS.CATEGORIES}#${encodeURIComponent(id)}`;
}

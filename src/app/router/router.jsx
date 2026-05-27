import { Navigate, Route, Routes, useParams } from "react-router-dom";
import AppShell from "../AppShell";
import LandingPage from "../../pages/LandingPage";
import SimplePage from "../../pages/SimplePage";
import CategoriesPage from "../../categories/pages/Categories";
import SignupPage from "../../auth/pages/SignupPage";
import LoginPage from "../../auth/pages/LoginPage";
import ForgotPasswordPage from "../../auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../../auth/pages/ResetPasswordPage";
import ProfilePage from "../../auth/pages/ProfilePage";
import SearchPage from "../../pages/SearchPage";
import CartPage from "../../cart/pages/CartPage";
import CheckoutPage from "../../cart/pages/Checkoutpage .jsx";
import RequireAuth from "../../auth/components/RequireAuth";
import StudentDashboardPage from "../../live-classes/pages/StudentDashboardPage";
import LiveClassDetailsPage from "../../live-classes/pages/LiveClassDetailsPage";
import CoursesPage from "../../courses/pages/CoursesPage";
import CourseDetailsPage from "../../courses/pages/CourseDetailsPage";
import AttendanceReportPage from "../../attendance/pages/AttendanceReportPage";
import { PATHS, categoryHashPath } from "./paths";

function CategoryRedirect() {
  const { categoryId } = useParams();
  return <Navigate to={categoryHashPath(categoryId)} replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path={PATHS.HOME} element={<LandingPage />} />
        <Route
          path={PATHS.DASHBOARD}
          element={(
            <RequireAuth role="student">
              <StudentDashboardPage />
            </RequireAuth>
          )}
        />
        <Route
          path={PATHS.LIVE_CLASSES}
          element={(
            <RequireAuth role="student">
              <StudentDashboardPage />
            </RequireAuth>
          )}
        />
        <Route
          path={PATHS.LIVE_CLASS_DETAILS}
          element={(
            <RequireAuth role="student">
              <LiveClassDetailsPage />
            </RequireAuth>
          )}
        />
        <Route path={PATHS.COURSES} element={<CoursesPage />} />
        <Route path={PATHS.COURSE_DETAILS} element={<CourseDetailsPage />} />
        <Route path={PATHS.CATEGORIES} element={<CategoriesPage />} />
        <Route path={PATHS.CATEGORY_DETAILS} element={<CategoryRedirect />} />
        <Route path={PATHS.SEARCH} element={<SearchPage />} />
        <Route path={PATHS.CART} element={<CartPage />} />
        <Route
          path={PATHS.CHECKOUT}
          element={(
            <RequireAuth role="student">
              <CheckoutPage />
            </RequireAuth>
          )}
        />
        <Route path={PATHS.TERMS} element={<SimplePage title="Terms of Use" />} />
        <Route
          path={PATHS.PRIVACY}
          element={<SimplePage title="Privacy Policy" />}
        />
        <Route path={PATHS.PLANS} element={<SimplePage title="Plans" />} />
        <Route path={PATHS.LOGIN} element={<LoginPage />} />
        <Route path={PATHS.SIGNUP} element={<SignupPage />} />
        <Route path={PATHS.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={PATHS.RESET_PASSWORD} element={<ResetPasswordPage />} />
        <Route path={PATHS.PROFILE} element={<ProfilePage />} />
        <Route
          path={PATHS.TRAINER_ATTENDANCE}
          element={(
            <RequireAuth role="trainer">
              <AttendanceReportPage mode="trainer" />
            </RequireAuth>
          )}
        />
        <Route
          path={PATHS.ADMIN_ATTENDANCE}
          element={(
            <RequireAuth role="admin">
              <AttendanceReportPage mode="admin" />
            </RequireAuth>
          )}
        />
      </Route>
      <Route path="*" element={<Navigate to={PATHS.HOME} replace />} />
    </Routes>
  );
}

export const AppRoutes = AppRouter;

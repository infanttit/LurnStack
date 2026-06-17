import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "../AppShell";
import LandingPage from "../../pages/LandingPage";
import SimplePage from "../../pages/SimplePage";
import PrivacyPolicyPage from "../../pages/PrivacyPolicyPage";
import TermsAndConditionsPage from "../../pages/TermsAndConditionsPage";
import SignupPage from "../../auth/pages/SignupPage";
import LoginPage from "../../auth/pages/LoginPage";
import ForgotPasswordPage from "../../auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../../auth/pages/ResetPasswordPage";
import ProfilePage from "../../auth/pages/ProfilePage";
import SearchPage from "../../pages/SearchPage";
import CartPage from "../../cart/pages/CartPage";
import CheckoutPage from "../../cart/pages/Checkoutpage .jsx";
import RequireAuth from "../../auth/components/RequireAuth";
import MyLearningPage from "../../my-learning/pages/MyLearningPage";
import StudentDashboardPage from "../../live-classes/pages/StudentDashboardPage";
import LiveClassDetailsPage from "../../live-classes/pages/LiveClassDetailsPage";
import CoursesPage from "../../courses/pages/CoursesPage";
import CourseDetailsPage from "../../courses/pages/CourseDetailsPage";
import AttendanceReportPage from "../../attendance/pages/AttendanceReportPage";
import StudentSessionsPage from "../../pages/StudentSessionsPage";
import CompanyPage from "../../about/pages/CompanyPage";
import ProjectsPage from "../../about/pages/ProjectsPage";
import CertificationsPage from "../../my-learning/certifications/pages/CertificationsPage";
import VerifyCertificatePage from "../../my-learning/certifications/pages/VerifyCertificatePage";
import StudentAttendanceDashboardPage from "../../attendance/pages/StudentAttendanceDashboardPage";
import { PATHS } from "./paths";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path={PATHS.HOME} element={<LandingPage />} />
        <Route
          path={PATHS.DASHBOARD}
          element={(
            <RequireAuth role="student">
              <MyLearningPage />
            </RequireAuth>
          )}
        />
        <Route
          path={PATHS.CERTIFICATIONS}
          element={(
            <RequireAuth role="student">
              <CertificationsPage />
            </RequireAuth>
          )}
        />
        <Route path={PATHS.VERIFY_CERTIFICATE} element={<VerifyCertificatePage />} />
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
        <Route path={PATHS.CATEGORIES} element={<Navigate to={PATHS.COURSES} replace />} />
        <Route path={PATHS.CATEGORY_DETAILS} element={<Navigate to={PATHS.COURSES} replace />} />
        <Route path={PATHS.SEARCH} element={<SearchPage />} />
        <Route path={PATHS.SESSIONS} element={<StudentSessionsPage />} />
        <Route path={PATHS.SESSION_DETAILS} element={<CourseDetailsPage />} />
        <Route path={PATHS.SESSION_DETAILS_LEGACY} element={<CourseDetailsPage />} />
        <Route path={PATHS.UPCOMING_SESSIONS} element={<StudentSessionsPage />} />
        <Route path={PATHS.CART} element={<CartPage />} />
        <Route
          path={PATHS.CHECKOUT}
          element={(
            <RequireAuth role="student">
              <CheckoutPage />
            </RequireAuth>
          )}
        />
        <Route path={PATHS.TERMS} element={<TermsAndConditionsPage />} />
        <Route
          path={PATHS.PRIVACY}
          element={<PrivacyPolicyPage />}
        />
        <Route
          path={PATHS.DATA_DELETION}
          element={<Navigate to={PATHS.PRIVACY} replace />}
        />
        <Route path={PATHS.PLANS} element={<SimplePage title="Plans" />} />
        <Route path={PATHS.ABOUT} element={<Navigate to={PATHS.ABOUT_COMPANY} replace />} />
        <Route path={PATHS.ABOUT_COMPANY} element={<CompanyPage />} />
        <Route path={PATHS.ABOUT_PROJECTS} element={<ProjectsPage />} />
        <Route path={PATHS.LOGIN} element={<LoginPage />} />
        <Route path={PATHS.SIGNUP} element={<SignupPage />} />
        <Route path="/register" element={<SignupPage />} />
        <Route path={PATHS.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={PATHS.RESET_PASSWORD} element={<ResetPasswordPage />} />
        <Route path={PATHS.PROFILE} element={<ProfilePage />} />
        <Route
          path={PATHS.STUDENT_ATTENDANCE}
          element={(
            <RequireAuth role="student">
              <StudentAttendanceDashboardPage />
            </RequireAuth>
          )}
        />
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

import React from 'react';
import AppRouter from './app/router/router';

import CartPage from "./cart/pages/CartPage";
import CheckoutPage from "./cart/pages/Checkoutpage .jsx";
import RequireAuth from "./auth/components/RequireAuth";
import MyLearningPage from "./my-learning/pages/MyLearningPage";
import StudentDashboardPage from "./live-classes/pages/StudentDashboardPage";
import LiveClassDetailsPage from "./live-classes/pages/LiveClassDetailsPage";
import CoursesPage from "./courses/pages/CoursesPage";
import CourseDetailsPage from "./courses/pages/CourseDetailsPage";
import AttendanceReportPage from "./attendance/pages/AttendanceReportPage";
import StudentSessionsPage from "./pages/StudentSessionsPage";
import CompanyPage from "./about/pages/CompanyPage";
import ProjectsPage from "./about/pages/ProjectsPage";
import CertificationsPage from "./my-learning/certifications/pages/CertificationsPage";
import VerifyCertificatePage from "./my-learning/certifications/pages/VerifyCertificatePage";
import StudentAttendanceDashboardPage from "./attendance/pages/StudentAttendanceDashboardPage";

test('AppRouter components are valid', () => {
  const components = {
    CartPage,
    CheckoutPage,
    RequireAuth,
    MyLearningPage,
    StudentDashboardPage,
    LiveClassDetailsPage,
    CoursesPage,
    CourseDetailsPage,
    AttendanceReportPage,
    StudentSessionsPage,
    CompanyPage,
    ProjectsPage,
    CertificationsPage,
    VerifyCertificatePage,
    StudentAttendanceDashboardPage,
  };

  for (const [name, Component] of Object.entries(components)) {
    console.log(`Checking ${name}:`, typeof Component);
    if (typeof Component === 'object') {
      console.error(`ERROR: ${name} IS AN OBJECT!`, Component);
    }
  }
});

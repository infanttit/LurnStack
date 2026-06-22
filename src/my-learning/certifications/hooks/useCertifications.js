import { useState, useEffect, useCallback } from "react";
import {
  getCertificateSettings,
  getCompletedCourses,
  getCourseAttendance,
  getCourseEligibility,
  getCourseCertificate,
} from "../api/certificateApi";

export function useCertifications() {
  const [settings, setSettings] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Parallel API calls for settings and completed courses
      const [settingsData, completedCoursesData] = await Promise.all([
        getCertificateSettings().catch(() => null),
        getCompletedCourses().catch(() => []),
      ]);

      if (settingsData) {
        setSettings(settingsData);
      }

      const rawCompletedCourses = [...(completedCoursesData || [])];
      
      const MOCK_COURSE = {
        courseId: "mock-free-1",
        title: "React Development Masterclass (Demo)",
        trainerName: "Expert Trainer",
        category: "Frontend Development"
      };

      if (!rawCompletedCourses.some(c => c.courseId === "mock-free-1")) {
        rawCompletedCourses.push(MOCK_COURSE);
      }

      // Deduplicate courses by title to prevent duplicate cards
      const uniqueCoursesMap = new Map();
      for (const course of rawCompletedCourses) {
        const titleKey = String(course.title || "").trim().toLowerCase();
        if (!titleKey) continue;
        if (!uniqueCoursesMap.has(titleKey)) {
          uniqueCoursesMap.set(titleKey, course);
        } else {
          const existing = uniqueCoursesMap.get(titleKey);
          if (existing.courseId === "default" && course.courseId !== "default") {
            uniqueCoursesMap.set(titleKey, course);
          }
        }
      }
      const completedCourses = Array.from(uniqueCoursesMap.values());

      // Step 2: Fetch details for each course in parallel
      const coursesWithDetails = await Promise.all(
        completedCourses.map(async (course) => {
          const [attendance, eligibility, certificateStatus] = await Promise.all([
            getCourseAttendance(course.courseId).catch(() => ({ attended: 0, total: 0, pct: 0 })),
            getCourseEligibility(course.courseId).catch(() => "NONE"),
            getCourseCertificate(course.courseId).catch(() => null),
          ]);

          return {
            ...course,
            attendance,
            eligibility,
            certificate: certificateStatus,
          };
        })
      );

      setCourses(coursesWithDetails);
    } catch (err) {
      setError(err?.message || "Failed to load certifications data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const updateCourseCertificate = useCallback((courseId, newCertificate) => {
    setCourses((prev) =>
      prev.map((c) => (c.courseId === courseId ? { ...c, certificate: newCertificate } : c))
    );
  }, []);

  const updateCourseEligibility = useCallback((courseId, newEligibility, newPaymentStatus) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.courseId === courseId) {
          const updatedCert = c.certificate ? { ...c.certificate, paymentStatus: newPaymentStatus } : { paymentStatus: newPaymentStatus };
          return { ...c, eligibility: newEligibility, certificate: updatedCert };
        }
        return c;
      })
    );
  }, []);

  return {
    settings,
    courses,
    loading,
    error,
    refetch: fetchAllData,
    updateCourseCertificate,
    updateCourseEligibility,
  };
}

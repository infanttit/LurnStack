import { axiosClient } from "../../../shared/api/axiosClient";

export async function getCertificateSettings() {
  try {
    const { data } = await axiosClient.get("/api/certificates/settings");
    return data;
  } catch (error) {
    return { freeThreshold: 75, certificatePrice: 299 };
  }
}



const MOCK_COURSES = [
  { courseId: "mock-free-1", title: "React Development Masterclass (Demo)", trainerName: "Expert Trainer" }
];

export async function getCompletedCourses() {
  try {
    const { data } = await axiosClient.get("/api/certificates/eligible-courses");
    if (data && data.length > 0) return data;
    return MOCK_COURSES;
  } catch (error) {
    return MOCK_COURSES;
  }
}

export async function getCourseAttendance(courseId) {
  if (courseId === "mock-free-1") return { attended: 15, total: 15, pct: 100 };
  try {
    const { data } = await axiosClient.get(`/api/certificates/attendance/${encodeURIComponent(courseId)}`);
    return data;
  } catch (error) {
    return { attended: 0, total: 0, pct: 0 };
  }
}

export async function getCourseEligibility(courseId) {
  if (courseId === "mock-free-1") return { status: "FREE", attended: 3, required: 3 };
  try {
    const { data } = await axiosClient.get(`/api/certificates/eligibility/${encodeURIComponent(courseId)}`);
    return data?.data || data || { status: "NONE" };
  } catch (error) {
    return { status: "NONE" };
  }
}

export async function getCourseCertificate(courseId) {
  try {
    const { data } = await axiosClient.get(`/api/certificates?courseId=${encodeURIComponent(courseId)}`);
    return data;
  } catch (error) {
    return null;
  }
}

export async function generateCertificate(courseId, userData) {
  const { data } = await axiosClient.post("/api/certificates/generate", { courseId, ...userData });
  return data;
}

export async function verifyCertificate(credentialId) {
  const { data } = await axiosClient.get(`/api/certificates/verify/${encodeURIComponent(credentialId)}`);
  return data;
}

export async function downloadCertificate(certificateId) {
  const { data } = await axiosClient.get(`/api/certificates/${encodeURIComponent(certificateId)}/download`);
  return data;
}

export async function purchaseCertificate(courseId) {
  const { data } = await axiosClient.post("/api/certificates/purchase", { courseId });
  return data;
}


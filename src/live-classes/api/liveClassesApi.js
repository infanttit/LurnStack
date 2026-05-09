import {
  MOCK_COMPLETED_CLASSES,
  MOCK_ENROLLED_COURSES,
  MOCK_UPCOMING_CLASSES,
} from "../data/mockLiveClasses";
import { apiClient } from "../../app/services/apiClient";

const USE_MOCK = true;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function sortByScheduleAsc(a, b) {
  return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
}

export async function getUpcomingClasses() {
  if (USE_MOCK) {
    await sleep(450);
    return [...MOCK_UPCOMING_CLASSES].sort(sortByScheduleAsc);
  }
  return await apiClient.get("/student/upcoming-classes");
}

export async function getCompletedClasses() {
  if (USE_MOCK) {
    await sleep(450);
    return [...MOCK_COMPLETED_CLASSES].sort(sortByScheduleAsc);
  }
  return await apiClient.get("/student/completed-classes");
}

export async function getEnrolledCourses() {
  if (USE_MOCK) {
    await sleep(250);
    return [...MOCK_ENROLLED_COURSES];
  }
  return await apiClient.get("/student/enrolled-courses");
}

export async function joinClass(classId) {
  if (USE_MOCK) {
    await sleep(300);
    return { classId: String(classId), joinedAt: new Date().toISOString(), attendanceStatus: "present" };
  }
  return await apiClient.post(`/student/join-class/${classId}`);
}
